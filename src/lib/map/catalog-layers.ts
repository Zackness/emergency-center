import type { UnifiedMapLayer } from "@/types/map";

/** Capas del mapa general del sitio (landing y API unificada). */
export const UNIFIED_MAP_LAYERS: UnifiedMapLayer[] = [
  "help_center",
  "hospital",
  "shelter",
  "damage",
  "quake",
  "redayuda",
  "platform",
  "children",
];

/** Tope generoso para el catálogo completo (daños + centros + niños, etc.). */
export const UNIFIED_MAP_CATALOG_MAX = 20_000;
