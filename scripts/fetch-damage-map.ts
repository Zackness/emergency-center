#!/usr/bin/env npx tsx
/**
 * Descarga edificios de terremotovenezuela.com y los guarda en JSON local.
 * Fusiona con el snapshot existente (no elimina registros previos).
 *
 * Uso:
 *   npm run fetch:damage
 */
import { readFile, writeFile } from "node:fs/promises";
import {
  dedupeImageUrls,
  inferState,
  mapExternalDamageLevel,
} from "@/lib/damage-map/normalize";
import type { ImportedBuilding } from "@/lib/damage-map/types";

const SUPABASE_URL = process.env.TERREMOTO_VZLA_SUPABASE_URL ?? "https://jckifxsdlnsvbztxydes.supabase.co";
const SUPABASE_KEY =
  process.env.TERREMOTO_VZLA_SUPABASE_KEY ?? "sb_publishable_i7iEDrCVZcSt0k3RGFrY4g_WrtZBB4w";
const BUILDINGS_SELECT =
  "id,name,address,city,zone,lat,lng,damage_level,status,main_photo_url,media_urls,last_updated_at,has_missing_persons";
const OUTPUT = new URL("../src/data/damage-buildings.json", import.meta.url);

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

interface SnapshotFile {
  source: string;
  fetched_at: string;
  count: number;
  items: ImportedBuilding[];
  merge_stats?: {
    remote: number;
    previous: number;
    added: number;
    updated: number;
    preserved: number;
  };
}

function mapRow(row: ExternalBuildingRow): ImportedBuilding {
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
  const all: ImportedBuilding[] = [];
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

async function loadExistingSnapshot(): Promise<ImportedBuilding[]> {
  try {
    const raw = await readFile(OUTPUT, "utf8");
    const data = JSON.parse(raw) as SnapshotFile;
    return data.items ?? [];
  } catch {
    return [];
  }
}

/** Une remoto + local: remoto gana en conflicto; conserva entradas solo locales. */
function mergeBuildings(
  existing: ImportedBuilding[],
  remote: ImportedBuilding[]
): { items: ImportedBuilding[]; stats: SnapshotFile["merge_stats"] } {
  const byId = new Map<string, ImportedBuilding>();

  for (const item of existing) {
    byId.set(item.externalId, item);
  }

  let added = 0;
  let updated = 0;

  for (const item of remote) {
    if (byId.has(item.externalId)) updated += 1;
    else added += 1;
    byId.set(item.externalId, item);
  }

  const preserved = existing.filter((item) => !remote.some((r) => r.externalId === item.externalId)).length;

  const items = [...byId.values()]
    .map((item) => ({
      ...item,
      state: inferState(item.city, item.address ?? null, item.zone ?? null),
    }))
    .sort((a, b) => {
    const ta = a.sourceSyncedAt ?? "";
    const tb = b.sourceSyncedAt ?? "";
    return tb.localeCompare(ta);
  });

  return {
    items,
    stats: {
      remote: remote.length,
      previous: existing.length,
      added,
      updated,
      preserved,
    },
  };
}

async function main() {
  console.log("Descargando edificios desde terremotovenezuela.com…");
  const remote = await fetchAllBuildings();
  const existing = await loadExistingSnapshot();
  const { items, stats } = mergeBuildings(existing, remote);

  const payload: SnapshotFile = {
    source: "https://terremotovenezuela.com/",
    fetched_at: new Date().toISOString(),
    count: items.length,
    items,
    merge_stats: stats,
  };

  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Remoto: ${stats?.remote ?? 0} · Previo: ${stats?.previous ?? 0}`);
  console.log(
    `Merge: +${stats?.added ?? 0} nuevos · ${stats?.updated ?? 0} actualizados · ${stats?.preserved ?? 0} conservados del snapshot`
  );
  console.log(`Total en src/data/damage-buildings.json: ${items.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
