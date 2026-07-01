import type { DamageReport } from "@/types";
import { LOCAL_DAMAGE_BUILDINGS } from "@/data/damage-buildings";
import { DATA_CACHE_SLUGS, getDataCache } from "@/lib/data-cache";
import { mapDamageReport } from "@/lib/mappers";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { importedToDamageReport } from "@/lib/damage-map/feed";
import { loadCommunityDamageReports } from "@/lib/damage-map/community-feed";
import { isNasaDamageReport, mergeNasaDamageReports } from "@/lib/damage-map/merge-nasa";
import { mergePriorityRescueSites } from "@/lib/damage-map/merge-priority";
import { mergeUrgentRescueAlerts } from "@/lib/damage-map/merge-urgent";
import { normalizeSearchText } from "@/lib/damage-map/normalize";
import { computeDamageStats } from "@/lib/damage-map/feed";
import type { DamageMapStats } from "@/lib/damage-map/types";
import { NASA_DAMAGE_ESTIMATE_TOTAL } from "@/lib/damage-map/nasa-config";
import { LOCAL_NASA_DAMAGE_BUILDINGS, NASA_DAMAGE_SNAPSHOT_COUNT } from "@/data/nasa-damage-buildings";
import { PRIORITY_RESCUE_SITES } from "@/data/priority-rescue-sites";
import { yummyReportsToBuildings } from "@/lib/yummyrides-sos/normalize";
import type { YummySosSnapshot } from "@/lib/yummyrides-sos/types";
import { YUMMY_SOS_SOURCE_URL } from "@/lib/yummyrides-sos/types";

export interface UnifiedDamageMeta {
  community_total: number;
  nasa_estimate: number;
  nasa_plotted: number;
  map_markers: number;
  priority_rescue: number;
  sources: Record<string, number>;
}

export interface UnifiedDamageCatalog {
  items: DamageReport[];
  communityItems: DamageReport[];
  stats: DamageMapStats;
  meta: UnifiedDamageMeta;
  total: number;
}

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)}:${lng.toFixed(4)}`;
}

function isSameDamageSite(a: DamageReport, b: DamageReport): boolean {
  if (isNasaDamageReport(a) || isNasaDamageReport(b)) return false;
  if (a.id === b.id) return true;
  if (
    a.external_reference &&
    b.external_reference &&
    a.external_reference === b.external_reference
  ) {
    return true;
  }
  if (coordKey(a.latitude, a.longitude) !== coordKey(b.latitude, b.longitude)) {
    return false;
  }
  const titleA = normalizeSearchText(a.title);
  const titleB = normalizeSearchText(b.title);
  if (!titleA || !titleB) return true;
  return titleA === titleB || titleA.includes(titleB) || titleB.includes(titleA);
}

function preferDamageReport(current: DamageReport, candidate: DamageReport): DamageReport {
  const score = (report: DamageReport) =>
    (report.image_urls?.length ?? 0) * 3 +
    (report.is_verified ? 2 : 0) +
    (report.source_synced_at ? 1 : 0) +
    (report.description ? 1 : 0);

  return score(candidate) > score(current) ? candidate : current;
}

/** Une reportes de terremoto, Yummy SOS, BD y snapshots sin duplicar por ref o coordenadas. */
export function dedupeDamageReports(reports: DamageReport[]): DamageReport[] {
  const merged: DamageReport[] = [];

  for (const report of reports) {
    if (!report.is_active) continue;
    const existingIndex = merged.findIndex((item) => isSameDamageSite(item, report));
    if (existingIndex === -1) {
      merged.push(report);
      continue;
    }
    merged[existingIndex] = preferDamageReport(merged[existingIndex]!, report);
  }

  return merged;
}

function countBySource(reports: DamageReport[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const report of reports) {
    const key = report.source_name?.trim() || "Sin fuente";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

async function loadDamageReportsFromDb(): Promise<DamageReport[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const rows = await prisma.damageReport.findMany({
      where: { isActive: true },
      orderBy: [{ sourceSyncedAt: "desc" }, { updatedAt: "desc" }],
    });
    return rows.map(mapDamageReport);
  } catch {
    return [];
  }
}

async function loadYummyDamageFromCache(): Promise<DamageReport[]> {
  const cached = await getDataCache<YummySosSnapshot>(DATA_CACHE_SLUGS.YUMMYRIDES_SOS);
  if (!cached?.payload?.damage_reports?.length) return [];

  const syncedAt = cached.payload.fetched_at ?? cached.fetched_at;
  const buildings = yummyReportsToBuildings(cached.payload.damage_reports, syncedAt);

  return buildings.map((building) => {
    const report = importedToDamageReport(building);
    return {
      ...report,
      id: `yummy-${building.externalId}`,
      source_name: "Yummy SOS — Reportes de daño",
      source_url: `${YUMMY_SOS_SOURCE_URL}/reportes`,
      external_reference: `yummyrides:${building.externalId}`,
    };
  });
}

async function loadAllCommunityReports(): Promise<DamageReport[]> {
  const fromDb = await loadDamageReportsFromDb();
  const fromYummyCache = await loadYummyDamageFromCache();

  const buckets: DamageReport[] = [...fromDb];

  // Con datos en BD, la tabla damage_reports es la fuente principal (sync vía allied-scrapers).
  if (fromDb.length === 0) {
    buckets.push(...(await loadCommunityDamageReports()));
  }

  buckets.push(...fromYummyCache);

  if (!buckets.length && LOCAL_DAMAGE_BUILDINGS.length) {
    buckets.push(...LOCAL_DAMAGE_BUILDINGS);
  }

  const deduped = dedupeDamageReports(buckets);
  return mergeUrgentRescueAlerts(mergePriorityRescueSites(deduped));
}

export async function fetchUnifiedDamageCatalog(): Promise<UnifiedDamageCatalog> {
  const communityItems = await loadAllCommunityReports();
  const items = mergeNasaDamageReports(communityItems);
  const stats = computeDamageStats(communityItems);
  const nasaPlotted = LOCAL_NASA_DAMAGE_BUILDINGS.length || NASA_DAMAGE_SNAPSHOT_COUNT;

  const meta: UnifiedDamageMeta = {
    community_total: communityItems.length,
    nasa_estimate: NASA_DAMAGE_ESTIMATE_TOTAL,
    nasa_plotted: nasaPlotted,
    map_markers: items.length,
    priority_rescue: PRIORITY_RESCUE_SITES.length,
    sources: countBySource(communityItems),
  };

  return {
    items,
    communityItems,
    stats: {
      ...stats,
      total: communityItems.length,
      community_total: communityItems.length,
      nasa_estimate: meta.nasa_estimate,
      nasa_plotted: meta.nasa_plotted,
      priority_rescue: meta.priority_rescue,
      map_markers: meta.map_markers,
    },
    meta,
    total: items.length,
  };
}
