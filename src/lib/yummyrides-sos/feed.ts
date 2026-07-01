import { getDataCache, DATA_CACHE_SLUGS } from "@/lib/data-cache";
import type { YummySosSnapshot } from "./types";
import { YUMMY_SOS_SOURCE_URL } from "./types";

let localSnapshot: YummySosSnapshot | null = null;

async function loadLocalSnapshot(): Promise<YummySosSnapshot> {
  if (localSnapshot) return localSnapshot;
  try {
    const mod = await import("@/data/yummyrides-sos.json");
    localSnapshot = mod.default as YummySosSnapshot;
    return localSnapshot;
  } catch {
    return {
      source: YUMMY_SOS_SOURCE_URL,
      fetched_at: new Date(0).toISOString(),
      stats: {
        report_count: null,
        acopio_count: null,
        reports_in_snapshot: 0,
        centers_in_snapshot: 0,
      },
      damage_reports: [],
      help_centers: [],
    };
  }
}

export async function fetchYummySosFeed(): Promise<YummySosSnapshot> {
  const cached = await getDataCache<YummySosSnapshot>(DATA_CACHE_SLUGS.YUMMYRIDES_SOS);
  if (cached?.payload?.damage_reports) {
    return {
      ...cached.payload,
      fetched_at: cached.payload.fetched_at ?? cached.fetched_at,
    };
  }
  return loadLocalSnapshot();
}
