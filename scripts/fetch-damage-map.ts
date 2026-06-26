#!/usr/bin/env npx tsx
/**
 * Descarga todos los edificios de terremotovenezuela.com y los guarda en JSON local.
 *
 * Uso:
 *   npm run fetch:damage
 */
import { writeFile } from "node:fs/promises";

const SUPABASE_URL = process.env.TERREMOTO_VZLA_SUPABASE_URL ?? "https://jckifxsdlnsvbztxydes.supabase.co";
const SUPABASE_KEY =
  process.env.TERREMOTO_VZLA_SUPABASE_KEY ?? "sb_publishable_i7iEDrCVZcSt0k3RGFrY4g_WrtZBB4w";
const BUILDINGS_SELECT =
  "id,name,address,city,zone,lat,lng,damage_level,status,main_photo_url,media_urls,last_updated_at,has_missing_persons";
const OUTPUT = new URL("../src/data/damage-buildings.json", import.meta.url);

const STATE_ALIASES: Record<string, string> = {
  "distrito capital": "Distrito Capital",
  "la guaira": "La Guaira",
  vargas: "La Guaira",
  carabobo: "Carabobo",
  miranda: "Miranda",
  aragua: "Aragua",
  zulia: "Zulia",
  lara: "Lara",
  mérida: "Mérida",
  merida: "Mérida",
  anzoátegui: "Anzoátegui",
  anzoategui: "Anzoátegui",
  apure: "Apure",
  falcón: "Falcón",
  falcon: "Falcón",
};

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

function mapExternalDamageLevel(level: string): "collapsed" | "damaged" | "evacuated" {
  const normalized = level.trim().toLowerCase();
  if (normalized === "total") return "collapsed";
  if (normalized === "severo" || normalized === "severe") return "damaged";
  return "evacuated";
}

function inferState(city: string, address: string | null, zone: string | null): string {
  const haystack = `${city} ${address ?? ""} ${zone ?? ""}`.toLowerCase();
  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (haystack.includes(alias)) return state;
  }
  return city || "Venezuela";
}

function dedupeImageUrls(
  mainPhotoUrl: string | null | undefined,
  mediaUrls: string[] | null | undefined
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of [mainPhotoUrl, ...(mediaUrls ?? [])]) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function mapRow(row: ExternalBuildingRow) {
  const imageUrls = dedupeImageUrls(row.main_photo_url, row.media_urls);

  const city = row.city?.trim() || row.zone?.trim() || "Venezuela";
  const address = row.address?.trim() || null;
  const zone = row.zone?.trim() || null;

  return {
    externalId: row.id,
    title: row.name?.trim() || address || `Edificio en ${city}`,
    address,
    city,
    zone,
    state: inferState(city, address, zone),
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

async function fetchAllBuildings() {
  const pageSize = 1000;
  const all: ReturnType<typeof mapRow>[] = [];
  let offset = 0;

  while (true) {
    const url = new URL("/rest/v1/buildings", SUPABASE_URL);
    url.searchParams.set("select", BUILDINGS_SELECT);
    url.searchParams.set("order", "last_updated_at.desc");

    const response = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
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

async function main() {
  console.log("Descargando edificios desde terremotovenezuela.com…");
  const items = await fetchAllBuildings();
  const payload = {
    source: "https://terremotovenezuela.com/",
    fetched_at: new Date().toISOString(),
    count: items.length,
    items,
  };

  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Guardados ${items.length} edificios en src/data/damage-buildings.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
