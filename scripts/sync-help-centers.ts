#!/usr/bin/env npx tsx
/**
 * Importa centros de acopio desde centroacopio.site vía API REST de Supabase.
 * No requiere DATABASE_URL (puerto 6543); usa HTTPS como sync:hospitals.
 */
import { readFile } from "node:fs/promises";
import {
  extractHelpCenterMarker,
  fetchAllCentroacopioCenters,
  mapCenterToHelpCenter,
  type CentroacopioCenter,
} from "@/lib/help-centers/centroacopio";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";
import {
  getSupabaseRestAdmin,
  restPatch,
  restPost,
  restSelectAll,
} from "@/lib/supabase/rest-admin";

const SNAPSHOT = new URL("../src/data/centroacopio.json", import.meta.url);

interface HelpCenterRow {
  id: string;
  name: string;
  address: string;
  description: string | null;
}

function normalizeKey(name: string, address: string): string {
  return `${name.trim().toLowerCase()}|${address.trim().toLowerCase()}`;
}

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

async function loadCenters(fromFile: boolean): Promise<CentroacopioCenter[]> {
  if (fromFile) {
    const raw = await readFile(SNAPSHOT, "utf8");
    const data = JSON.parse(raw) as { centers: CentroacopioCenter[] };
    return data.centers ?? [];
  }
  return fetchAllCentroacopioCenters();
}

function toRestPayload(mapped: ReturnType<typeof mapCenterToHelpCenter>) {
  return {
    name: mapped.name,
    description: mapped.description,
    type: mapped.type,
    state: mapped.state,
    city: mapped.city,
    address: mapped.address,
    latitude: mapped.latitude,
    longitude: mapped.longitude,
    phone: mapped.phone,
    schedule: mapped.schedule,
    accepts: mapped.accepts,
    is_verified: mapped.isVerified,
    is_active: mapped.isActive,
  };
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  if (!dryRun) {
    assertSafeDatabaseTarget("sync:help-centers");
  }

  const fromFile = process.argv.includes("--from-file");
  const admin = getSupabaseRestAdmin();

  const rows = await loadCenters(fromFile);
  console.log(`Centros a procesar: ${rows.length}${fromFile ? " (archivo local)" : " (API en vivo)"}`);

  const existing = await restSelectAll<HelpCenterRow>(
    admin,
    "help_centers",
    "id,name,address,description"
  );

  const byMarker = new Map<string, HelpCenterRow>();
  const byNameAddress = new Map<string, HelpCenterRow>();

  for (const row of existing) {
    const marker = extractHelpCenterMarker(row.description);
    if (marker) byMarker.set(`${marker.source}:${marker.id}`, row);
    byNameAddress.set(normalizeKey(row.name, row.address), row);
  }

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const mapped = mapCenterToHelpCenter(row);
    const payload = toRestPayload(mapped);
    const source = row.source?.trim() || "centroacopio.site";

    const byId = byMarker.get(`${source}:${row.id}`);
    if (byId) {
      if (dryRun) {
        console.log(`  [dry-run] actualizaría: ${mapped.name}`);
      } else {
        await restPatch(admin, "help_centers", `id=eq.${byId.id}`, payload);
      }
      updated += 1;
      continue;
    }

    const collision = byNameAddress.get(normalizeKey(mapped.name, mapped.address));
    if (collision && !collision.description?.includes("[[centroacopio:")) {
      if (dryRun) {
        console.log(`  [dry-run] vincularía por nombre: ${mapped.name}`);
      } else {
        const mergedDescription = [collision.description, mapped.description]
          .filter(Boolean)
          .join("\n");
        await restPatch(admin, "help_centers", `id=eq.${collision.id}`, {
          description: mergedDescription,
          phone: mapped.phone,
          schedule: mapped.schedule,
          accepts: mapped.accepts,
        });
      }
      updated += 1;
      continue;
    }

    if (dryRun) {
      console.log(`  [dry-run] crearía: ${mapped.name} (${mapped.city})`);
      created += 1;
      continue;
    }

    await restPost(admin, "help_centers", payload);
    created += 1;
  }

  console.log("\nResumen centroacopio → help_centers (REST):");
  console.log(`  creados=${created} actualizados=${updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
