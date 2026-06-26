import type { DamageReport } from "@/types";
import { PRIORITY_RESCUE_SITES } from "@/data/priority-rescue-sites";
import { normalizeSearchText } from "@/lib/damage-map/normalize";

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

function isDuplicatePriority(site: DamageReport, existing: DamageReport): boolean {
  if (site.id === existing.id) return true;
  const titleA = normalizeSearchText(site.title);
  const titleB = normalizeSearchText(existing.title);
  if (titleA && titleA === titleB) return true;
  return coordKey(site.latitude, site.longitude) === coordKey(existing.latitude, existing.longitude);
}

/** Inserta sitios prioritarios de rescate al inicio, evitando duplicados por título o coordenadas. */
export function mergePriorityRescueSites(reports: DamageReport[]): DamageReport[] {
  const merged = [...PRIORITY_RESCUE_SITES];
  for (const report of reports) {
    if (merged.some((site) => isDuplicatePriority(site, report))) continue;
    merged.push(report);
  }
  return merged;
}
