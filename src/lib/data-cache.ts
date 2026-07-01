import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const DATA_CACHE_SLUGS = {
  MISSING_PETS: "missing-pets",
  CHILDREN_EMERGENCY: "children-emergency",
  VZLAYUDA_AVISOS: "vzlayuda-avisos",
  REDAYUDA: "redayuda",
  CENTROACOPIO: "centroacopio",
  DONARSEGURO: "donarseguro",
  YUMMYRIDES_SOS: "yummyrides-sos",
  ALLIED_SCRAPE_STATUS: "allied-scrape-status",
} as const;

export type DataCacheSlug = (typeof DATA_CACHE_SLUGS)[keyof typeof DATA_CACHE_SLUGS];

/** Slug estable por dominio aliado: allied-donarseguro-com */
export function alliedCacheSlug(domain: string): string {
  return `allied-${domain
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export async function getCachedDataBySlug<T>(slug: string): Promise<{
  payload: T;
  fetched_at: string;
} | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const row = await prisma.dataCache.findUnique({ where: { slug } });
    if (!row) return null;
    return {
      payload: row.payload as T,
      fetched_at: row.fetchedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function setCachedDataBySlug<T>(
  slug: string,
  payload: T,
  fetchedAt?: Date
): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const at = fetchedAt ?? new Date();
  await prisma.dataCache.upsert({
    where: { slug },
    create: { slug, payload: payload as object, fetchedAt: at },
    update: { payload: payload as object, fetchedAt: at },
  });
}

export async function getDataCache<T>(slug: DataCacheSlug): Promise<{
  payload: T;
  fetched_at: string;
} | null> {
  return getCachedDataBySlug<T>(slug);
}

export async function setDataCache<T>(
  slug: DataCacheSlug,
  payload: T,
  fetchedAt?: Date
): Promise<void> {
  return setCachedDataBySlug(slug, payload, fetchedAt);
}

export async function listAlliedCacheEntries(): Promise<
  Array<{ slug: string; fetched_at: string }>
> {
  if (!isDatabaseConfigured()) return [];
  const rows = await prisma.dataCache.findMany({
    where: { slug: { startsWith: "allied-" } },
    select: { slug: true, fetchedAt: true },
    orderBy: { fetchedAt: "desc" },
  });
  return rows.map((row) => ({
    slug: row.slug,
    fetched_at: row.fetchedAt.toISOString(),
  }));
}
