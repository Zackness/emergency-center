import type { DamageReport } from "@/types";
import { LOCAL_DAMAGE_BUILDINGS, LOCAL_DAMAGE_FETCHED_AT } from "@/data/damage-buildings";
import { fetchExternalBuildings } from "@/lib/damage-map/adapter";
import { importedToDamageReport } from "@/lib/damage-map/feed";

const LIVE_TIMEOUT_MS = 12_000;

function importedBuildingsToReports(
  buildings: Awaited<ReturnType<typeof fetchExternalBuildings>>
): DamageReport[] {
  return buildings.map((building) => importedToDamageReport(building));
}

/** Edificios reportados por la comunidad (terremotovenezuela.com). API en vivo ? snapshot JSON. */
export async function loadCommunityDamageReports(): Promise<DamageReport[]> {
  try {
    const live = await Promise.race([
      fetchExternalBuildings(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("community damage live timeout")), LIVE_TIMEOUT_MS);
      }),
    ]);
    if (live.length > 0) {
      return importedBuildingsToReports(live);
    }
  } catch (err) {
    console.warn(
      "[damage-map] live community fetch failed, using local snapshot:",
      err instanceof Error ? err.message : err
    );
  }

  if (LOCAL_DAMAGE_BUILDINGS.length > 0) {
    return LOCAL_DAMAGE_BUILDINGS;
  }

  return [];
}

export function communityDamageFetchedAt(): string | null {
  return LOCAL_DAMAGE_FETCHED_AT;
}
