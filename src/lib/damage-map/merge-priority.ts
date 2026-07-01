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

/** Añade reportes @rdelbufalo al catálogo comunitario, evitando duplicados por título o coordenadas. */
export function mergePriorityRescueSites(reports: DamageReport[]): DamageReport[] {
  const merged = [...reports];
  for (const site of PRIORITY_RESCUE_SITES) {
    if (merged.some((report) => isDuplicatePriority(site, report))) continue;
    merged.push(site);
  }
  return merged;
}
