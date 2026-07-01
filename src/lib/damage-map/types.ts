import type { DamageSeverity } from "@/types";

export interface ImportedBuilding {
  externalId: string;
  title: string;
  address: string | null;
  city: string;
  zone: string | null;
  state: string;
  latitude: number;
  longitude: number;
  severity: DamageSeverity;
  imageUrls: string[];
  isVerified: boolean;
  sourceSyncedAt: string;
  sourceUrl: string;
}

export interface DamageSyncResult {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
}

export interface DamageMapStats {
  total: number;
  collapsed: number;
  damaged: number;
  evacuated: number;
  last_synced_at: string | null;
  /** Reportes comunitarios unificados (sin capa NASA). */
  community_total?: number;
  /** Estimación NASA Sentinel-1 (~58k). */
  nasa_estimate?: number;
  /** Puntos NASA cargados localmente para el mapa. */
  nasa_plotted?: number;
  /** Reportes @rdelbufalo incluidos en el catálogo comunitario. */
  priority_rescue?: number;
  /** Marcadores totales en el mapa (comunidad + NASA). */
  map_markers?: number;
}

export interface DamageMapQuery {
  search?: string;
  severity?: DamageSeverity | "all";
  state?: string;
  limit?: number;
  offset?: number;
}
