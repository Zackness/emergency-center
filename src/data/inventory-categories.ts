/** Categorías de insumos para inventario de centros de acopio. */
export const INVENTORY_CATEGORIES = [
  "water",
  "food",
  "medicine",
  "clothing",
  "hygiene",
  "blankets",
  "fuel",
  "tools",
  "other",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export const INVENTORY_UNITS = ["unidad", "caja", "litro", "kg", "paquete"] as const;
