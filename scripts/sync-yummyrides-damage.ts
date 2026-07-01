#!/usr/bin/env npx tsx
import { readFile } from "node:fs/promises";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";
import { yummyReportsToBuildings } from "@/lib/yummyrides-sos/normalize";
import { syncYummyDamageReportsRest } from "@/lib/yummyrides-sos/sync-damage-rest";
import type { YummySosSnapshot } from "@/lib/yummyrides-sos/types";

const SNAPSHOT = new URL("../src/data/yummyrides-sos.json", import.meta.url);

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

async function main() {
  loadEnv();
  assertSafeDatabaseTarget("sync:yummyrides-damage");

  const raw = await readFile(SNAPSHOT, "utf8");
  const snapshot = JSON.parse(raw) as YummySosSnapshot;
  const buildings = yummyReportsToBuildings(
    snapshot.damage_reports ?? [],
    snapshot.fetched_at
  );

  console.log(`Reportes Yummy SOS a sincronizar: ${buildings.length}`);
  const result = await syncYummyDamageReportsRest(buildings);
  console.log(
    `\nSync daños Yummy SOS completado:` +
      ` recibidos=${result.fetched} nuevos=${result.created} actualizados=${result.updated}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
