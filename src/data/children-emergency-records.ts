import type { ChildEmergencyCase } from "@/lib/children-emergency/types";
import snapshot from "@/data/children-emergency-records.json";

const data = snapshot as {
  fetched_at: string;
  count: number;
  items: ChildEmergencyCase[];
};

/** Copia local sincronizada (npm run fetch:children). */
export const LOCAL_CHILDREN_EMERGENCY_CASES: ChildEmergencyCase[] = data.items ?? [];

export const CHILDREN_EMERGENCY_SNAPSHOT_FETCHED_AT = data.fetched_at ?? null;
