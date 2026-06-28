import type { APIRoute } from "astro";
import { isValidLocale } from "@/i18n/config";
import { fetchLandingMapCatalog } from "@/lib/map/landing-catalog";
import type { UnifiedMapLayer } from "@/types/map";

export const prerender = false;

const ALL_LAYERS: UnifiedMapLayer[] = [
  "help_center",
  "hospital",
  "shelter",
  "damage",
  "quake",
  "redayuda",
  "platform",
  "children",
];

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
      : ALL_LAYERS;

    const maxTotal = Math.min(
      2500,
      Math.max(100, Number(url.searchParams.get("limit") ?? "2000") || 2000),
    );

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
        "Cache-Control": "public, max-age=120",
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
