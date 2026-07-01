import { getRedAyudaSnapshot } from "@/data/redayuda-resources";
import { DATA_CACHE_SLUGS, getDataCache } from "@/lib/data-cache";
import type { RedAyudaSnapshot } from "./types";

export async function fetchRedAyudaSnapshotFeed(): Promise<RedAyudaSnapshot> {
  const cached = await getDataCache<RedAyudaSnapshot>(DATA_CACHE_SLUGS.REDAYUDA);
  if (cached?.payload?.stats) {
    return {
      ...getRedAyudaSnapshot(),
      ...cached.payload,
      fetched_at: cached.payload.fetched_at ?? cached.fetched_at,
    };
  }
  return getRedAyudaSnapshot();
}
