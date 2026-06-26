import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const { fetchNewsFeed } = await import("@/lib/news-credibility");
    const sort = url.searchParams.get("sort") as
      | "newest"
      | "most_credible"
      | "most_disputed"
      | null;
    const voterToken = url.searchParams.get("voter_token");

    const items = await fetchNewsFeed({
      sort: sort ?? "newest",
      voter_token: voterToken,
    });

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "news:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, any>>(request);
    const { createNewsSubmission } = await import("@/lib/news-credibility");

    const required = ["title", "summary", "source", "source_url"];
    for (const field of required) {
      if (!body[field]?.trim()) {
        return new Response(
          JSON.stringify({ error: `Missing field: ${field}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    try {
      new URL(body.source_url);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid source_url" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const item = await createNewsSubmission({
      title: body.title.trim(),
      summary: body.summary.trim(),
      source: body.source.trim(),
      source_url: body.source_url.trim(),
    });

    return new Response(JSON.stringify({ item }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
