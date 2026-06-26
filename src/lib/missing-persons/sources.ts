import type { MissingPersonSourceLink } from "@/types";

/** Una sola entrada por plataforma externa (evita duplicados de re-reportes). */
export function dedupeSourcesByPlatform(
  sources: MissingPersonSourceLink[]
): MissingPersonSourceLink[] {
  const bySlug = new Map<string, MissingPersonSourceLink>();

  for (const source of sources) {
    const existing = bySlug.get(source.source_slug);
    if (!existing) {
      bySlug.set(source.source_slug, source);
      continue;
    }
    // Preferir enlace con URL externa si el existente no la tiene
    if (!existing.external_url && source.external_url) {
      bySlug.set(source.source_slug, source);
    }
  }

  return [...bySlug.values()];
}
