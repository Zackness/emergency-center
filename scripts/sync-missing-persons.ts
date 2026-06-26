#!/usr/bin/env npx tsx
/**
 * Importa registros de plataformas externas y los deduplica en la BD vía REST.
 * No requiere DATABASE_URL (puerto 6543); usa HTTPS como sync:hospitals.
 *
 * Fuentes con API pública:
 * - Venezuela Te Busca, Encuéntralos, Terremoto Venezuela App
 * - Venezuela Reporta (búsqueda por términos)
 * - Desaparecidos Terremoto (requiere reCAPTCHA en su API; puede fallar)
 *
 * Uso:
 *   npm run sync:missing              # sincroniza TODAS las páginas de cada fuente
 *   npm run sync:missing -- --limit=500
 *   npm run sync:missing -- --source=venezuela-te-busca
 */
import {
  getMissingPersonsStatsRest,
  syncMissingPersonsRest,
} from "@/lib/missing-persons/sync-rest";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";

function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    sourceSlugs?: string[];
    offset?: number;
    limit?: number;
    batchSize?: number;
    fetchAll?: boolean;
    all?: boolean;
  } = {};

  for (const arg of args) {
    if (arg.startsWith("--source=")) {
      options.sourceSlugs = arg.replace("--source=", "").split(",");
    } else if (arg.startsWith("--offset=")) {
      options.offset = Number(arg.replace("--offset=", ""));
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.replace("--limit=", ""));
    } else if (arg.startsWith("--batch=")) {
      options.batchSize = Number(arg.replace("--batch=", ""));
    } else if (arg === "--all" || arg === "--fetch-all") {
      options.fetchAll = true;
    } else if (arg === "--quick") {
      options.limit = 500;
    }
  }

  if (options.limit == null && !options.fetchAll) {
    options.fetchAll = true;
  }

  return options;
}

async function main() {
  assertSafeDatabaseTarget("sync:missing");

  const options = parseArgs();
  console.log("Sincronizando desaparecidos (REST)…", options);

  const results = await syncMissingPersonsRest(options);
  const stats = await getMissingPersonsStatsRest();

  console.log("\nResultados por fuente:");
  for (const r of results) {
    console.log(
      `  ${r.source}: fetched=${r.fetched} created=${r.created} linked=${r.linked} updated=${r.updated} skipped=${r.skipped}`
    );
    if (r.errors.length) {
      console.log(`    errores (${r.errors.length}):`, r.errors.slice(0, 5));
    }
  }

  console.log("\nEstadísticas consolidadas:");
  console.log(`  Personas únicas activas: ${stats.unique_active}`);
  console.log(`  Registros externos vinculados: ${stats.total_external_records}`);
  for (const s of stats.sources) {
    console.log(`  ${s.name}: ${s.records} registros importados`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
