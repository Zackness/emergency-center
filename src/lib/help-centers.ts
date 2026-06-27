import { SEED_HELP_CENTERS } from "@/data/seed";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { HelpCenter } from "@/types";

const PLACEHOLDER = "/images/help-centers/placeholder.svg";

export function getHelpCenterImages(center: HelpCenter): string[] {
  if (center.image_urls?.length) return center.image_urls;
  if (center.image_url) return [center.image_url];
  return [PLACEHOLDER];
}

/** Resuelve el ancla del listado usando el id del catálogo seed (p. ej. "24") → UUID en BD. */
export function resolveHelpCenterHref(
  locale: Locale,
  seedId: string,
  centers: HelpCenter[],
): string | undefined {
  const seed = SEED_HELP_CENTERS.find((c) => c.id === seedId);
  if (!seed) return undefined;
  const live = centers.find((c) => c.name === seed.name);
  return `${localePath(locale, "centros-ayuda")}#${live?.id ?? seedId}`;
}
