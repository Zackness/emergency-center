#!/usr/bin/env npx tsx
/**
 * Descarga centros de acopio y deliveries desde centroacopio.site.
 *
 * Uso: npm run fetch:centroacopio
 */
import { writeFile } from "node:fs/promises";
import { fetchCentroacopioSnapshot } from "@/lib/help-centers/centroacopio";

const OUTPUT = new URL("../src/data/centroacopio.json", import.meta.url);

async function main() {
  console.log("Scraping centroacopio.site (barrido por ciudades + deliveries)…");
  const snapshot = await fetchCentroacopioSnapshot();
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Guardado: ${snapshot.centers.length} centros, ${snapshot.deliveries.length} deliveries → src/data/centroacopio.json`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
