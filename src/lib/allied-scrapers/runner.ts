import {
  alliedCacheSlug,
  DATA_CACHE_SLUGS,
  setCachedDataBySlug,
} from "@/lib/data-cache";
import { fetchAlliedPlatforms } from "@/lib/allied-platforms/service";
import { isDatabaseConfigured } from "@/lib/prisma";
import {
  ALLIED_SCRAPER_ADAPTERS,
  findScraperAdapterForDomain,
  normalizeAlliedDomain,
  persistAdapterJson,
} from "./registry";
import type {
  AlliedScrapeStatusSnapshot,
  AlliedScraperRunResult,
} from "./types";

export type RunAlliedScrapersOptions = {
  fetchOnly?: boolean;
  syncOnly?: boolean;
  dryRun?: boolean;
  adapterIds?: string[];
};

function resolveCacheSlug(adapterId: string, domain: string): string {
  const adapter = ALLIED_SCRAPER_ADAPTERS.find((item) => item.id === adapterId);
  return adapter?.cacheSlug ?? alliedCacheSlug(domain);
}

export async function runAlliedScrapers(
  options: RunAlliedScrapersOptions = {}
): Promise<AlliedScrapeStatusSnapshot> {
  const { fetchOnly = false, syncOnly = false, dryRun = false, adapterIds } = options;
  const platforms = await fetchAlliedPlatforms();
  const results: AlliedScraperRunResult[] = [];

  const adapterRuns = new Map<
    string,
    { adapter: (typeof ALLIED_SCRAPER_ADAPTERS)[number]; domains: Set<string> }
  >();

  for (const platform of platforms) {
    const domain = normalizeAlliedDomain(platform.domain);
    const adapter = findScraperAdapterForDomain(domain);

    if (!adapter) {
      results.push({
        adapter_id: "none",
        label: platform.domain,
        domains: [domain],
        matched_platforms: [platform.domain],
        status: "skipped",
        error: "Sin adaptador de scraping registrado",
      });
      continue;
    }

    if (adapterIds?.length && !adapterIds.includes(adapter.id)) continue;

    const existing = adapterRuns.get(adapter.id);
    if (existing) {
      existing.domains.add(domain);
    } else {
      adapterRuns.set(adapter.id, { adapter, domains: new Set([domain]) });
    }
  }

  for (const [adapterId, run] of adapterRuns) {
    const { adapter, domains } = run;
    const domainList = [...domains].sort();
    const cacheSlug = resolveCacheSlug(adapterId, domainList[0]!);
    const base: AlliedScraperRunResult = {
      adapter_id: adapter.id,
      label: adapter.label,
      domains: adapter.domains,
      matched_platforms: domainList,
      status: "ok",
      cache_slug: cacheSlug,
    };

    try {
      if (!syncOnly) {
        console.log(`[allied-scrapers] Fetch ${adapter.label} (${domainList.join(", ")})…`);
        const payload = await adapter.fetch();
        const fetchedAt = new Date();
        const itemCount = adapter.countItems?.(payload);

        if (!dryRun) {
          await persistAdapterJson(adapter, payload);
          if (isDatabaseConfigured()) {
            await setCachedDataBySlug(cacheSlug, payload, fetchedAt);
          }
        }

        base.fetched_at = fetchedAt.toISOString();
        base.item_count = itemCount;

        if (!fetchOnly && adapter.sync && !dryRun) {
          console.log(`[allied-scrapers] Sync ${adapter.label} → BD…`);
          base.sync = await adapter.sync(payload);
        }
      } else if (adapter.sync && !fetchOnly && !dryRun) {
        const { getCachedDataBySlug } = await import("@/lib/data-cache");
        const cached = await getCachedDataBySlug<unknown>(cacheSlug);
        if (!cached) {
          base.status = "skipped";
          base.error = "Sin caché previa para sync-only";
        } else {
          base.fetched_at = cached.fetched_at;
          base.sync = await adapter.sync(cached.payload);
        }
      }

      results.push(base);
      console.log(
        `[allied-scrapers] ✓ ${adapter.label}` +
          (base.item_count != null ? ` (${base.item_count} items)` : "") +
          (base.sync ? ` | BD +${base.sync.created}/~${base.sync.updated}` : "")
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[allied-scrapers] ✗ ${adapter.label}:`, message);
      results.push({
        ...base,
        status: "error",
        error: message,
      });
    }
  }

  const snapshot: AlliedScrapeStatusSnapshot = {
    fetched_at: new Date().toISOString(),
    results,
  };

  if (!dryRun && isDatabaseConfigured()) {
    await setCachedDataBySlug(DATA_CACHE_SLUGS.ALLIED_SCRAPE_STATUS, snapshot);
  }

  return snapshot;
}

export function listRegisteredScraperAdapters() {
  return ALLIED_SCRAPER_ADAPTERS.map((adapter) => ({
    id: adapter.id,
    label: adapter.label,
    domains: adapter.domains,
    cache_slug: adapter.cacheSlug,
    has_sync: Boolean(adapter.sync),
  }));
}
