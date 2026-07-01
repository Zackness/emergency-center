import type { APIRoute } from "astro";
import { getSessionUser } from "@/lib/auth-center";
import { VOTE_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { communityVoteSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "community-votes:create",
    ...VOTE_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const parsed = parseBody(communityVoteSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { castCommunityVote } = await import("@/lib/community-feedback");
    const user = await getSessionUser(request, cookies);
    const data = parsed.data;

    const credibility = await castCommunityVote({
      content_type: data.content_type,
      content_id: data.content_id,
      verdict: data.verdict,
      voter_token: data.voter_token,
      profile_id: user?.id ?? null,
    });

    return new Response(JSON.stringify({ credibility }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: message === "Missing voter token" ? 400 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
