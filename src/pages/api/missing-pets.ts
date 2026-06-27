import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const { queryMissingPets } = await import("@/lib/missing-pets/feed");
    const q = url.searchParams.get("q") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const species = url.searchParams.get("species") ?? undefined;
    const state = url.searchParams.get("state") ?? undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "24");

    const result = await queryMissingPets({
      q,
      status: status && status !== "all" ? (status as "lost" | "found") : "all",
      species:
        species && species !== "all" ? (species as "dog" | "cat" | "other") : "all",
      state: state && state !== "all" ? state : undefined,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? Math.min(10000, Math.max(1, limit)) : 24,
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
