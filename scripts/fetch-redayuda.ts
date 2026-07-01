#!/usr/bin/env npx tsx
/**
 * Descarga estadísticas, sismos USGS y contenido estático de redayudavenezuela.com.
 * Si la API falla, conserva stats/sismos del snapshot anterior.
 *
 * Uso: npm run fetch:redayuda
 */
import { readFile, writeFile } from "node:fs/promises";
import { fetchRedAyudaSnapshot, mergeRedAyudaSnapshots } from "@/lib/redayuda/fetch";
import type { RedAyudaSnapshot } from "@/lib/redayuda/types";

const OUTPUT = new URL("../src/data/redayuda.json", import.meta.url);

async function loadPrevious(): Promise<RedAyudaSnapshot | null> {
  try {
    const raw = await readFile(OUTPUT, "utf8");
    return JSON.parse(raw) as RedAyudaSnapshot;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Scraping redayudavenezuela.com (stats, sismos, home)…");
  const previous = await loadPrevious();
  const fresh = await fetchRedAyudaSnapshot();
  const snapshot = mergeRedAyudaSnapshots(previous, fresh);

  const preserved: string[] = [];
  if (!fresh.stats && snapshot.stats) preserved.push("stats");
  if (!fresh.quakes.length && snapshot.quakes.length) preserved.push("quakes");
  if (fresh.ninos == null && snapshot.ninos != null) preserved.push("ninos");
  if (fresh.denuncias == null && snapshot.denuncias != null) preserved.push("denuncias");

  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const stats = snapshot.stats;
  console.log(
    `Guardado → src/data/redayuda.json` +
      (stats
        ? ` | desaparecidos: ${stats.desaparecidos.toLocaleString()}, puntos: ${stats.puntos}, salvo: ${stats.salvo.toLocaleString()}`
        : " | sin stats"),
  );
  console.log(
    `Sismos USGS: ${snapshot.quakes.length} | Hospitales Caracas: ${snapshot.hospitals.length}` +
      (preserved.length ? ` | conservado del snapshot previo: ${preserved.join(", ")}` : ""),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
