import type { DamageReport } from "@/types";
import type { DamageMapQuery, DamageMapStats, ImportedBuilding } from "./types";
import { DAMAGE_MAP_EXTERNAL_SOURCE } from "./adapter";
import { fetchExternalBuildings } from "./adapter";
import { LOCAL_DAMAGE_BUILDINGS } from "@/data/damage-buildings";
import { dedupeUrlList } from "./normalize";

let memoryCache: { at: number; items: DamageReport[] } | null = null;
const MEMORY_TTL_MS = 5 * 60 * 1000;

function importedToDamageReport(building: ImportedBuilding): DamageReport {
  const now = new Date().toISOString();
  return {
    id: `ext-${building.externalId}`,
    title: building.title,
    severity: building.severity,
    state: building.state,
    city: building.city,
    address: building.address,
    zone: building.zone,
    latitude: building.latitude,
    longitude: building.longitude,
    description: building.zone ? `Zona: ${building.zone}` : null,
    reporter_name: null,
    reporter_contact: null,
    source_name: "Terremoto Venezuela — Mapa de Daños",
    source_url: building.sourceUrl,
    image_urls: dedupeUrlList(building.imageUrls),
    external_reference: building.externalId,
    is_verified: building.isVerified,
    is_active: true,
    created_at: building.sourceSyncedAt || now,
    updated_at: building.sourceSyncedAt || now,
    source_synced_at: building.sourceSyncedAt,
  };
}

async function fetchExternalAsDamageReports(): Promise<DamageReport[]> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < MEMORY_TTL_MS) {
    return memoryCache.items;
  }

  const buildings = await fetchExternalBuildings();
  const items = buildings.map(importedToDamageReport);
  memoryCache = { at: now, items };
  return items;
}

function matchesQuery(report: DamageReport, query: DamageMapQuery): boolean {
  if (query.severity && query.severity !== "all" && report.severity !== query.severity) {
    return false;
  }
  if (query.state && query.state !== "all" && report.state !== query.state) {
    return false;
  }
  if (query.search?.trim()) {
    const needle = normalizeSearchText(query.search.trim());
    const haystack = normalizeSearchText(
      [report.title, report.address, report.city, report.state, report.zone]
        .filter(Boolean)
        .join(" ")
    );
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export function computeDamageStats(reports: DamageReport[]): DamageMapStats {
  const lastSynced = reports.reduce<string | null>((latest, report) => {
    const candidate = report.source_synced_at ?? report.updated_at;
    if (!latest || candidate > latest) return candidate;
    return latest;
  }, null);

  return {
    total: reports.length,
    collapsed: reports.filter((r) => r.severity === "collapsed").length,
    damaged: reports.filter((r) => r.severity === "damaged").length,
    evacuated: reports.filter((r) => r.severity === "evacuated").length,
    last_synced_at: lastSynced,
  };
}

export async function queryDamageReports(
  query: DamageMapQuery,
  fetchFromDb: () => Promise<DamageReport[]>
): Promise<{ items: DamageReport[]; total: number; stats: DamageMapStats }> {
  const all = await fetchFromDb();
  const filtered = all.filter((report) => matchesQuery(report, query));
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 50;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    total: filtered.length,
    stats: computeDamageStats(all),
  };
}

export async function fetchDamageReportsLive(
  fetchFromDb: () => Promise<DamageReport[]>
): Promise<DamageReport[]> {
  try {
    const fromDb = await fetchFromDb();
    if (fromDb.length > 0) return fromDb;
  } catch {
    // fallback below
  }

  if (LOCAL_DAMAGE_BUILDINGS.length > 0) {
    return LOCAL_DAMAGE_BUILDINGS;
  }

  try {
    return await fetchExternalAsDamageReports();
  } catch (err) {
    console.error("[damage-map] live fetch failed:", err);
    return [];
  }
}

export { DAMAGE_MAP_EXTERNAL_SOURCE };
