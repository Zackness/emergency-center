import type { APIRoute } from "astro";
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

export const GET: APIRoute = async ({ url }) => {
  try {
    const contentType = url.searchParams.get("content_type") as CommunityContentType | null;
    const contentId = url.searchParams.get("content_id");
    const idsParam = url.searchParams.get("ids");
    const voterToken = url.searchParams.get("voter_token");
    const commentLimit = url.searchParams.get("comment_limit");

    if (!contentType || !VALID_TYPES.includes(contentType)) {
      return new Response(JSON.stringify({ error: "Invalid content_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { fetchCommunityFeedback, fetchCommunityFeedbackBatch } = await import(
      "@/lib/community-feedback"
    );

    if (idsParam) {
      const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 100);
      const credibility = await fetchCommunityFeedbackBatch(contentType, ids, voterToken);
      return new Response(JSON.stringify({ credibility }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!contentId) {
      return new Response(JSON.stringify({ error: "Missing content_id or ids" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const feedback = await fetchCommunityFeedback({
      content_type: contentType,
      content_id: contentId,
      voter_token: voterToken,
      comment_limit: commentLimit ? Number(commentLimit) : 20,
    });

    return new Response(JSON.stringify(feedback), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
