#!/usr/bin/env npx tsx
/**
 * Descarga edificios con da�o probable desde la API ArcGIS de NASA (Sentinel-1).
 * Producto experimental � ver NASA_DAMAGE_WEBMAP para el mapa oficial.
 *
 * Uso:
 *   npm run fetch:nasa-damage
 *   npm run fetch:nasa-damage -- --min-prob 0.5
 *   npm run fetch:nasa-damage -- --max 5000
 */
import { writeFile } from "node:fs/promises";
import {
  NASA_DAMAGE_ESTIMATE_TOTAL,
  NASA_DAMAGE_FEATURE_SERVER,
  NASA_DAMAGE_STRUCTURES_LAYER,
  NASA_DAMAGE_WEBMAP,
  NASA_DAMAGE_ATTRIBUTION,
} from "@/lib/damage-map/nasa-config";
import { polygonCentroid, type NasaDamageFeature } from "@/lib/damage-map/nasa";

const OUTPUT = new URL("../src/data/nasa-damage-buildings.json", import.meta.url);
const PAGE_SIZE = 2000;

interface ArcGisFeature {
  attributes: {
    overture_id?: string;
    label?: string;
    damage?: number;
    damage_probability?: number;
    coverage_fraction?: number;
    class?: string;
    subtype?: string;
  };
  geometry?: {
    rings?: number[][][];
    x?: number;
    y?: number;
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let minProb = 0.75;
  let maxRecords = Number.POSITIVE_INFINITY;

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--min-prob" && args[i + 1]) {
      minProb = Number(args[i + 1]);
      i += 1;
    } else if (args[i] === "--max" && args[i + 1]) {
      maxRecords = Number(args[i + 1]);
      i += 1;
    }
  }

  return { minProb, maxRecords };
}

function featureCentroid(feature: ArcGisFeature): [number, number] | null {
  const geom = feature.geometry;
  if (!geom) return null;
  if (typeof geom.x === "number" && typeof geom.y === "number") {
    return [geom.y, geom.x];
  }
  if (geom.rings?.length) {
    return polygonCentroid(geom.rings);
  }
  return null;
}

async function fetchCount(where: string): Promise<number | null> {
  const url = new URL(
    `${NASA_DAMAGE_FEATURE_SERVER}/${NASA_DAMAGE_STRUCTURES_LAYER}/query`
  );
  url.searchParams.set("where", where);
  url.searchParams.set("returnCountOnly", "true");
  url.searchParams.set("f", "json");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { count?: number };
  return data.count ?? null;
}

async function fetchPage(where: string, offset: number): Promise<ArcGisFeature[]> {
  const url = new URL(
    `${NASA_DAMAGE_FEATURE_SERVER}/${NASA_DAMAGE_STRUCTURES_LAYER}/query`
  );
  url.searchParams.set("where", where);
  url.searchParams.set(
    "outFields",
    "overture_id,label,damage,damage_probability,coverage_fraction,class,subtype"
  );
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("resultOffset", String(offset));
  url.searchParams.set("resultRecordCount", String(PAGE_SIZE));
  url.searchParams.set("f", "json");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NASA ArcGIS query failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const data = (await res.json()) as { features?: ArcGisFeature[]; error?: { message?: string } };
  if (data.error?.message) {
    throw new Error(`NASA ArcGIS error: ${data.error.message}`);
  }
  return data.features ?? [];
}

async function main() {
  const { minProb, maxRecords } = parseArgs();
  const where = `damage=1 AND damage_probability>=${minProb}`;
  const filterLabel = `damage=1 AND damage_probability>=${minProb}`;

  console.log(`Consultando NASA ArcGIS (${filterLabel})�`);
  const totalAvailable = await fetchCount(where);
  if (totalAvailable != null) {
    console.log(`Registros disponibles en NASA: ${totalAvailable.toLocaleString()}`);
  }

  const items: NasaDamageFeature[] = [];
  let offset = 0;

  while (items.length < maxRecords) {
    console.log(`  P�gina offset=${offset}�`);
    const batch = await fetchPage(where, offset);
    if (!batch.length) break;

    for (const feature of batch) {
      if (items.length >= maxRecords) break;
      const id = feature.attributes.overture_id?.trim();
      if (!id) continue;
      const centroid = featureCentroid(feature);
      if (!centroid) continue;

      items.push({
        overture_id: id,
        label: feature.attributes.label ?? null,
        damage: feature.attributes.damage ?? 1,
        damage_probability: feature.attributes.damage_probability ?? 0,
        coverage_fraction: feature.attributes.coverage_fraction ?? null,
        class: feature.attributes.class ?? null,
        subtype: feature.attributes.subtype ?? null,
        latitude: centroid[0],
        longitude: centroid[1],
      });
    }

    offset += batch.length;
    if (batch.length < PAGE_SIZE) break;
  }

  const payload = {
    source: `${NASA_DAMAGE_FEATURE_SERVER}/${NASA_DAMAGE_STRUCTURES_LAYER}`,
    webmap: NASA_DAMAGE_WEBMAP,
    attribution: NASA_DAMAGE_ATTRIBUTION,
    fetched_at: new Date().toISOString(),
    filter: filterLabel,
    estimate_total: NASA_DAMAGE_ESTIMATE_TOTAL,
    count: items.length,
    items,
  };

  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Guardado: ${items.length.toLocaleString()} edificios en src/data/nasa-damage-buildings.json`);
  console.log(`Mapa oficial NASA: ${NASA_DAMAGE_WEBMAP}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
