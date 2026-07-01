import type { DamageReport } from "@/types";
import { LOCAL_NASA_DAMAGE_BUILDINGS } from "@/data/nasa-damage-buildings";
import { NASA_DAMAGE_ESTIMATE_TOTAL } from "@/lib/damage-map/nasa-config";
import { NASA_DAMAGE_SOURCE_NAME } from "@/lib/damage-map/nasa";

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)}:${lng.toFixed(4)}`;
}

function isNearCommunityReport(nasa: DamageReport, community: DamageReport): boolean {
  const keyA = coordKey(nasa.latitude, nasa.longitude);
  const keyB = coordKey(community.latitude, community.longitude);
  return keyA === keyB;
}

/** Añade detecciones NASA que no coincidan con reportes comunitarios (~11 m). */
export function mergeNasaDamageReports(communityReports: DamageReport[]): DamageReport[] {
  if (!LOCAL_NASA_DAMAGE_BUILDINGS.length) {
    return communityReports;
  }

  const merged = [...communityReports];
  for (const nasa of LOCAL_NASA_DAMAGE_BUILDINGS) {
    if (merged.some((report) => isNearCommunityReport(nasa, report))) continue;
    merged.push(nasa);
  }
  return merged;
}

export function nasaDamageStats() {
  const localCount = LOCAL_NASA_DAMAGE_BUILDINGS.length;
  return {
    local_count: localCount,
    estimate_total: NASA_DAMAGE_ESTIMATE_TOTAL,
    displayed_on_map: localCount,
  };
}

export function isNasaDamageReport(report: DamageReport): boolean {
  return (
    report.id.startsWith("nasa-") ||
    report.source_name === NASA_DAMAGE_SOURCE_NAME ||
    report.external_reference?.startsWith("nasa:") === true
  );
}
