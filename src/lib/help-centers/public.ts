import type { HelpCenter } from "@/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRegisteredHelpCenterId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Centros registrados en BD solo son públicos si el admin los verificó. */
export function isPublicHelpCenter(center: HelpCenter): boolean {
  if (!center.is_active) return false;
  if (isRegisteredHelpCenterId(center.id)) return center.is_verified;
  return true;
}

export function canShowPublicInventory(center: HelpCenter): boolean {
  return isRegisteredHelpCenterId(center.id) && center.is_verified && center.is_active;
}

export type InventoryUrgency = "critical" | "low" | "ok";

export function inventoryUrgency(item: {
  quantityOnHand: number;
  minimumStock: number | null;
}): InventoryUrgency {
  if (item.quantityOnHand <= 0) return "critical";
  if (item.minimumStock != null && item.quantityOnHand <= item.minimumStock) return "low";
  return "ok";
}
