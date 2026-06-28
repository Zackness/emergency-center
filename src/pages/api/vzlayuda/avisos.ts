import type { APIRoute } from "astro";
import { fetchHelpListings } from "@/lib/vzlayuda/feed";
import { getVzlaAyudaSnapshot } from "@/data/vzlayuda-resources";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const kindParam = url.searchParams.get("kind") ?? "all";
    const kind =
      kindParam === "offer" || kindParam === "request" ? kindParam : ("all" as const);
    const state = url.searchParams.get("state") ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const sourceParam = url.searchParams.get("source") ?? "all";
    const source =
      sourceParam === "vzlayuda" || sourceParam === "local" ? sourceParam : ("all" as const);
    const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit") ?? "80") || 80));
    const offset = Math.max(0, Number(url.searchParams.get("offset") ?? "0") || 0);

    const result = await fetchHelpListings({
      kind,
      state: state && state !== "all" ? state : undefined,
      category: category && category !== "all" ? category : undefined,
      search,
      source,
      limit,
      offset,
    });

    const snapshot = getVzlaAyudaSnapshot();

    return new Response(
      JSON.stringify({
        ...result,
        fetched_at: snapshot.fetched_at,
        vzlayuda_counts: snapshot.counts,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
