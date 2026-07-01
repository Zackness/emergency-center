import type { APIRoute } from "astro";
import { isValidLocale } from "@/i18n/config";
import { fetchLandingMapCatalog } from "@/lib/map/landing-catalog";
import {
  UNIFIED_MAP_CATALOG_MAX,
  UNIFIED_MAP_LAYERS,
} from "@/lib/map/catalog-layers";
import type { UnifiedMapLayer } from "@/types/map";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const localeParam = url.searchParams.get("lang") ?? "es";
    const locale = isValidLocale(localeParam) ? localeParam : "es";
    const zone = url.searchParams.get("zone") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const severity = url.searchParams.get("severity") ?? undefined;
    const layersParam = url.searchParams.get("layers");
    const layers = layersParam
      ? (layersParam.split(",").filter(Boolean) as UnifiedMapLayer[])
      : UNIFIED_MAP_LAYERS;

    const requestedLimit = Number(url.searchParams.get("limit") ?? "0") || 0;
    const maxTotal = requestedLimit > 0
      ? Math.min(UNIFIED_MAP_CATALOG_MAX, requestedLimit)
      : undefined;

    const catalog = await fetchLandingMapCatalog(locale, {
      zone,
      search,
      severity,
      layers,
      maxTotal,
    });

    return new Response(JSON.stringify(catalog), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
