import type { APIRoute } from "astro";
import { fetchInventoryNeedSummaries } from "@/lib/center-dashboard";
import { canShowPublicInventory } from "@/lib/help-centers/public";
import { isDatabaseConfigured } from "@/lib/prisma";

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

    const inventoryCenterIds = result.centers
      .filter((center) => canShowPublicInventory(center))
      .map((center) => center.id);
    const needSummaries = isDatabaseConfigured()
      ? await fetchInventoryNeedSummaries(inventoryCenterIds)
      : new Map();

    const centers = result.centers.map((center) => ({
      ...center,
      needs_summary: needSummaries.get(center.id) ?? null,
    }));

    return new Response(JSON.stringify({ ...result, centers }), {
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
