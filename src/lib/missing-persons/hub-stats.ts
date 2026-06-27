export interface MissingPersonsHubStats {
  /** Suma de reportes publicados por cada plataforma (puede haber solapamiento entre sitios). */
  total_reports: number;
  /** Suma de «por localizar» reportada por cada plataforma. */
  missing: number;
  /** Suma de «localizados» reportada por cada plataforma. */
  found: number;
  sources: Array<{
    slug: string;
    name: string;
    records: number;
    platform_count: number | null;
  }>;
}

export function normalizeHubStats(
  stats: Partial<MissingPersonsHubStats> & {
    unique_active?: number;
    total_external_records?: number;
  }
): MissingPersonsHubStats {
  return {
    total_reports: stats.total_reports ?? stats.total_external_records ?? 0,
    missing: stats.missing ?? stats.unique_active ?? 0,
    found: stats.found ?? 0,
    sources: stats.sources ?? [],
  };
}
