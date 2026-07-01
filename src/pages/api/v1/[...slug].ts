import type { APIRoute } from "astro";
import { guardPublicApiRead, publicApiJson, publicApiOptions } from "@/lib/public-api";
import { handlePublicApiRoute } from "@/lib/public-api/handlers";

export const prerender = false;

export const OPTIONS: APIRoute = async ({ request }) => publicApiOptions(request);

export const GET: APIRoute = async (context) => {
  const { request, params } = context;
  const blocked = guardPublicApiRead(request);
  if (blocked) {
    return new Response(blocked.body, {
      status: blocked.status,
      headers: {
        ...Object.fromEntries(blocked.headers.entries()),
        ...(await import("@/lib/public-api")).publicApiCorsHeaders(request),
      },
    });
  }

  const slug = params.slug ?? "";
  if (!slug) {
    return publicApiJson(request, { error: "Especifica un recurso, ej. /api/v1/hospitals" }, 400);
  }

  try {
    return await handlePublicApiRoute(request, slug, context);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return publicApiJson(request, { error: message }, 500);
  }
};
