import { getDataCache, DATA_CACHE_SLUGS } from "@/lib/data-cache";
import type { DonarSeguroSnapshot } from "./types";

let localSnapshot: DonarSeguroSnapshot | null = null;

async function loadLocalSnapshot(): Promise<DonarSeguroSnapshot> {
  if (localSnapshot) return localSnapshot;
  try {
    const mod = await import("@/data/donarseguro.json");
    localSnapshot = mod.default as DonarSeguroSnapshot;
    return localSnapshot;
  } catch {
    return {
      source: "https://donarseguro.com",
      fetched_at: new Date(0).toISOString(),
      count: 0,
      organizations: [],
    };
  }
}

export async function fetchDonarSeguroFeed(): Promise<DonarSeguroSnapshot> {
  const cached = await getDataCache<DonarSeguroSnapshot>(DATA_CACHE_SLUGS.DONARSEGURO);
  if (cached?.payload?.organizations?.length) {
    return {
      ...cached.payload,
      fetched_at: cached.payload.fetched_at ?? cached.fetched_at,
    };
  }
  return loadLocalSnapshot();
}
