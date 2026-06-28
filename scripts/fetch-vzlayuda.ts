#!/usr/bin/env npx tsx
/**
 * Descarga ofertas y solicitudes desde vzlayuda.com.
 *
 * Uso: npm run fetch:vzlayuda
 */
import { writeFile } from "node:fs/promises";
import { fetchVzlaAyudaSnapshot } from "@/lib/vzlayuda/fetch";

const OUTPUT = new URL("../src/data/vzlayuda-avisos.json", import.meta.url);

async function main() {
  console.log("Scraping vzlayuda.com (HTML + POST /api/buscar)…");
  const snapshot = await fetchVzlaAyudaSnapshot();
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Guardado → src/data/vzlayuda-avisos.json | total: ${snapshot.counts.total} (ofertas: ${snapshot.counts.oferta}, solicitudes: ${snapshot.counts.solicitud})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
