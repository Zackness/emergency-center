export type AlliedScraperSyncResult = {
  created: number;
  updated: number;
  skipped?: number;
};

export type AlliedScraperRunResult = {
  adapter_id: string;
  label: string;
  domains: string[];
  matched_platforms: string[];
  status: "ok" | "skipped" | "error";
  error?: string;
  fetched_at?: string;
  cache_slug?: string;
  item_count?: number;
  sync?: AlliedScraperSyncResult;
};

export type AlliedScraperAdapter = {
  id: string;
  /** Dominios normalizados (sin www) que activan este adaptador. */
  domains: string[];
  label: string;
  /** Slug fijo en data_cache; si no, se usa allied-{domain}. */
  cacheSlug?: string;
  fetch: () => Promise<unknown>;
  /** Persiste en tablas relacionales (damage_reports, help_centers, etc.). */
  sync?: (payload: unknown) => Promise<AlliedScraperSyncResult>;
  /** Cuenta items en el payload para logs. */
  countItems?: (payload: unknown) => number;
  /** Ruta JSON local opcional (fallback dev). */
  jsonFile?: string;
};

export type AlliedScrapeStatusSnapshot = {
  fetched_at: string;
  results: AlliedScraperRunResult[];
};
