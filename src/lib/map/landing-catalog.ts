import { getRedAyudaSnapshot } from "@/data/redayuda-resources";
import {
  buildUnifiedMapMarkers,
  countMarkersByLayer,
} from "@/lib/map/unified-markers";
import { countChildMapStatuses } from "@/lib/map/children-case-markers";
import { fetchLiveChildrenEmergencyCases } from "@/lib/children-emergency/feed";
import {
  fetchHelpCenters,
  fetchHospitals,
  fetchShelters,
  fetchDamageReportsForPage,
} from "@/lib/data";
import type { Locale } from "@/i18n/config";
import type { UnifiedMapLayer, UnifiedMapMarker } from "@/types/map";

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
}

export interface LandingMapCatalogOptions {
  zone?: string;
  search?: string;
  severity?: string;
  layers?: UnifiedMapLayer[];
  maxTotal?: number;
}

export async function fetchLandingMapCatalog(
  locale: Locale,
  options: LandingMapCatalogOptions = {},
): Promise<LandingMapCatalog> {
  const layers = options.layers?.length ? options.layers : ALL_LAYERS;
  const maxTotal = Math.min(
    2500,
    Math.max(100, options.maxTotal ?? 2000),
  );

  const [helpCenters, hospitals, shelters, damageData, childCases] = await Promise.all([
    fetchHelpCenters(),
    fetchHospitals(),
    fetchShelters(),
    fetchDamageReportsForPage(),
    fetchLiveChildrenEmergencyCases().catch(() => []),
  ]);

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
    maxTotal: 5000,
  };

  const allMarkers = buildUnifiedMapMarkers({
    ...buildOptions,
    layers: ALL_LAYERS,
  });

  const filtered = buildUnifiedMapMarkers({
    ...buildOptions,
    layers,
    maxTotal,
  });

  const snapshot = getRedAyudaSnapshot();
  const stats = snapshot.stats;

  return {
    markers: filtered,
    total: filtered.length,
    totalAvailable: allMarkers.length,
    truncated: filtered.length < allMarkers.length,
    counts: countMarkersByLayer(allMarkers),
    redAyudaStats: stats
      ? {
          desaparecidos: stats.desaparecidos,
          salvo: stats.salvo,
          puntos: stats.puntos,
          atrapados: stats.atrapados,
          ninos: snapshot.ninos ?? 0,
        }
      : null,
    childrenStats: childCases.length ? countChildMapStatuses(childCases) : null,
  };
}

/** Catlogo inicial para la landing (SSR / build esttico). */
export async function fetchLandingMapCatalogForPage(locale: Locale): Promise<LandingMapCatalog> {
  return fetchLandingMapCatalog(locale, { maxTotal: 2000 });
}
