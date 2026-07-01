import type { DamageReport } from "@/types";
import { getUrgentRescueDamageReports } from "@/data/urgent-rescue-alerts";
import { normalizeSearchText } from "@/lib/damage-map/normalize";

function isDuplicateUrgent(site: DamageReport, existing: DamageReport): boolean {
  if (site.id === existing.id) return true;
  const titleA = normalizeSearchText(site.title);
  const titleB = normalizeSearchText(existing.title);
  if (titleA && titleA === titleB) return true;
  return (
    site.latitude.toFixed(4) === existing.latitude.toFixed(4) &&
    site.longitude.toFixed(4) === existing.longitude.toFixed(4)
  );
}

/** Coloca alertas urgentes de rescate al inicio del catálogo (mismo día / hora crítica). */
export function mergeUrgentRescueAlerts(reports: DamageReport[]): DamageReport[] {
  const urgent = getUrgentRescueDamageReports();
  const merged = [...urgent];
  for (const report of reports) {
    if (merged.some((site) => isDuplicateUrgent(site, report))) continue;
    merged.push(report);
  }
  return merged;
}
