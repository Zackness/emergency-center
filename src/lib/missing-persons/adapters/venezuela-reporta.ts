import type {
  ImportedMissingRecord,
  ImportedPersonStatus,
  SourceAdapter,
} from "@/lib/missing-persons/types";
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

/** Búsqueda directa en Venezuela Reporta (no precarga todo el índice). */
export async function searchVenezuelaReportaRecords(query: string): Promise<ImportedMissingRecord[]> {
  const rows = await fetchSearch(query.trim());
  return rows.map(mapPerson);
}

async function loadAllRecords(): Promise<ImportedMissingRecord[]> {
  if (cachedRecords) return cachedRecords;

  const byId = new Map<string, ImportedMissingRecord>();

  for (const term of VENEZUELA_REPORTA_SEARCH_TERMS) {
    try {
      const rows = await fetchSearch(term);
      for (const row of rows) {
        const mapped = mapPerson(row);
        const existing = byId.get(row.id);
        if (!existing) {
          byId.set(row.id, mapped);
          continue;
        }
        if (mapped.status === "found") {
          byId.set(row.id, mapped);
        }
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

  async fetchBatch(
    offset: number,
    limit: number,
    status: ImportedPersonStatus = "missing"
  ): Promise<ImportedMissingRecord[]> {
    const all = await loadAllRecords();
    const filtered =
      status === "found"
        ? all.filter((row) => row.status === "found")
        : status === "missing"
          ? all.filter((row) => row.status === "missing")
          : all;
    return filtered.slice(offset, offset + limit);
  },
};

export function resetVenezuelaReportaCache() {
  cachedRecords = null;
}
