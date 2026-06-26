import type { ImportedBuilding } from "./types";
import { DAMAGE_MAP_EXTERNAL_SOURCE, fetchExternalBuildings } from "./adapter";
import type { DamageSyncResult } from "./types";
import {
  getSupabaseRestAdmin,
  restPatch,
  restPost,
  restSelectAll,
} from "@/lib/supabase/rest-admin";

interface ExistingDamageRow {
  id: string;
  external_reference: string | null;
}

function buildingToRow(building: ImportedBuilding) {
  const descriptionParts: string[] = [];
  if (building.zone) descriptionParts.push(`Zona: ${building.zone}`);

  return {
    title: building.title,
    severity: building.severity,
    state: building.state,
    city: building.city,
    address: building.address,
    latitude: building.latitude,
    longitude: building.longitude,
    description: descriptionParts.length ? descriptionParts.join(" · ") : null,
    source_name: "Terremoto Venezuela — Mapa de Daños",
    source_url: building.sourceUrl,
    external_reference: building.externalId,
    external_source: DAMAGE_MAP_EXTERNAL_SOURCE,
    zone: building.zone,
    image_urls: building.imageUrls,
    source_synced_at: building.sourceSyncedAt,
    is_verified: building.isVerified,
    is_active: true,
  };
}

/** Sincroniza edificios importados a damage_reports vía REST. */
export async function syncDamageBuildingsRest(
  buildings: ImportedBuilding[]
): Promise<DamageSyncResult> {
  const admin = getSupabaseRestAdmin();

  const existing = await restSelectAll<ExistingDamageRow>(
    admin,
    "damage_reports",
    "id,external_reference",
    1000,
    `external_source=eq.${DAMAGE_MAP_EXTERNAL_SOURCE}`
  );

  const byExternalId = new Map(
    existing
      .filter((row) => row.external_reference)
      .map((row) => [row.external_reference as string, row.id])
  );

  const result: DamageSyncResult = {
    fetched: buildings.length,
    created: 0,
    updated: 0,
    skipped: 0,
  };

  const toInsert: Record<string, unknown>[] = [];

  for (const building of buildings) {
    const row = buildingToRow(building);
    const existingId = byExternalId.get(building.externalId);

    if (existingId) {
      await restPatch(admin, "damage_reports", `id=eq.${existingId}`, row);
      result.updated += 1;
      continue;
    }

    toInsert.push(row);
  }

  const BATCH = 100;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    await restPost(admin, "damage_reports", batch, {
      onConflict: "external_source,external_reference",
      merge: true,
    });
    result.created += batch.length;
    if (toInsert.length > BATCH) {
      console.log(`  insertados ${Math.min(i + BATCH, toInsert.length)}/${toInsert.length}…`);
    }
  }

  return result;
}

/** Descarga en vivo desde terremotovenezuela.com y sincroniza. */
export async function syncDamageBuildingsRestLive(): Promise<DamageSyncResult> {
  console.log("Obteniendo edificios desde terremotovenezuela.com…");
  const buildings = await fetchExternalBuildings();
  console.log(`Edificios recibidos: ${buildings.length}`);
  return syncDamageBuildingsRest(buildings);
}
