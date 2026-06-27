import { ALLIED_PLATFORMS } from "@/data/allied-platforms";
import type { AlliedPlatform } from "@/types";
import { getAdapter, SOURCE_ADAPTERS } from "@/lib/missing-persons/adapters";

/** Dominio aliado → slug de fuente externa / adaptador de sync. */
export const MISSING_PERSON_SOURCE_BY_DOMAIN: Record<string, string> = {
  "terremotovenezuela.app": "terremotovenezuela-app",
  "venezuelatebusca.com": "venezuela-te-busca",
  "venezuelareporta.org": "venezuela-reporta",
  "desaparecidosterremotovenezuela.com": "desaparecidos-terremoto",
  "encuentralos.tecnosoft.dev": "encuentralos",
};

export function normalizeAlliedDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
}

export function missingPersonSlugForDomain(domain: string): string | null {
  const normalized = normalizeAlliedDomain(domain);
  return MISSING_PERSON_SOURCE_BY_DOMAIN[normalized] ?? null;
}

/** Slugs con adaptador de importación disponible. */
export function getAvailableMissingPersonSyncSlugs(): string[] {
  return SOURCE_ADAPTERS.map((adapter) => adapter.slug);
}

/**
 * Plataformas aliadas de la landing que registran desaparecidos y tienen adaptador.
 * Esta lista gobierna el sync por defecto (`npm run sync:missing`, cron, API).
 */
export function resolveMissingPersonSyncSlugs(alliedPlatforms: AlliedPlatform[]): string[] {
  const slugs = new Set<string>();

  for (const platform of alliedPlatforms) {
    if (platform.is_active === false) continue;
    const slug = missingPersonSlugForDomain(platform.domain);
    if (slug && getAdapter(slug)) {
      slugs.add(slug);
    }
  }

  return [...slugs].sort((a, b) => {
    const order = getAvailableMissingPersonSyncSlugs();
    return order.indexOf(a) - order.indexOf(b);
  });
}

/** Fallback estático si no hay plataformas aliadas cargadas. */
export function defaultMissingPersonSyncSlugs(): string[] {
  return getAvailableMissingPersonSyncSlugs().filter((slug) =>
    Object.values(MISSING_PERSON_SOURCE_BY_DOMAIN).includes(slug)
  );
}

export async function resolveMissingPersonSyncSlugsAsync(
  explicitSlugs?: string[]
): Promise<string[]> {
  if (explicitSlugs?.length) return explicitSlugs;

  try {
    const { fetchAlliedPlatforms } = await import("@/lib/allied-platforms/service");
    const allied = await fetchAlliedPlatforms();
    const fromAllied = resolveMissingPersonSyncSlugs(allied);
    if (fromAllied.length) return fromAllied;
  } catch (err) {
    console.warn(
      "[sync] Plataformas aliadas desde BD no disponibles; usando lista local.",
      err instanceof Error ? err.message : err
    );
  }

  const fromSeed = resolveMissingPersonSyncSlugs(ALLIED_PLATFORMS);
  if (fromSeed.length) return fromSeed;

  return defaultMissingPersonSyncSlugs();
}

export function alliedDomainsForMissingPersonSync(): string[] {
  return Object.keys(MISSING_PERSON_SOURCE_BY_DOMAIN);
}
