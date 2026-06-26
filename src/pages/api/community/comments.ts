import type { APIRoute } from "astro";
import { getSessionUser } from "@/lib/auth-center";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { CommunityContentType } from "@/types/community-feedback";

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
      comment_limit: limit ? Number(limit) : 50,
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
  try {
    const body = await request.json();
    const { createCommunityComment } = await import("@/lib/community-feedback");
    const user = await getSessionUser(request, cookies);

    if (!body.content_type || !body.content_id || !body.body) {
      return new Response(
        JSON.stringify({ error: "Missing content_type, content_id or body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!VALID_TYPES.includes(body.content_type)) {
      return new Response(JSON.stringify({ error: "Invalid content_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const comment = await createCommunityComment({
      content_type: body.content_type,
      content_id: String(body.content_id),
      body: String(body.body),
      author_name: body.author_name ? String(body.author_name) : null,
      voter_token: body.voter_token ? String(body.voter_token).trim() : null,
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
