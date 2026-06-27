import type { ImportedMissingRecord, ImportedPersonStatus, SourceAdapter } from "@/lib/missing-persons/types";
import { parseLocation } from "@/lib/missing-persons/location";

const API_BASE = "https://desaparecidos-terremoto-api.theempire.tech/api";
const SITE_ORIGIN = "https://desaparecidosterremotovenezuela.com";

interface DesaparecidosPerson {
  id: string;
  nombre: string;
  edad?: number | string | null;
  ubicacion?: string | null;
  estado?: string;
  foto?: string | null;
  descripcion?: string | null;
  contacto?: string | null;
  fecha?: string | null;
  created?: string | null;
}

function mapPerson(row: DesaparecidosPerson): ImportedMissingRecord {
  const location = row.ubicacion?.trim() || null;
  const { state, city } = parseLocation(location);
  const ageRaw = row.edad;
  const age =
    typeof ageRaw === "number"
      ? ageRaw
      : typeof ageRaw === "string" && ageRaw.trim()
        ? Number(ageRaw)
        : null;

  return {
    sourceSlug: "desaparecidos-terremoto",
    externalId: row.id,
    externalUrl: `${SITE_ORIGIN}/?id=${row.id}`,
    fullName: row.nombre.trim(),
    age: Number.isFinite(age) ? age : null,
    gender: null,
    nationalId: null,
    state,
    city,
    lastSeenLocation: location,
    lastSeenAt: row.fecha ? new Date(row.fecha) : row.created ? new Date(row.created) : null,
    description: row.descripcion,
    photoUrl: row.foto,
    contactName: "Reporte ciudadano",
    contactPhone: row.contacto?.trim() || "Por confirmar",
    contactEmail: null,
    status: row.estado === "localizado" ? "found" : "missing",
  };
}

export const desaparecidosTerremotoAdapter: SourceAdapter = {
  slug: "desaparecidos-terremoto",

  async fetchBatch(
    offset: number,
    limit: number,
    status: ImportedPersonStatus = "missing"
  ): Promise<ImportedMissingRecord[]> {
    const page = Math.floor(offset / limit) + 1;
    const estado = status === "found" ? "localizado" : "sin-contacto";
    const url = `${API_BASE}/personas?page=${page}&pageSize=${limit}&estado=${estado}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Origin: SITE_ORIGIN,
        Referer: `${SITE_ORIGIN}/`,
        "User-Agent": "EmergencyCenter/1.0 (+https://github.com/Zackness/emergency-center)",
      },
      signal: AbortSignal.timeout(90_000),
    });

    if (res.status === 403) {
      throw new Error(
        "Desaparecidos Terremoto exige reCAPTCHA en su API. Sincroniza manualmente o contacta al operador de la plataforma."
      );
    }

    if (!res.ok) {
      throw new Error(`Desaparecidos Terremoto API ${res.status}`);
    }

    const data = (await res.json()) as { items?: DesaparecidosPerson[] };
    return (data.items ?? []).map(mapPerson);
  },
};
