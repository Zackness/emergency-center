import type { ImportedMissingRecord, SourceAdapter } from "@/lib/missing-persons/types";
import { parseLocation } from "@/lib/missing-persons/location";

const BASE = "https://venezuelatebusca.com";

interface VtbPerson {
  id: string;
  first_name: string;
  last_name: string;
  national_id: string | null;
  age: number | null;
  gender: string | null;
  last_seen_location: string | null;
  description: string | null;
  status: string;
  photo_key: string | null;
  reporter_name: string;
  reporter_phone: string;
  reporter_email: string | null;
  created_at: string;
  updated_at: string;
}

function mapPerson(row: VtbPerson): ImportedMissingRecord {
  const fullName = `${row.first_name} ${row.last_name}`.trim();
  const { state, city } = parseLocation(row.last_seen_location);

  return {
    sourceSlug: "venezuela-te-busca",
    externalId: row.id,
    externalUrl: `${BASE}/?person=${row.id}`,
    fullName,
    age: row.age,
    gender: row.gender,
    nationalId: row.national_id,
    state,
    city,
    lastSeenLocation: row.last_seen_location,
    lastSeenAt: row.created_at ? new Date(row.created_at) : null,
    description: row.description,
    photoUrl: row.photo_key ? `${BASE}/api/photos/${row.photo_key}` : null,
    contactName: row.reporter_name || "Reporte ciudadano",
    contactPhone: row.reporter_phone || "Por confirmar",
    contactEmail: row.reporter_email,
    status: row.status === "found" ? "found" : "missing",
  };
}

export const venezuelaTeBuscaAdapter: SourceAdapter = {
  slug: "venezuela-te-busca",

  async fetchBatch(offset: number, limit: number): Promise<ImportedMissingRecord[]> {
    const url = `${BASE}/api/persons?limit=${limit}&offset=${offset}&status=missing`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      throw new Error(`Venezuela Te Busca API ${res.status}`);
    }

    const data = (await res.json()) as { persons?: VtbPerson[] };
    return (data.persons ?? []).map(mapPerson);
  },
};
