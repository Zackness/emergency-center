import snapshotData from "@/data/redayuda.json";
import {
  REDAYUDA_CARACAS_HOSPITALS,
  REDAYUDA_COMMUNITY_GUIDE,
  REDAYUDA_EMERGENCY_PHONES,
  REDAYUDA_SOURCE_URL,
} from "@/data/redayuda-static";
import type { RedAyudaSnapshot } from "@/lib/redayuda/types";

const snapshot = snapshotData as RedAyudaSnapshot;

export const REDAYUDA_PLATFORM_URL = REDAYUDA_SOURCE_URL;

export function getRedAyudaSnapshot(): RedAyudaSnapshot {
  return {
    ...snapshot,
    hospitals: snapshot.hospitals?.length ? snapshot.hospitals : REDAYUDA_CARACAS_HOSPITALS,
    phones: snapshot.phones?.length ? snapshot.phones : REDAYUDA_EMERGENCY_PHONES,
    community_guide: snapshot.community_guide?.length
      ? snapshot.community_guide
      : REDAYUDA_COMMUNITY_GUIDE,
  };
}

export function getRedAyudaCaracasHospitals() {
  return getRedAyudaSnapshot().hospitals;
}

export function getRedAyudaEmergencyPhones() {
  return getRedAyudaSnapshot().phones;
}

export function getRedAyudaCommunityGuide() {
  return getRedAyudaSnapshot().community_guide;
}

export function getRedAyudaQuakes() {
  return getRedAyudaSnapshot().quakes;
}

export const REDAYUDA_DATA_FETCHED_AT = snapshot.fetched_at;
