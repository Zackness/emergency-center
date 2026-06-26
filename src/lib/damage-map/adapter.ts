import type { ImportedBuilding } from "./types";
import { dedupeImageUrls, inferState, mapExternalDamageLevel } from "./normalize";

export const DAMAGE_MAP_EXTERNAL_SOURCE = "terremotovenezuela" as const;

const DEFAULT_SUPABASE_URL = "https://jckifxsdlnsvbztxydes.supabase.co";
// Clave publicable (anon, solo lectura) del SPA público de terremotovenezuela.com.
// Está embebida en el cliente del sitio aliado y protegida por RLS; sirve como
// valor por defecto para que el mapa funcione sin configuración adicional.
const DEFAULT_SUPABASE_KEY = "sb_publishable_i7iEDrCVZcSt0k3RGFrY4g_WrtZBB4w";
const BUILDINGS_SELECT =
  "id,name,address,city,zone,lat,lng,damage_level,status,main_photo_url,media_urls,last_updated_at,has_missing_persons";

interface ExternalBuildingRow {
  id: string;
  name: string;
  address: string | null;
  city: string;
  zone: string | null;
  lat: number;
  lng: number;
  damage_level: string;
  status: string | null;
  main_photo_url: string | null;
  media_urls: string[] | null;
  last_updated_at: string;
  has_missing_persons: boolean | null;
}

function getConfig() {
  // `import.meta.env` solo existe en el runtime de Vite/Astro; en scripts tsx
  // o Node puro es undefined, por eso usamos optional chaining + process.env.
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  const baseUrl =
    env?.TERREMOTO_VZLA_SUPABASE_URL ??
    process.env.TERREMOTO_VZLA_SUPABASE_URL ??
    DEFAULT_SUPABASE_URL;
  const apiKey =
    env?.TERREMOTO_VZLA_SUPABASE_KEY ??
    process.env.TERREMOTO_VZLA_SUPABASE_KEY ??
    DEFAULT_SUPABASE_KEY;
  return { baseUrl, apiKey };
}

function mapRow(row: ExternalBuildingRow): ImportedBuilding {
  const imageUrls = dedupeImageUrls(row.main_photo_url, row.media_urls);

  const city = row.city?.trim() || row.zone?.trim() || "Venezuela";
  const address = row.address?.trim() || null;
  const zone = row.zone?.trim() || null;
  const state = inferState(city, address, zone);

  const notes: string[] = [];
  if (zone) notes.push(`Zona: ${zone}`);
  if (row.status) notes.push(`Estado del reporte: ${row.status}`);
  if (row.has_missing_persons) notes.push("Reporte asociado a personas desaparecidas");

  return {
    externalId: row.id,
    title: row.name?.trim() || address || `Edificio en ${city}`,
    address,
    city,
    zone,
    state,
    latitude: row.lat,
    longitude: row.lng,
    severity: mapExternalDamageLevel(row.damage_level),
    imageUrls,
    isVerified: ["verified", "confirmed", "verificado", "confirmado"].includes(
      (row.status ?? "").toLowerCase()
    ),
    sourceSyncedAt: row.last_updated_at,
    sourceUrl: "https://terremotovenezuela.com/",
  };
}

export async function fetchExternalBuildings(): Promise<ImportedBuilding[]> {
  const { baseUrl, apiKey } = getConfig();
  if (!apiKey) {
    throw new Error(
      "TERREMOTO_VZLA_SUPABASE_KEY no configurada. Usa la clave publicable del mapa de daños."
    );
  }

  const pageSize = 1000;
  const all: ImportedBuilding[] = [];
  let offset = 0;

  while (true) {
    const url = new URL("/rest/v1/buildings", baseUrl);
    url.searchParams.set("select", BUILDINGS_SELECT);
    url.searchParams.set("order", "last_updated_at.desc");

    const response = await fetch(url.toString(), {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Range: `${offset}-${offset + pageSize - 1}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Error al obtener edificios (${response.status}): ${body}`);
    }

    const rows = (await response.json()) as ExternalBuildingRow[];
    if (!rows.length) break;

    for (const row of rows) {
      if (typeof row.lat !== "number" || typeof row.lng !== "number") continue;
      all.push(mapRow(row));
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}
