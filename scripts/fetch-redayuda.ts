#!/usr/bin/env npx tsx
/**
 * Descarga estadísticas, sismos USGS y contenido estático de redayudavenezuela.com.
 *
 * Uso: npm run fetch:redayuda
 */
import { writeFile } from "node:fs/promises";
import { fetchRedAyudaSnapshot } from "@/lib/redayuda/fetch";

const OUTPUT = new URL("../src/data/redayuda.json", import.meta.url);

async function main() {
  console.log("Scraping redayudavenezuela.com (stats, sismos, home)…");
  const snapshot = await fetchRedAyudaSnapshot();
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const stats = snapshot.stats;
  console.log(
    `Guardado → src/data/redayuda.json` +
      (stats
        ? ` | desaparecidos: ${stats.desaparecidos.toLocaleString()}, puntos: ${stats.puntos}, salvo: ${stats.salvo.toLocaleString()}`
        : "")
  );
  console.log(`Sismos USGS: ${snapshot.quakes.length} | Hospitales Caracas: ${snapshot.hospitals.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
