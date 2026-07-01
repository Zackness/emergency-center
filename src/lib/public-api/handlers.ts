import type { APIContext } from "astro";
import { isValidLocale } from "@/i18n/config";
import type { UnifiedMapLayer } from "@/types/map";
import { publicApiJson } from "@/lib/public-api";

export async function handlePublicApiRoute(
  request: Request,
  slug: string,
  context: APIContext
): Promise<Response> {
  const path = slug.replace(/\/$/, "");

  switch (path) {
    case "help-centers":
      return handleHelpCenters(request, context);
    case "hospitals":
      return handleHospitals(request);
    case "shelters":
      return handleShelters(request);
    case "agencies":
      return handleAgencies(request);
    case "damage-reports":
      return handleDamageReports(request);
    case "missing-persons":
      return handleMissingPersons(request);
    case "missing-pets":
      return handleMissingPets(request);
    case "children-emergency":
      return handleChildrenEmergency(request);
    case "news":
      return handleNews(request);
    case "allied-platforms":
      return handleAlliedPlatforms(request);
    case "map/catalog":
      return handleMapCatalog(request);
    case "emergency-numbers":
      return handleEmergencyNumbers(request);
    case "external-links":
      return handleExternalLinks(request);
    case "vzlayuda/avisos":
      return handleVzlaAyudaAvisos(request);
    case "donarseguro":
      return handleDonarSeguro(request);
    case "yummyrides-sos":
      return handleYummySos(request);
    case "allied-data":
      return handleAlliedData(request);
    case "scrape-status":
      return handleScrapeStatus(request);
    default:
      return publicApiJson(request, { error: "Endpoint no encontrado" }, 404);
  }
}

async function handleHelpCenters(request: Request, context: APIContext) {
  const url = new URL(request.url);
  const { fetchHelpCenters } = await import("@/lib/data");
  const { queryHelpCentersCatalog } = await import("@/lib/help-centers/feed");
  const { fetchInventoryNeedSummaries } = await import("@/lib/center-dashboard");
  const { canShowPublicInventory } = await import("@/lib/help-centers/public");
  const { isDatabaseConfigured } = await import("@/lib/prisma");

  const search = url.searchParams.get("search") ?? undefined;
  const city = url.searchParams.get("city") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "10000");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const baseCenters = await fetchHelpCenters();
  const result = await queryHelpCentersCatalog(baseCenters, {
    search,
    city,
    limit: Number.isFinite(limit) ? Math.min(10000, Math.max(1, limit)) : 10000,
    offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
  });

  const inventoryCenterIds = result.centers
    .filter((center) => canShowPublicInventory(center))
    .map((center) => center.id);
  const needSummaries = isDatabaseConfigured()
    ? await fetchInventoryNeedSummaries(inventoryCenterIds)
    : new Map();

  const centers = result.centers.map((center) => ({
    ...center,
    needs_summary: needSummaries.get(center.id) ?? null,
  }));

  return publicApiJson(request, { ...result, centers });
}

async function handleHospitals(request: Request) {
  const url = new URL(request.url);
  const { fetchHospitals } = await import("@/lib/data");
  const search = url.searchParams.get("search")?.toLowerCase();
  const state = url.searchParams.get("state");
  const status = url.searchParams.get("status");

  let items = await fetchHospitals();
  if (state && state !== "all") {
    items = items.filter((h) => h.state === state);
  }
  if (status && status !== "all") {
    items = items.filter((h) => h.status === status);
  }
  if (search) {
    items = items.filter((h) =>
      [h.name, h.city, h.state, h.address].join(" ").toLowerCase().includes(search)
    );
  }

  return publicApiJson(request, { items, total: items.length });
}

async function handleShelters(request: Request) {
  const url = new URL(request.url);
  const { fetchShelters } = await import("@/lib/data");
  const search = url.searchParams.get("search")?.toLowerCase();
  const state = url.searchParams.get("state");

  let items = await fetchShelters();
  if (state && state !== "all") {
    items = items.filter((s) => s.state === state);
  }
  if (search) {
    items = items.filter((s) =>
      [s.name, s.city, s.state, s.address].join(" ").toLowerCase().includes(search)
    );
  }

  return publicApiJson(request, { items, total: items.length });
}

async function handleAgencies(request: Request) {
  const url = new URL(request.url);
  const { fetchAgencies } = await import("@/lib/data");
  const category = url.searchParams.get("category");

  let items = await fetchAgencies();
  if (category && category !== "all") {
    items = items.filter((a) => a.category === category);
  }

  return publicApiJson(request, { items, total: items.length });
}

async function handleDamageReports(request: Request) {
  const url = new URL(request.url);
  const { fetchDamageReportsForPage } = await import("@/lib/data");
  const { filterDamageReports } = await import("@/lib/damage-map/feed");

  const search = url.searchParams.get("search") ?? undefined;
  const severity = url.searchParams.get("severity") ?? undefined;
  const state = url.searchParams.get("state") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "500");
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const safeLimit = Number.isFinite(limit) ? Math.min(10000, Math.max(1, limit)) : 500;
  const safeOffset = Number.isFinite(offset) ? Math.max(0, offset) : 0;

  const result = await fetchDamageReportsForPage();
  const filtered = filterDamageReports(result.items, {
    search,
    severity: severity && severity !== "all" ? (severity as import("@/types").DamageSeverity) : "all",
    state: state && state !== "all" ? state : "all",
  });
  const items = filtered.slice(safeOffset, safeOffset + safeLimit);

  return publicApiJson(request, {
    items,
    total: filtered.length,
    stats: result.stats,
  });
}

async function handleMissingPersons(request: Request) {
  const url = new URL(request.url);
  const { fetchMissingPersons, countMissingPersons } = await import("@/lib/data");

  const q = url.searchParams.get("q") ?? undefined;
  const state = url.searchParams.get("state") ?? undefined;
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam === "missing" || statusParam === "found" || statusParam === "all"
      ? statusParam
      : "all";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "24") || 24));

  const [items, total] = await Promise.all([
    fetchMissingPersons({ q, state, status, page, limit }),
    countMissingPersons({ q, state, status }),
  ]);

  return publicApiJson(request, { items, total, page, limit });
}

async function handleMissingPets(request: Request) {
  const url = new URL(request.url);
  const { queryMissingPets } = await import("@/lib/missing-pets/feed");

  const result = await queryMissingPets({
    q: url.searchParams.get("q") ?? undefined,
    status:
      url.searchParams.get("status") === "lost" || url.searchParams.get("status") === "found"
        ? (url.searchParams.get("status") as "lost" | "found")
        : "all",
    species:
      ["dog", "cat", "other"].includes(url.searchParams.get("species") ?? "")
        ? (url.searchParams.get("species") as "dog" | "cat" | "other")
        : "all",
    state: url.searchParams.get("state") ?? undefined,
    page: Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1),
    limit: Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "24") || 24)),
  });

  return publicApiJson(request, result);
}

async function handleChildrenEmergency(request: Request) {
  const url = new URL(request.url);
  const { queryChildrenEmergencyCases } = await import("@/lib/children-emergency/feed");

  const result = await queryChildrenEmergencyCases({
    q: url.searchParams.get("q") ?? undefined,
    source:
      url.searchParams.get("source") === "nexosignal" ||
      url.searchParams.get("source") === "redayuda"
        ? (url.searchParams.get("source") as "nexosignal" | "redayuda")
        : "all",
    health:
      ["stable", "critical", "unidentified", "unknown"].includes(
        url.searchParams.get("health") ?? ""
      )
        ? (url.searchParams.get("health") as "stable" | "critical" | "unidentified" | "unknown")
        : "all",
    hospital: url.searchParams.get("hospital") ?? undefined,
    page: Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1),
    limit: Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "24") || 24)),
  });

  return publicApiJson(request, result);
}

async function handleNews(request: Request) {
  const url = new URL(request.url);
  const { fetchNewsFeed } = await import("@/lib/news-credibility");
  const sort = url.searchParams.get("sort") as
    | "newest"
    | "most_credible"
    | "most_disputed"
    | null;

  const items = await fetchNewsFeed({ sort: sort ?? "newest" });
  return publicApiJson(request, { items });
}

async function handleAlliedPlatforms(request: Request) {
  const { fetchAlliedPlatforms } = await import("@/lib/allied-platforms/service");
  const items = await fetchAlliedPlatforms();
  return publicApiJson(request, { items, total: items.length });
}

async function handleMapCatalog(request: Request) {
  const url = new URL(request.url);
  const { fetchLandingMapCatalog } = await import("@/lib/map/landing-catalog");
  const { UNIFIED_MAP_CATALOG_MAX, UNIFIED_MAP_LAYERS } = await import(
    "@/lib/map/catalog-layers"
  );

  const localeParam = url.searchParams.get("lang") ?? "es";
  const locale = isValidLocale(localeParam) ? localeParam : "es";
  const layersParam = url.searchParams.get("layers");
  const layers = layersParam
    ? (layersParam.split(",").filter(Boolean) as UnifiedMapLayer[])
    : UNIFIED_MAP_LAYERS;
  const requestedLimit = Number(url.searchParams.get("limit") ?? "0") || 0;
  const maxTotal =
    requestedLimit > 0 ? Math.min(UNIFIED_MAP_CATALOG_MAX, requestedLimit) : undefined;

  const catalog = await fetchLandingMapCatalog(locale, {
    zone: url.searchParams.get("zone") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    severity: url.searchParams.get("severity") ?? undefined,
    layers,
    maxTotal,
  });

  return publicApiJson(request, catalog);
}

async function handleEmergencyNumbers(request: Request) {
  const { fetchEmergencyNumbers } = await import("@/lib/data");
  const items = await fetchEmergencyNumbers();
  return publicApiJson(request, { items, total: items.length });
}

async function handleExternalLinks(request: Request) {
  const url = new URL(request.url);
  const { fetchExternalLinks } = await import("@/lib/data");
  const category = url.searchParams.get("category") ?? "tools";
  const items = await fetchExternalLinks(category);
  return publicApiJson(request, { items, total: items.length, category });
}

async function handleVzlaAyudaAvisos(request: Request) {
  const url = new URL(request.url);
  const { fetchHelpListings } = await import("@/lib/vzlayuda/feed");

  const kindParam = url.searchParams.get("kind") ?? "all";
  const kind =
    kindParam === "offer" || kindParam === "request" ? kindParam : ("all" as const);

  const result = await fetchHelpListings({
    kind,
    state: url.searchParams.get("state") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    search: url.searchParams.get("q") ?? url.searchParams.get("search") ?? undefined,
    source: "all",
    limit: Math.min(500, Math.max(1, Number(url.searchParams.get("limit") ?? "80") || 80)),
    offset: Math.max(0, Number(url.searchParams.get("offset") ?? "0") || 0),
  });

  return publicApiJson(request, result);
}

async function handleDonarSeguro(request: Request) {
  const url = new URL(request.url);
  const { fetchDonarSeguroFeed } = await import("@/lib/donarseguro/feed");
  const snapshot = await fetchDonarSeguroFeed();

  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q")?.toLowerCase();

  let organizations = snapshot.organizations;
  if (category && category !== "all") {
    organizations = organizations.filter((org) => org.category === category);
  }
  if (q) {
    organizations = organizations.filter((org) =>
      [org.name, org.verdict, org.org_type, org.themes.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  return publicApiJson(request, {
    fetched_at: snapshot.fetched_at,
    total: organizations.length,
    organizations,
  });
}

async function handleYummySos(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") ?? "all";
  const { fetchYummySosFeed } = await import("@/lib/yummyrides-sos/feed");
  const snapshot = await fetchYummySosFeed();

  if (kind === "damage") {
    return publicApiJson(request, {
      fetched_at: snapshot.fetched_at,
      stats: snapshot.stats,
      items: snapshot.damage_reports,
      total: snapshot.damage_reports.length,
    });
  }

  if (kind === "help-centers") {
    return publicApiJson(request, {
      fetched_at: snapshot.fetched_at,
      stats: snapshot.stats,
      items: snapshot.help_centers,
      total: snapshot.help_centers.length,
    });
  }

  return publicApiJson(request, snapshot);
}

async function handleAlliedData(request: Request) {
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain");
  const adapterId = url.searchParams.get("adapter");

  if (!domain && !adapterId) {
    return publicApiJson(
      request,
      { error: "Indica domain o adapter", example: "/api/v1/allied-data?domain=donarseguro.com" },
      400
    );
  }

  const { getCachedDataBySlug } = await import("@/lib/data-cache");
  const { findScraperAdapterForDomain, ALLIED_SCRAPER_ADAPTERS } = await import(
    "@/lib/allied-scrapers/registry"
  );
  const { alliedCacheSlug } = await import("@/lib/data-cache");

  let cacheSlug: string | null = null;
  let meta: { adapter_id: string; label: string; domains: string[] } | null = null;

  if (adapterId) {
    const adapter = ALLIED_SCRAPER_ADAPTERS.find((item) => item.id === adapterId);
    if (!adapter) {
      return publicApiJson(request, { error: "Adaptador no encontrado" }, 404);
    }
    cacheSlug = adapter.cacheSlug ?? alliedCacheSlug(adapter.domains[0]!);
    meta = { adapter_id: adapter.id, label: adapter.label, domains: adapter.domains };
  } else if (domain) {
    const adapter = findScraperAdapterForDomain(domain);
    if (!adapter) {
      return publicApiJson(request, { error: "Sin adaptador para ese dominio" }, 404);
    }
    cacheSlug = adapter.cacheSlug ?? alliedCacheSlug(domain);
    meta = { adapter_id: adapter.id, label: adapter.label, domains: adapter.domains };
  }

  const cached = cacheSlug ? await getCachedDataBySlug<unknown>(cacheSlug) : null;
  if (!cached) {
    return publicApiJson(
      request,
      { error: "Sin datos en caché. Ejecuta sync:allied-scrapers.", meta, cache_slug: cacheSlug },
      404
    );
  }

  return publicApiJson(request, {
    meta,
    cache_slug: cacheSlug,
    fetched_at: cached.fetched_at,
    data: cached.payload,
  });
}

async function handleScrapeStatus(request: Request) {
  const { getCachedDataBySlug, listAlliedCacheEntries, DATA_CACHE_SLUGS } = await import(
    "@/lib/data-cache"
  );
  const { listRegisteredScraperAdapters } = await import("@/lib/allied-scrapers/runner");

  const [status, caches] = await Promise.all([
    getCachedDataBySlug<{ fetched_at: string; results: unknown[] }>(
      DATA_CACHE_SLUGS.ALLIED_SCRAPE_STATUS
    ),
    listAlliedCacheEntries(),
  ]);

  return publicApiJson(request, {
    last_run: status?.payload ?? null,
    last_run_at: status?.fetched_at ?? null,
    registered_adapters: listRegisteredScraperAdapters(),
    cache_entries: caches,
  });
}
