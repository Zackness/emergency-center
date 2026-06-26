import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { castNewsVote } = await import("@/lib/news-credibility");

    if (!body.news_id || !body.verdict || !body.voter_token) {
      return new Response(
        JSON.stringify({ error: "Missing news_id, verdict or voter_token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (body.verdict !== "credible" && body.verdict !== "false") {
      return new Response(
        JSON.stringify({ error: "Invalid verdict" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const credibility = await castNewsVote({
      news_id: body.news_id,
      verdict: body.verdict,
      voter_token: String(body.voter_token).trim(),
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
