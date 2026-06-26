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
    const body = await request.json().catch(() => ({}));
    const { isDatabaseConfigured, prisma } = await import("@/lib/prisma");

    if (!isDatabaseConfigured()) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { syncMissingPersons } = await import("@/lib/missing-persons/sync");
    const results = await syncMissingPersons(prisma, {
      sourceSlugs: body.sourceSlugs,
      offset: body.offset != null ? Number(body.offset) : undefined,
      limit: body.limit != null ? Number(body.limit) : 500,
      batchSize: body.batchSize != null ? Number(body.batchSize) : 200,
    });

    return new Response(JSON.stringify({ success: true, results }), {
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

export const GET: APIRoute = async () => {
  try {
    const { fetchMissingPersonsStats } = await import("@/lib/data");
    const stats = await fetchMissingPersonsStats();
    return new Response(JSON.stringify(stats), {
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
