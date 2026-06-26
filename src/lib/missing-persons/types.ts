export type ImportedPersonStatus = "missing" | "found" | "deceased";

/** Registro normalizado desde cualquier fuente externa. */
export interface ImportedMissingRecord {
  sourceSlug: string;
  externalId: string;
  externalUrl: string;
  fullName: string;
  age: number | null;
  gender: string | null;
  nationalId: string | null;
  state: string;
  city: string;
  lastSeenLocation: string | null;
  lastSeenAt: Date | null;
  description: string | null;
  photoUrl: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  status: ImportedPersonStatus;
}

export interface SourceAdapter {
  slug: string;
  fetchBatch(offset: number, limit: number): Promise<ImportedMissingRecord[]>;
}

export interface SyncOptions {
  sourceSlugs?: string[];
  offset?: number;
  limit?: number;
  batchSize?: number;
}

export interface SyncResult {
  source: string;
  fetched: number;
  created: number;
  linked: number;
  updated: number;
  skipped: number;
  errors: string[];
}
