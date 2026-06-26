import type { ImportedMissingRecord, SourceAdapter } from "@/lib/missing-persons/types";
import { parseLocation } from "@/lib/missing-persons/location";
import { VENEZUELA_REPORTA_SEARCH_TERMS } from "@/lib/missing-persons/adapters/venezuela-reporta-terms";

const BASE = "https://venezuelareporta.org";

interface ReportaResult {
  id: string;
  nombre: string;
  ciudad: string | null;
  status: string;
  foto_url: string | null;
}

let cachedRecords: ImportedMissingRecord[] | null = null;

function mapPerson(row: ReportaResult): ImportedMissingRecord {
  const location = row.ciudad?.trim() || null;
  const { state, city } = parseLocation(location);

  return {
    sourceSlug: "venezuela-reporta",
    externalId: row.id,
    externalUrl: `${BASE}/?q=${encodeURIComponent(row.nombre)}`,
    fullName: row.nombre.trim(),
    age: null,
    gender: null,
    nationalId: null,
    state,
    city,
    lastSeenLocation: location,
    lastSeenAt: null,
    description: null,
    photoUrl: row.foto_url,
    contactName: "Reporte ciudadano",
    contactPhone: "Por confirmar",
    contactEmail: null,
    status: row.status === "buscando" ? "missing" : "found",
  };
}

async function fetchSearch(term: string): Promise<ReportaResult[]> {
  const url = `${BASE}/api/buscar?q=${encodeURIComponent(term)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    throw new Error(`Venezuela Reporta buscar "${term}" → ${res.status}`);
  }

  const data = (await res.json()) as { ok?: boolean; resultados?: ReportaResult[] };
  return data.resultados ?? [];
}

async function loadAllRecords(): Promise<ImportedMissingRecord[]> {
  if (cachedRecords) return cachedRecords;

  const byId = new Map<string, ImportedMissingRecord>();

  for (const term of VENEZUELA_REPORTA_SEARCH_TERMS) {
    try {
      const rows = await fetchSearch(term);
      for (const row of rows) {
        if (row.status !== "buscando") continue;
        byId.set(row.id, mapPerson(row));
      }
    } catch (err) {
      console.warn(`[venezuela-reporta] búsqueda "${term}" falló:`, err);
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  cachedRecords = [...byId.values()];
  return cachedRecords;
}

export const venezuelaReportaAdapter: SourceAdapter = {
  slug: "venezuela-reporta",

  async fetchBatch(offset: number, limit: number): Promise<ImportedMissingRecord[]> {
    const all = await loadAllRecords();
    return all.slice(offset, offset + limit);
  },
};

export function resetVenezuelaReportaCache() {
  cachedRecords = null;
}
