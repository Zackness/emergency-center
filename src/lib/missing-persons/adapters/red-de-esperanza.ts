import {
  getRedEsperanzaConfig,
  RED_ESPERANZA_SITE_URL,
} from "@/lib/missing-persons/red-esperanza-config";
import { parseLocation } from "@/lib/missing-persons/location";
import type {
  ImportedMissingRecord,
  ImportedPersonStatus,
  SourceAdapter,
  SourcePageResult,
} from "@/lib/missing-persons/types";

const SELECT_FIELDS =
  "id,nombre,edad,genero,fecha_desaparicion,ultima_ubicacion,lat,lng,foto_url,contacto_familiar,estado,fuente,creado_en";

interface RedEsperanzaPerson {
  id: string;
  nombre: string;
  edad: number | null;
  genero: string | null;
  fecha_desaparicion: string | null;
  ultima_ubicacion: string | null;
  lat: number | null;
  lng: number | null;
  foto_url: string | null;
  contacto_familiar: string | null;
  estado: string;
  fuente: string | null;
  creado_en: string;
}

function parseContact(raw: string | null): { name: string; phone: string } {
  const contact = raw?.trim();
  if (!contact) return { name: "Reporte ciudadano", phone: "Por confirmar" };

  const phoneMatch = contact.match(/\d[\d\s\-().]{6,}/);
  const phone = phoneMatch?.[0].replace(/\s/g, "") ?? "Por confirmar";
  const name =
    contact
      .replace(phoneMatch?.[0] ?? "", "")
      .replace(/[,\s]+$/, "")
      .trim() || "Reporte ciudadano";

  return { name, phone };
}

function mapStatus(estado: string): ImportedPersonStatus {
  if (estado === "encontrado") return "found";
  return "missing";
}

function mapPerson(row: RedEsperanzaPerson): ImportedMissingRecord {
  const { state, city } = parseLocation(row.ultima_ubicacion);
  const { name, phone } = parseContact(row.contacto_familiar);

  return {
    sourceSlug: "red-de-esperanza",
    externalId: row.id,
    externalUrl: RED_ESPERANZA_SITE_URL,
    fullName: row.nombre.trim(),
    age: row.edad,
    gender: row.genero,
    nationalId: null,
    state,
    city,
    lastSeenLocation: row.ultima_ubicacion,
    lastSeenAt: row.fecha_desaparicion
      ? new Date(row.fecha_desaparicion)
      : row.creado_en
        ? new Date(row.creado_en)
        : null,
    description: row.fuente ? `Fuente: ${row.fuente}` : null,
    photoUrl: row.foto_url,
    contactName: name,
    contactPhone: phone,
    contactEmail: null,
    status: mapStatus(row.estado),
  };
}

function parseTotalFromContentRange(header: string | null): number | null {
  if (!header) return null;
  const match = header.match(/\/(\d+|\*)$/);
  if (!match || match[1] === "*") return null;
  const total = Number(match[1]);
  return Number.isFinite(total) ? total : null;
}

function supabaseHeaders(apiKey: string, withCount = false): HeadersInit {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    ...(withCount ? { Prefer: "count=exact" } : {}),
  };
}

async function fetchRedEsperanzaPage(
  offset: number,
  limit: number,
  status: ImportedPersonStatus
): Promise<SourcePageResult> {
  const { baseUrl, apiKey } = getRedEsperanzaConfig();
  const url = new URL(`${baseUrl}/rest/v1/desaparecidos`);
  url.searchParams.set("select", SELECT_FIELDS);
  url.searchParams.set("order", "creado_en.desc");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  if (status === "found") {
    url.searchParams.set("estado", "eq.encontrado");
  } else if (status === "missing") {
    url.searchParams.set("estado", "eq.no_encontrado");
  }

  const res = await fetch(url.toString(), {
    headers: supabaseHeaders(apiKey, true),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Red de Esperanza API ${res.status}: ${body.slice(0, 200)}`);
  }

  const rows = (await res.json()) as RedEsperanzaPerson[];
  const items = rows.map(mapPerson);
  const filtered =
    status === "found"
      ? items.filter((row) => row.status === "found")
      : status === "missing"
        ? items.filter((row) => row.status === "missing")
        : items;

  return {
    items: filtered,
    total: parseTotalFromContentRange(res.headers.get("content-range")),
  };
}

export const redDeEsperanzaAdapter: SourceAdapter = {
  slug: "red-de-esperanza",

  async fetchPage(offset, limit, status = "missing") {
    return fetchRedEsperanzaPage(offset, limit, status);
  },

  async fetchBatch(
    offset: number,
    limit: number,
    status: ImportedPersonStatus = "missing"
  ): Promise<ImportedMissingRecord[]> {
    const page = await fetchRedEsperanzaPage(offset, limit, status);
    return page.items;
  },
};
