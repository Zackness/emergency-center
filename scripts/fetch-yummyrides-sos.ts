#!/usr/bin/env npx tsx
import { writeFile } from "node:fs/promises";
import { fetchYummySosSnapshot } from "@/lib/yummyrides-sos/fetch";

const OUTPUT = new URL("../src/data/yummyrides-sos.json", import.meta.url);

async function main() {
  console.log("Scraping sos.yummyrides.com (reportes + directorio)…");
  const snapshot = await fetchYummySosSnapshot();
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Guardado → src/data/yummyrides-sos.json |` +
      ` reportes: ${snapshot.damage_reports.length}` +
      ` (total sitio: ${snapshot.stats.report_count ?? "?"})` +
      ` | acopios: ${snapshot.help_centers.length}` +
      ` (total sitio: ${snapshot.stats.acopio_count ?? "?"})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
