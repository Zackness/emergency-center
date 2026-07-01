import type { ImportedBuilding } from "@/lib/damage-map/types";
import type { DamageSyncResult } from "@/lib/damage-map/types";
import {
  getSupabaseRestAdmin,
  restPatch,
  restPost,
  restSelectAll,
} from "@/lib/supabase/rest-admin";
import { YUMMY_SOS_EXTERNAL_SOURCE } from "./types";

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
    source_name: "Yummy SOS — Reportes de daño",
    source_url: building.sourceUrl,
    external_reference: building.externalId,
    external_source: YUMMY_SOS_EXTERNAL_SOURCE,
    zone: building.zone,
    image_urls: building.imageUrls,
    source_synced_at: building.sourceSyncedAt,
    is_verified: building.isVerified,
    is_active: true,
  };
}

export async function syncYummyDamageReportsRest(
  buildings: ImportedBuilding[]
): Promise<DamageSyncResult> {
  const admin = getSupabaseRestAdmin();

  const existing = await restSelectAll<ExistingDamageRow>(
    admin,
    "damage_reports",
    "id,external_reference",
    1000,
    `external_source=eq.${YUMMY_SOS_EXTERNAL_SOURCE}`
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
  }

  return result;
}
