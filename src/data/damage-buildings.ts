import type { DamageReport } from "@/types";
import type { ImportedBuilding } from "@/lib/damage-map/types";
import { dedupeUrlList } from "@/lib/damage-map/normalize";
import snapshot from "@/data/damage-buildings.json";

function importedToDamageReport(building: ImportedBuilding): DamageReport {
  const now = new Date().toISOString();
  return {
    id: `ext-${building.externalId}`,
    title: building.title,
    severity: building.severity,
    state: building.state,
    city: building.city,
    address: building.address,
    zone: building.zone,
    latitude: building.latitude,
    longitude: building.longitude,
    description: building.zone ? `Zona: ${building.zone}` : null,
    reporter_name: null,
    reporter_contact: null,
    source_name: "Terremoto Venezuela — Mapa de Daños",
    source_url: building.sourceUrl,
    image_urls: dedupeUrlList(building.imageUrls),
    external_reference: building.externalId,
    is_verified: building.isVerified,
    is_active: true,
    created_at: building.sourceSyncedAt || now,
    updated_at: building.sourceSyncedAt || now,
    source_synced_at: building.sourceSyncedAt,
  };
}

const data = snapshot as {
  fetched_at: string;
  count: number;
  items: ImportedBuilding[];
};

/** Copia local sincronizada desde terremotovenezuela.com (npm run fetch:damage). */
export const LOCAL_DAMAGE_BUILDINGS: DamageReport[] = (data.items ?? []).map(
  importedToDamageReport
);

export const LOCAL_DAMAGE_FETCHED_AT = data.fetched_at ?? null;
