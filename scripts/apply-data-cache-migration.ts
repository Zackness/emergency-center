#!/usr/bin/env npx tsx
import { isDatabaseConfigured, prisma } from "../src/lib/prisma";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL no configurada");
    process.exit(1);
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS data_cache (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug       TEXT NOT NULL UNIQUE,
      payload    JSONB NOT NULL DEFAULT '{}',
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS data_cache_slug_idx ON data_cache (slug)
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE data_cache ENABLE ROW LEVEL SECURITY
  `);

  try {
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public read data_cache"
        ON data_cache FOR SELECT
        USING (true)
    `);
  } catch {
    // policy may already exist
  }

  console.log("Tabla data_cache lista.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
