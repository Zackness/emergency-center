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
}

export interface DamageMapQuery {
  search?: string;
  severity?: DamageSeverity | "all";
  state?: string;
  limit?: number;
  offset?: number;
}
