import type {
  ChildEmergencyCase,
  ChildrenEmergencyQuery,
  ChildrenEmergencyStats,
} from "./types";
import { LOCAL_CHILDREN_EMERGENCY_CASES } from "@/data/children-emergency-records";
import { fetchNexosignalRecords } from "./nexosignal";
import { fetchRedAyudaNinosRecords } from "./redayuda";
import { importedToChildCase } from "./mapper";

const MEMORY_TTL_MS = 5 * 60 * 1000;

let memoryCache: { at: number; cases: ChildEmergencyCase[] } | null = null;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesQuery(item: ChildEmergencyCase, query: ChildrenEmergencyQuery): boolean {
  if (query.source && query.source !== "all" && item.source !== query.source) {
    return false;
  }
  if (query.health && query.health !== "all" && item.health_status !== query.health) {
    return false;
  }
  if (query.hospital && query.hospital !== "all") {
    if (!item.hospital || item.hospital !== query.hospital) return false;
  }
  if (query.q?.trim()) {
    const needle = normalizeSearchText(query.q.trim());
    const haystack = normalizeSearchText(
      [
        item.name,
        item.hospital,
        item.found_location,
        item.child_statement,
        item.contact_phone,
        item.source_name,
      ]
        .filter(Boolean)
        .join(" ")
    );
    if (!haystack.includes(needle)) return false;
  }
  return item.is_active;
}

export function computeChildrenEmergencyStats(
  cases: ChildEmergencyCase[]
): ChildrenEmergencyStats {
  const lastSynced = cases.reduce<string | null>((latest, item) => {
    if (!latest || item.updated_at > latest) return item.updated_at;
    return latest;
  }, null);

  return {
    total: cases.length,
    nexosignal: cases.filter((c) => c.source === "nexosignal").length,
    redayuda: cases.filter((c) => c.source === "redayuda").length,
    last_synced_at: lastSynced,
  };
}

export function listChildEmergencyHospitals(cases: ChildEmergencyCase[]): string[] {
  const hospitals = new Set<string>();
  for (const item of cases) {
    if (item.hospital) hospitals.add(item.hospital);
  }
  return [...hospitals].sort((a, b) => a.localeCompare(b, "es"));
}

export async function fetchLiveChildrenEmergencyCases(): Promise<ChildEmergencyCase[]> {
  return fetchLiveChildrenEmergencyCasesInternal();
}

async function fetchLiveChildrenEmergencyCasesInternal(): Promise<ChildEmergencyCase[]> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < MEMORY_TTL_MS) {
    return memoryCache.cases;
  }

  const syncedAt = new Date().toISOString();

  try {
    const [nexosignalRows, redayudaRows] = await Promise.all([
      fetchNexosignalRecords(),
      fetchRedAyudaNinosRecords(),
    ]);

    const cases = [
      ...nexosignalRows.map((item) =>
        importedToChildCase({ source: "nexosignal", item }, syncedAt)
      ),
      ...redayudaRows.map((item) => importedToChildCase({ source: "redayuda", item }, syncedAt)),
    ].sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());

    memoryCache = { at: now, cases };
    return cases;
  } catch (err) {
    console.error("[children-emergency] live fetch failed, using local snapshot:", err);
    if (LOCAL_CHILDREN_EMERGENCY_CASES.length > 0) return LOCAL_CHILDREN_EMERGENCY_CASES;
    throw err;
  }
}

export async function fetchChildrenEmergencyStats(): Promise<ChildrenEmergencyStats> {
  const cases = await fetchLiveChildrenEmergencyCases();
  return computeChildrenEmergencyStats(cases);
}

export async function queryChildrenEmergencyCases(
  query: ChildrenEmergencyQuery
): Promise<{ items: ChildEmergencyCase[]; total: number; stats: ChildrenEmergencyStats }> {
  const all = await fetchLiveChildrenEmergencyCases();
  const filtered = all.filter((item) => matchesQuery(item, query));
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 24));
  const start = (page - 1) * limit;

  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    stats: computeChildrenEmergencyStats(all),
  };
}

export async function fetchAllChildrenEmergencyCasesForSnapshot(): Promise<ChildEmergencyCase[]> {
  memoryCache = null;
  return fetchLiveChildrenEmergencyCases();
}
