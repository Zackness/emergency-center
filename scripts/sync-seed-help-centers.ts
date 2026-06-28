#!/usr/bin/env npx tsx
/**
 * Sincroniza el catlogo local SEED_HELP_CENTERS ? tabla help_centers (Supabase REST).
 *
 * - Deduplica por marcador [[seed:ID]] o por nombre+ciudad
 * - Actualiza registros existentes para alinear datos locales con la BD
 *
 * Uso:
 *   npm run sync:seed-help-centers
 *   npm run sync:seed-help-centers -- --dry-run
 *   npm run sync:seed-help-centers -- --only bomberos-valencia
 */
import { SEED_HELP_CENTERS } from "@/data/seed";
import { BOMBEROS_VALENCIA_ACOPIO_CENTERS } from "@/data/bomberos-valencia-acopio";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";
import { extractSeedMarker, withSeedMarker } from "@/lib/help-centers/seed-marker";
import {
  getSupabaseRestAdmin,
  restPatch,
  restPost,
  restSelectAll,
} from "@/lib/supabase/rest-admin";
import type { HelpCenter } from "@/types";

interface HelpCenterRow {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string | null;
}

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

function normalizeKey(name: string, city: string): string {
  return `${name.trim().toLowerCase()}|${city.trim().toLowerCase()}`;
}

function toRestPayload(center: HelpCenter) {
  return {
    name: center.name,
    description: withSeedMarker(center.description, center.id),
    type: center.type,
    state: center.state,
    city: center.city,
    address: center.address,
    latitude: center.latitude,
    longitude: center.longitude,
    phone: center.phone,
    email: center.email,
    schedule: center.schedule,
    accepts: center.accepts,
    image_url: center.image_url ?? null,
    image_urls: center.image_urls ?? [],
    is_verified: center.is_verified,
    is_active: center.is_active,
  };
}

function filterCenters(only?: string): HelpCenter[] {
  if (only === "bomberos-valencia") {
    return BOMBEROS_VALENCIA_ACOPIO_CENTERS;
  }
  return SEED_HELP_CENTERS;
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg?.split("=")[1];

  if (!dryRun) {
    assertSafeDatabaseTarget("sync:seed-help-centers");
  }

  const centers = filterCenters(only);
  const admin = getSupabaseRestAdmin();

  console.log(`Centros seed a sincronizar: ${centers.length}${only ? ` (filtro: ${only})` : ""}`);

  const existing = await restSelectAll<HelpCenterRow>(
    admin,
    "help_centers",
    "id,name,city,address,description"
  );

  const bySeedId = new Map<string, HelpCenterRow>();
  const byNameCity = new Map<string, HelpCenterRow>();

  for (const row of existing) {
    const seedId = extractSeedMarker(row.description);
    if (seedId) bySeedId.set(seedId, row);
    byNameCity.set(normalizeKey(row.name, row.city), row);
  }

  let created = 0;
  let updated = 0;

  for (const center of centers) {
    const payload = toRestPayload(center);
    const byMarker = bySeedId.get(center.id);
    const byKey = byNameCity.get(normalizeKey(center.name, center.city));
    const match = byMarker ?? byKey;

    if (match) {
      if (dryRun) {
        console.log(`  [dry-run] actualizara: ${center.name} (${center.id} ? ${match.id})`);
      } else {
        await restPatch(admin, "help_centers", `id=eq.${match.id}`, payload);
      }
      updated += 1;
      continue;
    }

    if (dryRun) {
      console.log(`  [dry-run] creara: ${center.name} (${center.id})`);
      created += 1;
      continue;
    }

    await restPost(admin, "help_centers", payload);
    created += 1;
  }

  console.log("\nResumen seed ? help_centers:");
  console.log(`  creados=${created} actualizados=${updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
