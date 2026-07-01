#!/usr/bin/env npx tsx
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isDatabaseConfigured, prisma } from "../src/lib/prisma";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL no configurada");
    process.exit(1);
  }

  const path = resolve(
    import.meta.dirname,
    "../supabase/migrations/20260630200000_allied_yummyrides_donarseguro.sql"
  );
  const sql = await readFile(path, "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log("Migración plataformas aliadas (Yummy SOS + DonarSeguro) aplicada.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
