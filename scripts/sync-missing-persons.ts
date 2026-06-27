#!/usr/bin/env npx tsx
/**
 * Importa registros de plataformas aliadas que registran desaparecidos (landing page).
 *
 * Requiere en .env:
 *   PUBLIC_SUPABASE_URL
 *   SUPABASE_SECRET_KEY
 *
 * Si tu .env apunta a producción, el guard bloqueará hasta que confirmes:
 *   CONFIRM_PRODUCTION_DB=1 npm run sync:missing
 *
 * Alternativa remota (sin escribir desde tu PC):
 *   npm run sync:missing:remote
 *
 * Uso:
 *   npm run sync:missing
 *   npm run sync:missing -- --limit=500
 *   npm run sync:missing -- --source=venezuela-te-busca
 */
import {
  getMissingPersonsStatsRest,
  syncMissingPersonsRest,
} from "@/lib/missing-persons/sync-rest";
import { resolveMissingPersonSyncSlugsAsync } from "@/lib/missing-persons/sync-source-registry";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

function assertSyncEnv() {
  const missing: string[] = [];
  if (!process.env.PUBLIC_SUPABASE_URL?.trim()) missing.push("PUBLIC_SUPABASE_URL");
  if (!process.env.SUPABASE_SECRET_KEY?.trim()) missing.push("SUPABASE_SECRET_KEY");

  if (missing.length) {
    console.error("Faltan variables en .env:", missing.join(", "));
    console.error("Copia .env.example y completa las claves de tu proyecto Supabase.");
    process.exit(1);
  }
}

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
  loadEnv();
  assertSyncEnv();
  assertSafeDatabaseTarget("sync:missing");

  const options = parseArgs();
  const slugs = await resolveMissingPersonSyncSlugsAsync(options.sourceSlugs);

  if (!slugs.length) {
    console.error("No hay fuentes de sync configuradas. Revisa sync-source-registry.ts");
    process.exit(1);
  }

  console.log("Sincronizando desaparecidos (REST)…", options);
  console.log("Fuentes aliadas de desaparecidos:", slugs.join(", "));

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
  console.error("\nSync falló:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
