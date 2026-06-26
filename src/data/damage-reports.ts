import type { DamageReport } from "@/types";

/**
 * Reportes de daños propios + sincronizados desde terremotovenezuela.com.
 * La sincronización usa external_reference para deduplicar.
 */
export const SEED_DAMAGE_REPORTS: DamageReport[] = [];

export const DAMAGE_MAP_SOURCE = {
  name: "Terremoto Venezuela — Mapa de Daños",
  url: "https://terremotovenezuela.com/",
} as const;
