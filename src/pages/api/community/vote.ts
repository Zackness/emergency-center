import type { APIRoute } from "astro";
import { getSessionUser } from "@/lib/auth-center";
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

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { castCommunityVote } = await import("@/lib/community-feedback");
    const user = await getSessionUser(request, cookies);

    if (!body.content_type || !body.content_id || !body.verdict || !body.voter_token) {
      return new Response(
        JSON.stringify({ error: "Missing content_type, content_id, verdict or voter_token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!VALID_TYPES.includes(body.content_type)) {
      return new Response(JSON.stringify({ error: "Invalid content_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (body.verdict !== "credible" && body.verdict !== "false") {
      return new Response(JSON.stringify({ error: "Invalid verdict" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const credibility = await castCommunityVote({
      content_type: body.content_type,
      content_id: String(body.content_id),
      verdict: body.verdict,
      voter_token: String(body.voter_token).trim(),
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
