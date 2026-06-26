import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.SYNC_SECRET ?? process.env.SYNC_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ error: "Sync not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { isDatabaseConfigured, prisma } = await import("@/lib/prisma");

    if (!isDatabaseConfigured()) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { syncDamageBuildings } = await import("@/lib/damage-map/sync");
    const result = await syncDamageBuildings(prisma);

    return new Response(JSON.stringify({ success: true, result }), {
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
