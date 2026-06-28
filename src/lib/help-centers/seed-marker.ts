const SEED_MARKER_RE = /\[\[seed:([^\]]+)\]\]/;

export function extractSeedMarker(description: string | null | undefined): string | null {
  if (!description) return null;
  const match = description.match(SEED_MARKER_RE);
  return match?.[1] ?? null;
}

export function withSeedMarker(description: string | null | undefined, seedId: string): string {
  const base = description?.replace(SEED_MARKER_RE, "").trim() ?? "";
  const marker = `[[seed:${seedId}]]`;
  if (base.includes(marker)) return base;
  return base ? `${base}\n\n${marker}` : marker;
}
