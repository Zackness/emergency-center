export interface PlatformLiveStats {
  approximate_count: number | null;
  count_pending: number | null;
  count_located: number | null;
}

const FETCH_TIMEOUT_MS = 8_000;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchVenezuelaTeBuscaStats(): Promise<PlatformLiveStats | null> {
  const data = await fetchJson<{ stats?: { total?: number; missing?: number; found?: number } }>(
    "https://venezuelatebusca.com/api/stats"
  );
  const stats = data?.stats;
  if (!stats) return null;
  return {
    approximate_count: stats.total ?? null,
    count_pending: stats.missing ?? null,
    count_located: stats.found ?? null,
  };
}

async function fetchEncuentralosStats(): Promise<PlatformLiveStats | null> {
  const data = await fetchJson<{
    total?: number;
    desaparecidos?: number;
    encontrados?: number;
  }>("https://encuentralos.tecnosoft.dev/api/stats");
  if (!data) return null;
  return {
    approximate_count: data.total ?? null,
    count_pending: data.desaparecidos ?? null,
    count_located: data.encontrados ?? null,
  };
}

async function fetchDesaparecidosTerremotoStats(): Promise<PlatformLiveStats | null> {
  const url =
    "https://desaparecidos-terremoto-api.theempire.tech/api/personas?page=1&pageSize=1&estado=sin-contacto";
  const data = await fetchJson<{
    total?: number;
    totalCount?: number;
    meta?: { total?: number };
    stats?: { total?: number; missing?: number; found?: number };
  }>(url, {
    headers: {
      Origin: "https://desaparecidosterremotovenezuela.com",
      Referer: "https://desaparecidosterremotovenezuela.com/",
    },
  });
  if (!data) return null;

  if (data.stats) {
    return {
      approximate_count: data.stats.total ?? null,
      count_pending: data.stats.missing ?? null,
      count_located: data.stats.found ?? null,
    };
  }

  const pending = data.total ?? data.totalCount ?? data.meta?.total ?? null;
  if (pending == null) return null;

  return {
    approximate_count: pending,
    count_pending: pending,
    count_located: null,
  };
}

async function fetchTerremotoVenezuelaStats(): Promise<PlatformLiveStats | null> {
  const data = await fetchJson<{ total?: number }>(
    "https://terremotovenezuela.app/api/missing?page=1&pageSize=1"
  );
  if (!data?.total) return null;
  return {
    approximate_count: data.total,
    count_pending: data.total,
    count_located: null,
  };
}

async function fetchVenezuelaReportaStats(): Promise<PlatformLiveStats | null> {
  return {
    approximate_count: 68166,
    count_pending: 63242,
    count_located: 4924,
  };
}

const LIVE_FETCHERS: Record<string, () => Promise<PlatformLiveStats | null>> = {
  "venezuela-te-busca": fetchVenezuelaTeBuscaStats,
  encuentralos: fetchEncuentralosStats,
  "desaparecidos-terremoto": fetchDesaparecidosTerremotoStats,
  "terremotovenezuela-app": fetchTerremotoVenezuelaStats,
  "venezuela-reporta": fetchVenezuelaReportaStats,
};

let cache: { at: number; stats: Map<string, PlatformLiveStats> } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

/** Cifras publicadas en cada plataforma (APIs públicas cuando existen). */
export async function fetchLivePlatformStats(): Promise<Map<string, PlatformLiveStats>> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return cache.stats;
  }

  const entries = await Promise.all(
    Object.entries(LIVE_FETCHERS).map(async ([slug, fetcher]) => {
      const stats = await fetcher();
      return [slug, stats] as const;
    })
  );

  const stats = new Map<string, PlatformLiveStats>();
  for (const [slug, value] of entries) {
    if (value) stats.set(slug, value);
  }

  cache = { at: now, stats };
  return stats;
}

export function clearLivePlatformStatsCache() {
  cache = null;
}
