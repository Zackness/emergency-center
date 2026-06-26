import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const { fetchHelpCenters } = await import("@/lib/data");
    const { queryHelpCentersCatalog } = await import("@/lib/help-centers/feed");

    const search = url.searchParams.get("search") ?? undefined;
    const city = url.searchParams.get("city") ?? undefined;
    const limit = Number(url.searchParams.get("limit") ?? "10000");
    const offset = Number(url.searchParams.get("offset") ?? "0");

    const baseCenters = await fetchHelpCenters();
    const result = await queryHelpCentersCatalog(baseCenters, {
      search,
      city,
      limit: Number.isFinite(limit) ? Math.min(10000, Math.max(1, limit)) : 10000,
      offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
