import { SEED_HELP_CENTERS } from "@/data/seed";
import { extractSeedMarker } from "@/lib/help-centers/seed-marker";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { HelpCenter } from "@/types";

const PLACEHOLDER = "/images/help-centers/placeholder.svg";

export function getHelpCenterImages(center: HelpCenter): string[] {
  if (center.image_urls?.length) return center.image_urls;
  if (center.image_url) return [center.image_url];
  return [PLACEHOLDER];
}

type CenterAnchor = Pick<HelpCenter, "id" | "name" | "description">;

/** Mapea ancla del URL (#104 o UUID) al id del elemento en el DOM. */
export function resolveCenterHashAnchor(hash: string, centers: CenterAnchor[]): string | null {
  if (centers.some((c) => c.id === hash)) return hash;
  const bySeed = centers.find((c) => extractSeedMarker(c.description) === hash);
  if (bySeed) return bySeed.id;
  const seed = SEED_HELP_CENTERS.find((c) => c.id === hash);
  if (seed) {
    const live = centers.find((c) => c.name === seed.name);
    if (live) return live.id;
  }
  return null;
}

/** Resuelve el ancla del listado usando el id del catálogo seed (p. ej. "24") → UUID en BD. */
export function resolveHelpCenterHref(
  locale: Locale,
  seedId: string,
  centers: HelpCenter[],
): string | undefined {
  const seed = SEED_HELP_CENTERS.find((c) => c.id === seedId);
  if (!seed) return undefined;
  const live =
    centers.find((c) => extractSeedMarker(c.description) === seedId) ??
    centers.find((c) => c.name === seed.name);
  return `${localePath(locale, "centros-ayuda")}#${live?.id ?? seedId}`;
}
