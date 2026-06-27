import { SEED_EXTERNAL_SOURCES } from "@/data/external-sources";
import type { MissingPersonsHubStats } from "@/lib/missing-persons/hub-stats";
import { fetchLivePlatformStats } from "@/lib/missing-persons/platform-stats";
import { defaultMissingPersonSyncSlugs } from "@/lib/missing-persons/sync-source-registry";

const AGGREGATED_SLUGS = new Set([
  ...defaultMissingPersonSyncSlugs(),
  "venezuela-reporta",
  "desaparecidos-terremoto",
]);

/** Cifras publicadas por cada plataforma aliada (suma entre sitios; puede haber solapamiento). */
export async function fetchAggregatedPlatformStats(): Promise<MissingPersonsHubStats> {
  const live = await fetchLivePlatformStats();
  const sources: MissingPersonsHubStats["sources"] = [];
  let total_reports = 0;
  let missing = 0;
  let found = 0;

  for (const source of SEED_EXTERNAL_SOURCES) {
    if (!AGGREGATED_SLUGS.has(source.slug)) continue;

    const liveStats = live.get(source.slug);
    const pending = liveStats?.count_pending ?? source.count_pending ?? 0;
    const located = liveStats?.count_located ?? source.count_located ?? 0;
    const total =
      liveStats?.approximate_count ??
      source.approximate_count ??
      (pending || located ? pending + located : 0);

    if (!total && !pending && !located) continue;

    total_reports += total;
    missing += pending;
    found += located;

    sources.push({
      slug: source.slug,
      name: source.name,
      records: total,
      platform_count: total,
    });
  }

  return { total_reports, missing, found, sources };
}
