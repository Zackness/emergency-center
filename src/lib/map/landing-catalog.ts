import { fetchRedAyudaSnapshotFeed } from "@/lib/redayuda/snapshot-feed";
import {
  buildUnifiedMapMarkers,
  countMarkersByLayer,
} from "@/lib/map/unified-markers";
import { countChildMapStatuses } from "@/lib/map/children-case-markers";
import { fetchLiveChildrenEmergencyCases } from "@/lib/children-emergency/feed";
import { isNasaDamageReport } from "@/lib/damage-map/merge-nasa";
import {
  fetchHelpCenters,
  fetchHospitals,
  fetchShelters,
  fetchDamageReportsForPage,
} from "@/lib/data";
import {
  UNIFIED_MAP_CATALOG_MAX,
  UNIFIED_MAP_LAYERS,
} from "@/lib/map/catalog-layers";
import type { Locale } from "@/i18n/config";
import type { UnifiedMapLayer, UnifiedMapMarker } from "@/types/map";

export interface LandingMapCatalog {
  markers: UnifiedMapMarker[];
  total: number;
  totalAvailable: number;
  truncated: boolean;
  counts: Partial<Record<UnifiedMapLayer, number>>;
  redAyudaStats: {
    desaparecidos: number;
    salvo: number;
    puntos: number;
    atrapados: number;
    ninos: number;
  } | null;
  childrenStats: {
    total: number;
    missing: number;
    critical: number;
    nexosignal: number;
    redayuda: number;
  } | null;
  damageStats: {
    communityTotal: number;
    onMap: number;
  } | null;
}

export interface LandingMapCatalogOptions {
  zone?: string;
  search?: string;
  severity?: string;
  layers?: UnifiedMapLayer[];
  maxTotal?: number;
}

/**
 * Catálogo canónico del mapa general del sitio.
 * Usa las mismas fuentes que /danos, centros-ayuda, niños, etc.
 */
export async function fetchLandingMapCatalog(
  locale: Locale,
  options: LandingMapCatalogOptions = {},
): Promise<LandingMapCatalog> {
  const layers = options.layers?.length ? options.layers : UNIFIED_MAP_LAYERS;

  const baseHelpCenters = await fetchHelpCenters();
  const { queryHelpCentersCatalog } = await import("@/lib/help-centers/feed");
  const helpCenterCatalog = await queryHelpCentersCatalog(baseHelpCenters, {
    limit: 10_000,
  });

  const [hospitals, shelters, damageData, childCases] = await Promise.all([
    fetchHospitals(),
    fetchShelters(),
    fetchDamageReportsForPage(),
    fetchLiveChildrenEmergencyCases().catch(() => []),
  ]);

  const helpCenters = helpCenterCatalog.centers;
  const communityDamage = damageData.items.filter((d) => !isNasaDamageReport(d));
  const communityTotal =
    damageData.meta?.community_total ?? communityDamage.length;

  const layerLimits = {
    help_center: helpCenters.length,
    hospital: hospitals.length,
    shelter: shelters.length,
    damage: damageData.items.length,
    quake: 50,
    redayuda: 50,
    platform: 50,
    children: childCases.length + 10,
  };

  const estimatedTotal =
    helpCenters.length +
    hospitals.length +
    shelters.length +
    damageData.items.length +
    childCases.length +
    200;

  const maxTotal = Math.min(
    UNIFIED_MAP_CATALOG_MAX,
    Math.max(estimatedTotal, options.maxTotal ?? estimatedTotal),
  );

  const buildOptions = {
    locale,
    zone: options.zone,
    search: options.search,
    severity: options.severity,
    helpCenters,
    hospitals,
    shelters,
    damageReports: damageData.items,
    childCases,
    limits: layerLimits,
    maxTotal,
  };

  const allMarkers = buildUnifiedMapMarkers({
    ...buildOptions,
    layers: UNIFIED_MAP_LAYERS,
  });

  const filtered = buildUnifiedMapMarkers({
    ...buildOptions,
    layers,
    maxTotal,
  });

  const snapshot = await fetchRedAyudaSnapshotFeed();
  const stats = snapshot.stats;

  const counts = countMarkersByLayer(allMarkers);
  if (communityTotal > 0) {
    counts.damage = communityTotal;
  }
  const childrenStats = childCases.length ? countChildMapStatuses(childCases) : null;
  if (childrenStats?.total) {
    counts.children = childrenStats.total;
  }

  const damageStats =
    communityTotal > 0
      ? {
          communityTotal,
          onMap: damageData.meta?.map_markers ?? damageData.items.length,
        }
      : null;

  return {
    markers: filtered,
    total: filtered.length,
    totalAvailable: allMarkers.length,
    truncated: filtered.length < allMarkers.length,
    counts,
    redAyudaStats: stats
      ? {
          desaparecidos: stats.desaparecidos,
          salvo: stats.salvo,
          puntos: stats.puntos,
          atrapados: stats.atrapados,
          ninos: snapshot.ninos ?? 0,
        }
      : null,
    childrenStats,
    damageStats,
  };
}

/** Alias explícito: mapa general = catálogo unificado del sitio. */
export const fetchUnifiedMapCatalog = fetchLandingMapCatalog;

/** Catálogo inicial para la landing (SSR). */
export async function fetchLandingMapCatalogForPage(locale: Locale): Promise<LandingMapCatalog> {
  return fetchLandingMapCatalog(locale);
}
