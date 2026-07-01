import type { DamageReport } from "@/types";
import type { NasaDamageSnapshot } from "@/lib/damage-map/nasa";
import { nasaFeatureToImportedBuilding } from "@/lib/damage-map/nasa";
import { importedToDamageReport } from "@/lib/damage-map/feed";
import { NASA_DAMAGE_SOURCE_NAME } from "@/lib/damage-map/nasa";
import snapshot from "@/data/nasa-damage-buildings.json";

const data = snapshot as NasaDamageSnapshot;

function toDamageReport(feature: (typeof data.items)[number]): DamageReport {
  const building = nasaFeatureToImportedBuilding(feature);
  const report = importedToDamageReport(building);
  return {
    ...report,
    id: `nasa-${feature.overture_id}`,
    source_name: NASA_DAMAGE_SOURCE_NAME,
    external_reference: `nasa:${feature.overture_id}`,
    description:
      feature.label === "likely_damaged"
        ? `Detección satelital Sentinel-1 · ${Math.round((feature.damage_probability ?? 0) * 100)}% probabilidad`
        : report.description,
  };
}

/** Copia local de edificios NASA (npm run fetch:nasa-damage). */
export const LOCAL_NASA_DAMAGE_BUILDINGS: DamageReport[] = (data.items ?? []).map(toDamageReport);

export const NASA_DAMAGE_FETCHED_AT = data.fetched_at ?? null;
export const NASA_DAMAGE_SNAPSHOT_COUNT = data.count ?? 0;
export const NASA_DAMAGE_ESTIMATE = data.estimate_total ?? 58_870;
