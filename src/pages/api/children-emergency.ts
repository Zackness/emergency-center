import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const { queryChildrenEmergencyCases } = await import("@/lib/children-emergency/feed");
    const q = url.searchParams.get("q") ?? undefined;
    const source = url.searchParams.get("source") ?? undefined;
    const health = url.searchParams.get("health") ?? undefined;
    const hospital = url.searchParams.get("hospital") ?? undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "24");

    const result = await queryChildrenEmergencyCases({
      q,
      source:
        source && source !== "all"
          ? (source as "nexosignal" | "redayuda")
          : "all",
      health:
        health && health !== "all"
          ? (health as "stable" | "critical" | "unidentified" | "unknown")
          : "all",
      hospital: hospital && hospital !== "all" ? hospital : undefined,
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
