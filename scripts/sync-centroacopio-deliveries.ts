#!/usr/bin/env npx tsx
/**
 * Importa motorizados / delivery desde centroacopio.site a volunteer_registrations.
 *
 * Uso:
 *   npm run sync:centroacopio-deliveries
 *   npm run sync:centroacopio-deliveries -- --from-file
 */
import { readFile } from "node:fs/promises";
import {
  fetchAllCentroacopioDeliveries,
  inferLocation,
  mapDeliveryToVolunteerNotes,
  type CentroacopioDelivery,
} from "@/lib/help-centers/centroacopio";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";
import {
  getSupabaseRestAdmin,
  restPatch,
  restPost,
  restSelectAll,
} from "@/lib/supabase/rest-admin";

const SNAPSHOT = new URL("../src/data/centroacopio.json", import.meta.url);
const MARKER_RE = /\[\[centroacopio-delivery:([^\]]+)\]\]/;

interface VolunteerRow {
  id: string;
  notes: string | null;
  phone: string;
}

const TRANSPORT_LABEL: Record<string, string> = {
  carro: "Carro / camioneta",
  moto: "Moto",
  camioneta: "Camioneta",
  camion: "Camión",
  camión: "Camión",
};

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

async function loadDeliveries(fromFile: boolean): Promise<CentroacopioDelivery[]> {
  if (fromFile) {
    const raw = await readFile(SNAPSHOT, "utf8");
    const data = JSON.parse(raw) as { deliveries: CentroacopioDelivery[] };
    return data.deliveries ?? [];
  }
  return fetchAllCentroacopioDeliveries();
}

function toPayload(row: CentroacopioDelivery) {
  const location = inferLocation(row.city, row.sector);
  const transport = row.transportType?.trim().toLowerCase() || "vehiculo";
  return {
    name: row.name.trim(),
    city: location.city,
    state: location.state,
    profession: "Transporte solidario",
    specialty: "Delivery de donaciones",
    vehicle: TRANSPORT_LABEL[transport] ?? row.transportType,
    availability: [row.sector, row.nearbyAddress].filter(Boolean).join(" · ") || "Disponible",
    phone: row.phone?.replace(/[\s-]/g, "") ?? "",
    email: `centroacopio+${row.id}@import.local`,
    notes: mapDeliveryToVolunteerNotes(row),
    status: "active",
    is_active: true,
  };
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  if (!dryRun) assertSafeDatabaseTarget("sync:centroacopio-deliveries");

  const fromFile = process.argv.includes("--from-file");
  const admin = getSupabaseRestAdmin();
  const rows = await loadDeliveries(fromFile);

  console.log(
    `Deliveries a procesar: ${rows.length}${fromFile ? " (archivo local)" : " (scraping en vivo)"}`
  );

  const existing = await restSelectAll<VolunteerRow>(
    admin,
    "volunteer_registrations",
    "id,notes,phone"
  );

  const byMarker = new Map<string, VolunteerRow>();
  for (const row of existing) {
    const match = row.notes?.match(MARKER_RE);
    if (match) byMarker.set(match[1], row);
  }

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const payload = toPayload(row);
    const hit = byMarker.get(row.id);

    if (hit) {
      if (!dryRun) {
        await restPatch(admin, "volunteer_registrations", `id=eq.${hit.id}`, payload);
      }
      updated += 1;
      continue;
    }

    if (dryRun) {
      console.log(`  [dry-run] crearía delivery: ${payload.name} (${payload.city})`);
      created += 1;
      continue;
    }

    await restPost(admin, "volunteer_registrations", payload);
    created += 1;
  }

  console.log("\nResumen centroacopio deliveries → volunteer_registrations:");
  console.log(`  creados=${created} actualizados=${updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
