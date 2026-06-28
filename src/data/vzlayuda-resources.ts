import snapshotData from "@/data/vzlayuda-avisos.json";
import type { VzlaAyudaAviso, VzlaAyudaSnapshot } from "@/lib/vzlayuda/types";

export const VZLAYUDA_PLATFORM_URL = "https://vzlayuda.com";

export function getVzlaAyudaSnapshot(): VzlaAyudaSnapshot {
  return snapshotData as VzlaAyudaSnapshot;
}

export function getVzlaAyudaAvisos(): VzlaAyudaAviso[] {
  return getVzlaAyudaSnapshot().avisos ?? [];
}

export const VZLAYUDA_DATA_FETCHED_AT = (snapshotData as VzlaAyudaSnapshot).fetched_at;
