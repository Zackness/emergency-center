import type { ImportedMissingRecord, SourceAdapter } from "@/lib/missing-persons/types";
import { parseLocation } from "@/lib/missing-persons/location";

const BASE = "https://encuentralos.tecnosoft.dev";

interface EncuentralosPerson {
  id: string;
  nombre: string;
  edad: number | null;
  sexo: string | null;
  descripcion: string | null;
  foto: string | null;
  ultima_ubicacion: string | null;
  ultima_vez: string | null;
  reporta_contacto: string | null;
  estado: string;
  creado: string;
  cedula: string | null;
}

function mapPerson(row: EncuentralosPerson): ImportedMissingRecord {
  const { state, city } = parseLocation(row.ultima_ubicacion);
  const contact = row.reporta_contacto?.trim();

  return {
    sourceSlug: "encuentralos",
    externalId: row.id,
    externalUrl: `${BASE}/#persona-${row.id}`,
    fullName: row.nombre.trim(),
    age: row.edad,
    gender: row.sexo,
    nationalId: row.cedula,
    state,
    city,
    lastSeenLocation: row.ultima_ubicacion,
    lastSeenAt: row.ultima_vez ? new Date(row.ultima_vez) : row.creado ? new Date(row.creado) : null,
    description: row.descripcion,
    photoUrl: row.foto,
    contactName: contact ? "Reporte ciudadano" : "Reporte ciudadano",
    contactPhone: contact || "Por confirmar",
    contactEmail: null,
    status: row.estado === "localizado" ? "found" : "missing",
  };
}

export const encuentralosAdapter: SourceAdapter = {
  slug: "encuentralos",

  async fetchBatch(offset: number, limit: number): Promise<ImportedMissingRecord[]> {
    const url = `${BASE}/api/personas?limit=${limit}&offset=${offset}&estado=desaparecido`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      throw new Error(`Encuéntralos API ${res.status}`);
    }

    const data = (await res.json()) as { items?: EncuentralosPerson[] };
    return (data.items ?? []).map(mapPerson);
  },
};
