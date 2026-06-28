#!/usr/bin/env npx tsx
/**
 * Descarga listados de niños desde NexoSignal (busca.nexosignal.co) y Red Ayuda.
 *
 * Uso: npm run fetch:children
 */
import { writeFile } from "node:fs/promises";
import { fetchAllChildrenEmergencyCasesForSnapshot } from "../src/lib/children-emergency/feed";

const OUTPUT = new URL("../src/data/children-emergency-records.json", import.meta.url);

async function main() {
  console.log("Descargando niños desde NexoSignal y Red Ayuda…");
  const items = await fetchAllChildrenEmergencyCasesForSnapshot();
  const payload = {
    fetched_at: new Date().toISOString(),
    count: items.length,
    items,
  };

  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const nexosignal = items.filter((i) => i.source === "nexosignal").length;
  const redayuda = items.filter((i) => i.source === "redayuda").length;
  console.log(
    `Guardados ${items.length} casos (${nexosignal} NexoSignal, ${redayuda} Red Ayuda) en src/data/children-emergency-records.json`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
