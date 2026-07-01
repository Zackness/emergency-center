import type { APIRoute } from "astro";
import { getSessionUser } from "@/lib/auth-center";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { CommunityContentType } from "@/types/community-feedback";
import { communityCommentSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

const VALID_TYPES: CommunityContentType[] = [
  "help_center",
  "hospital",
  "shelter",
  "agency",
  "damage_report",
  "missing_person",
  "news",
  "solidarity_company",
  "external_link",
];

async function profileName(userId: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { fullName: true, email: true },
  });
  return profile?.fullName?.trim() || profile?.email || null;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const contentType = url.searchParams.get("content_type") as CommunityContentType | null;
    const contentId = url.searchParams.get("content_id");
    const limit = url.searchParams.get("limit");
    const parsedLimit = Number(limit ?? "50");
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(100, Math.max(1, parsedLimit))
      : 50;

    if (!contentType || !contentId || !VALID_TYPES.includes(contentType)) {
      return new Response(JSON.stringify({ error: "Invalid content_type or content_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { fetchCommunityFeedback } = await import("@/lib/community-feedback");
    const feedback = await fetchCommunityFeedback({
      content_type: contentType,
      content_id: contentId,
      comment_limit: safeLimit,
    });

    return new Response(
      JSON.stringify({ comments: feedback.comments, comment_count: feedback.comment_count }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "community-comments:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const parsed = parseBody(communityCommentSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { createCommunityComment } = await import("@/lib/community-feedback");
    const user = await getSessionUser(request, cookies);
    const data = parsed.data;

    const comment = await createCommunityComment({
      content_type: data.content_type,
      content_id: data.content_id,
      body: data.body,
      author_name: data.author_name,
      voter_token: data.voter_token,
      profile_id: user?.id ?? null,
      profile_name: user ? await profileName(user.id) : null,
    });

    return new Response(JSON.stringify({ comment }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Comment too short" || message === "Comment too long" ? 400 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
};
