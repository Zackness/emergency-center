#!/usr/bin/env npx tsx
/**
 * Scraping unificado de plataformas aliadas activas en BD.
 * Escribe snapshots en data_cache y JSON local; sincroniza tablas cuando hay adaptador.
 *
 * Uso:
 *   npm run sync:allied-scrapers
 *   npm run sync:allied-scrapers -- --fetch-only
 *   npm run sync:allied-scrapers -- --sync-only
 *   npm run sync:allied-scrapers -- --dry-run
 *   npm run sync:allied-scrapers -- --adapter=donarseguro
 */
import { runAlliedScrapers } from "@/lib/allied-scrapers/runner";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function adapterFilter(): string[] | undefined {
  const ids = process.argv
    .filter((arg) => arg.startsWith("--adapter="))
    .map((arg) => arg.slice("--adapter=".length))
    .filter(Boolean);
  return ids.length ? ids : undefined;
}

async function main() {
  const snapshot = await runAlliedScrapers({
    fetchOnly: hasFlag("--fetch-only"),
    syncOnly: hasFlag("--sync-only"),
    dryRun: hasFlag("--dry-run"),
    adapterIds: adapterFilter(),
  });

  const ok = snapshot.results.filter((r) => r.status === "ok").length;
  const skipped = snapshot.results.filter((r) => r.status === "skipped").length;
  const errors = snapshot.results.filter((r) => r.status === "error");

  console.log(`\nResumen: ${ok} ok, ${skipped} omitidos, ${errors.length} errores`);
  if (errors.length) {
    for (const err of errors) {
      console.error(`  ✗ ${err.label}: ${err.error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
