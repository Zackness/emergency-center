#!/usr/bin/env npx tsx
/**
 * Sincroniza snapshots JSON scrapeados a la tabla data_cache.
 * Ejecutar tras fetch:* o como parte de sync:all.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DATA_CACHE_SLUGS, setDataCache } from "../src/lib/data-cache";
import { isDatabaseConfigured } from "../src/lib/prisma";

const ROOT = resolve(import.meta.dirname, "..");

type CacheEntry = {
  slug: (typeof DATA_CACHE_SLUGS)[keyof typeof DATA_CACHE_SLUGS];
  file: string;
  label: string;
};

const ENTRIES: CacheEntry[] = [
  { slug: DATA_CACHE_SLUGS.MISSING_PETS, file: "src/data/missing-pets.json", label: "Mascotas" },
  {
    slug: DATA_CACHE_SLUGS.CHILDREN_EMERGENCY,
    file: "src/data/children-emergency-records.json",
    label: "Niños en emergencia",
  },
  {
    slug: DATA_CACHE_SLUGS.VZLAYUDA_AVISOS,
    file: "src/data/vzlayuda-avisos.json",
    label: "VzlaAyuda avisos",
  },
  { slug: DATA_CACHE_SLUGS.REDAYUDA, file: "src/data/redayuda.json", label: "Red Ayuda" },
  { slug: DATA_CACHE_SLUGS.CENTROACOPIO, file: "src/data/centroacopio.json", label: "Centroacopio" },
  { slug: DATA_CACHE_SLUGS.DONARSEGURO, file: "src/data/donarseguro.json", label: "DonarSeguro" },
  { slug: DATA_CACHE_SLUGS.YUMMYRIDES_SOS, file: "src/data/yummyrides-sos.json", label: "Yummy SOS" },
];

async function syncEntry(entry: CacheEntry): Promise<void> {
  const path = resolve(ROOT, entry.file);
  const raw = await readFile(path, "utf8");
  const payload = JSON.parse(raw) as unknown;
  const fetchedAt = new Date();
  await setDataCache(entry.slug, payload, fetchedAt);
  console.log(`✓ ${entry.label} → data_cache (${entry.slug})`);
}

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL no configurada. Omite sync:data-cache.");
    process.exit(1);
  }

  console.log("Sincronizando snapshots JSON → data_cache…");
  for (const entry of ENTRIES) {
    try {
      await syncEntry(entry);
    } catch (err) {
      console.error(`✗ ${entry.label}:`, err instanceof Error ? err.message : err);
      process.exit(1);
    }
  }
  console.log("data_cache actualizado.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
