#!/usr/bin/env npx tsx
/**
 * Importa edificios desde terremotovenezuela.com y los guarda deduplicados en la BD.
 *
 * Uso:
 *   npm run sync:damage
 */
import { PrismaClient } from "@prisma/client";
import { syncDamageBuildings } from "@/lib/damage-map/sync";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";

const prisma = new PrismaClient();

async function main() {
  assertSafeDatabaseTarget("sync:damage");
  const result = await syncDamageBuildings(prisma);
  console.log("Sync de mapa de daños completado:", result);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
