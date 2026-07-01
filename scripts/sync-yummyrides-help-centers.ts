#!/usr/bin/env npx tsx
import { readFile } from "node:fs/promises";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";
import { syncYummyHelpCentersRest } from "@/lib/yummyrides-sos/sync-help-centers-rest";
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
  assertSafeDatabaseTarget("sync:yummyrides-help-centers");

  const raw = await readFile(SNAPSHOT, "utf8");
  const snapshot = JSON.parse(raw) as YummySosSnapshot;
  const centers = snapshot.help_centers ?? [];

  console.log(`Centros Yummy SOS a sincronizar: ${centers.length}`);
  const result = await syncYummyHelpCentersRest(centers);
  console.log(
    `\nSync acopios Yummy SOS completado: creados=${result.created} actualizados=${result.updated}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
