import type { HelpCenter } from "@/types";
import {
  extractHelpCenterMarker,
  fetchAllCentroacopioCenters,
  fetchAllCentroacopioDeliveries,
  mapCenterToHelpCenter,
  mapDeliveryToView,
  type CentroacopioCenter,
} from "@/lib/help-centers/centroacopio";
import type {
  CentroacopioDeliveryView,
  HelpCentersCatalogQuery,
  HelpCentersCatalogStats,
} from "@/lib/help-centers/types";
import {
  LOCAL_CENTROACOPIO_CENTERS,
  LOCAL_CENTROACOPIO_DELIVERIES,
  LOCAL_CENTROACOPIO_FETCHED_AT,
} from "@/data/centroacopio-local";
import { centerMatchesZone } from "@/data/emergency-zones";
import { normalizeSearchText } from "@/lib/damage-map/normalize";

const MEMORY_TTL_MS = 5 * 60 * 1000;

let centersCache: { at: number; items: HelpCenter[] } | null = null;
let deliveriesCache: { at: number; items: CentroacopioDeliveryView[] } | null = null;

function centroacopioRowToHelpCenter(row: CentroacopioCenter): HelpCenter {
  const mapped = mapCenterToHelpCenter(row);
  const now = row.createdAt || new Date().toISOString();
  const source = row.source?.trim() || "centroacopio.site";
  return {
    id: `${source.replace(/[^a-z0-9]+/gi, "-")}-${row.id}`,
    name: mapped.name,
    description: mapped.description,
    type: mapped.type,
    state: mapped.state,
    city: mapped.city,
    address: mapped.address,
    latitude: mapped.latitude,
    longitude: mapped.longitude,
    phone: mapped.phone,
    email: null,
    schedule: mapped.schedule,
    accepts: mapped.accepts,
    is_verified: mapped.isVerified,
    is_active: mapped.isActive,
    created_at: now,
    updated_at: now,
  };
}

function extractCentroacopioId(description: string | null | undefined): string | null {
  return extractHelpCenterMarker(description)?.id ?? null;
}

/** Fusiona catálogo local/BD con registros scrapeados de centroacopio.site. */
export function mergeHelpCenters(
  baseCenters: HelpCenter[],
  scrapedCenters: HelpCenter[]
): HelpCenter[] {
  const syncedIds = new Set<string>();
  const syncedNameAddress = new Set<string>();

  for (const center of baseCenters) {
    const externalId = extractCentroacopioId(center.description);
    if (externalId) syncedIds.add(externalId);
    syncedNameAddress.add(
      `${center.name.trim().toLowerCase()}|${center.address.trim().toLowerCase()}`
    );
  }

  const merged = [...baseCenters];

  for (const scraped of scrapedCenters) {
    const externalId = extractCentroacopioId(scraped.description);
    if (!externalId) continue;
    if (syncedIds.has(externalId)) continue;

    const key = `${scraped.name.trim().toLowerCase()}|${scraped.address.trim().toLowerCase()}`;
    if (syncedNameAddress.has(key)) continue;

    merged.push(scraped);
    syncedNameAddress.add(key);
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function fetchLiveCentroacopioCenters(): Promise<HelpCenter[]> {
  const now = Date.now();
  if (centersCache && now - centersCache.at < MEMORY_TTL_MS) {
    return centersCache.items;
  }

  try {
    const rows = await fetchAllCentroacopioCenters();
    const items = rows.map(centroacopioRowToHelpCenter);
    centersCache = { at: now, items };
    return items;
  } catch (err) {
    console.error("[help-centers] centroacopio live fetch failed:", err);
    if (LOCAL_CENTROACOPIO_CENTERS.length) return LOCAL_CENTROACOPIO_CENTERS;
    return [];
  }
}

export async function fetchLiveCentroacopioDeliveries(): Promise<CentroacopioDeliveryView[]> {
  const now = Date.now();
  if (deliveriesCache && now - deliveriesCache.at < MEMORY_TTL_MS) {
    return deliveriesCache.items;
  }

  try {
    const rows = await fetchAllCentroacopioDeliveries();
    const items = rows.map(mapDeliveryToView);
    deliveriesCache = { at: now, items };
    return items;
  } catch (err) {
    console.error("[help-centers] centroacopio deliveries fetch failed:", err);
    if (LOCAL_CENTROACOPIO_DELIVERIES.length) return LOCAL_CENTROACOPIO_DELIVERIES;
    return [];
  }
}

function matchesCenterQuery(center: HelpCenter, query: HelpCentersCatalogQuery): boolean {
  if (query.city && query.city !== "all") {
    if (!centerMatchesZone(center, query.city)) return false;
  }
  if (query.search?.trim()) {
    const needle = normalizeSearchText(query.search.trim());
    const haystack = normalizeSearchText(
      [center.name, center.city, center.state, center.address, center.description]
        .filter(Boolean)
        .join(" ")
    );
    if (!haystack.includes(needle)) return false;
  }
  return center.is_active;
}

function matchesDeliveryQuery(delivery: CentroacopioDeliveryView, query: HelpCentersCatalogQuery): boolean {
  if (query.city && query.city !== "all") {
    if (!centerMatchesZone({ city: delivery.city, state: delivery.state }, query.city)) {
      return false;
    }
  }
  if (query.search?.trim()) {
    const needle = normalizeSearchText(query.search.trim());
    const haystack = normalizeSearchText(
      [delivery.name, delivery.city, delivery.state, delivery.sector, delivery.nearby_address, delivery.phone]
        .filter(Boolean)
        .join(" ")
    );
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export async function queryHelpCentersCatalog(
  baseCenters: HelpCenter[],
  query: HelpCentersCatalogQuery = {}
) {
  const scraped = await fetchLiveCentroacopioCenters();
  const deliveries = await fetchLiveCentroacopioDeliveries();
  const centers = mergeHelpCenters(baseCenters, scraped);

  const filteredCenters = centers.filter((center) => matchesCenterQuery(center, query));
  const filteredDeliveries = deliveries.filter((delivery) => matchesDeliveryQuery(delivery, query));

  const offset = query.offset ?? 0;
  const limit = query.limit ?? 10000;

  const stats: HelpCentersCatalogStats = {
    centers_total: filteredCenters.length,
    deliveries_total: filteredDeliveries.length,
    centroacopio_centers: scraped.length,
    last_synced_at: LOCAL_CENTROACOPIO_FETCHED_AT,
  };

  return {
    centers: filteredCenters.slice(offset, offset + limit),
    deliveries: filteredDeliveries.slice(offset, offset + limit),
    total_centers: filteredCenters.length,
    total_deliveries: filteredDeliveries.length,
    stats,
  };
}
