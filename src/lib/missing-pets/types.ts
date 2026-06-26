export type MissingPetStatus = "lost" | "found";

export interface MissingPet {
  id: string;
  name: string;
  status: MissingPetStatus;
  location: string;
  city: string | null;
  state: string | null;
  distinctive_marks: string | null;
  contact_phone: string | null;
  photo_url: string | null;
  source_name: string;
  source_url: string;
  external_id: string;
  reported_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MissingPetsQuery {
  q?: string;
  status?: MissingPetStatus | "all";
  state?: string;
  page?: number;
  limit?: number;
}

export interface MissingPetsStats {
  total: number;
  lost: number;
  found: number;
  last_synced_at: string | null;
}
