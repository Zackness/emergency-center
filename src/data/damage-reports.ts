import type { DamageReport } from "@/types";
import { LOCAL_DAMAGE_BUILDINGS } from "@/data/damage-buildings";

/**
 * Reportes de daños: copia local de terremotovenezuela.com + registros propios.
 * Actualizar con: npm run fetch:damage
 * Persistir en BD con: npm run sync:damage
 */
export const SEED_DAMAGE_REPORTS: DamageReport[] = LOCAL_DAMAGE_BUILDINGS;

export const DAMAGE_MAP_SOURCE = {
  name: "Terremoto Venezuela — Mapa de Daños",
  url: "https://terremotovenezuela.com/",
} as const;
