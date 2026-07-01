#!/usr/bin/env npx tsx
/**
 * Sincroniza el catálogo de plataformas aliadas (src/data/allied-platforms.ts) → BD.
 * Inserta las que falten y actualiza textos/URLs/colores de las existentes.
 */
import { ALLIED_PLATFORMS } from "../src/data/allied-platforms";
import { upsertAlliedPlatformCatalog } from "../src/lib/allied-platforms/service";
import { isDatabaseConfigured } from "../src/lib/prisma";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL no configurada.");
    process.exit(1);
  }

  console.log(`Sincronizando ${ALLIED_PLATFORMS.length} plataformas aliadas…`);
  const { created, updated } = await upsertAlliedPlatformCatalog(ALLIED_PLATFORMS);
  console.log(`Listo: ${created} nuevas, ${updated} actualizadas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
