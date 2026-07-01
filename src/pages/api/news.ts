import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { newsSubmissionSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

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
    const body = await readJsonBody(request);
    const parsed = parseBody(newsSubmissionSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { createNewsSubmission } = await import("@/lib/news-credibility");
    const data = parsed.data;

    const item = await createNewsSubmission({
      title: data.title,
      summary: data.summary,
      source: data.source,
      source_url: data.source_url,
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
