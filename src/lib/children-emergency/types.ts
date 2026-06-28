export type ChildEmergencySource = "nexosignal" | "redayuda";

export type ChildHealthStatus = "stable" | "critical" | "unidentified" | "unknown";

export type ChildCustodyStatus = "under_care" | "unknown";

export interface ChildEmergencyCase {
  id: string;
  source: ChildEmergencySource;
  external_id: string;
  name: string;
  age: string | null;
  health_status: ChildHealthStatus;
  custody_status: ChildCustodyStatus | null;
  hospital: string | null;
  found_location: string | null;
  child_statement: string | null;
  contact_phone: string | null;
  photo_url: string | null;
  reported_at: string;
  source_name: string;
  source_url: string;
  is_active: boolean;
  updated_at: string;
}

export interface ChildrenEmergencyQuery {
  q?: string;
  source?: ChildEmergencySource | "all";
  health?: ChildHealthStatus | "all";
  hospital?: string;
  page?: number;
  limit?: number;
}

export interface ChildrenEmergencyStats {
  total: number;
  nexosignal: number;
  redayuda: number;
  last_synced_at: string | null;
}
