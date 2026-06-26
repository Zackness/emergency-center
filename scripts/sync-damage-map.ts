#!/usr/bin/env npx tsx
/**
 * Importa edificios del mapa de daños a Supabase vía API REST (HTTPS).
 * No requiere DATABASE_URL / pooler :6543.
 *
 * Uso:
 *   npm run sync:damage
 *   npm run sync:damage -- --from-file   # usa src/data/damage-buildings.json
 */
import { readFile } from "node:fs/promises";
import {
  syncDamageBuildingsRest,
  syncDamageBuildingsRestLive,
} from "@/lib/damage-map/sync-rest";
import type { ImportedBuilding } from "@/lib/damage-map/types";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";

const SNAPSHOT = new URL("../src/data/damage-buildings.json", import.meta.url);

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

async function loadFromFile(): Promise<ImportedBuilding[]> {
  const raw = await readFile(SNAPSHOT, "utf8");
  const data = JSON.parse(raw) as { items: ImportedBuilding[]; fetched_at?: string };
  console.log(
    `Snapshot local: ${data.items?.length ?? 0} edificios` +
      (data.fetched_at ? ` (descargado ${data.fetched_at})` : "")
  );
  return data.items ?? [];
}

async function main() {
  loadEnv();
  assertSafeDatabaseTarget("sync:damage");

  const fromFile = process.argv.includes("--from-file");
  const result = fromFile
    ? await syncDamageBuildingsRest(await loadFromFile())
    : await syncDamageBuildingsRestLive();

  console.log("\nSync mapa de daños completado (REST):");
  console.log(`  recibidos=${result.fetched} nuevos=${result.created} actualizados=${result.updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
