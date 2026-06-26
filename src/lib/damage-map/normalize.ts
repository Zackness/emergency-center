import type { DamageSeverity } from "@/types";
import { VENEZUELA_STATES } from "@/data/seed";

const STATE_ALIASES: Record<string, string> = {
  "distrito capital": "Distrito Capital",
  "la guaira": "La Guaira",
  vargas: "La Guaira",
  carabobo: "Carabobo",
  miranda: "Miranda",
  aragua: "Aragua",
  zulia: "Zulia",
  lara: "Lara",
  mérida: "Mérida",
  merida: "Mérida",
  anzoátegui: "Anzoátegui",
  anzoategui: "Anzoátegui",
  apure: "Apure",
  falcón: "Falcón",
  falcon: "Falcón",
};

export function mapExternalDamageLevel(level: string): DamageSeverity {
  const normalized = level.trim().toLowerCase();
  if (normalized === "total") return "collapsed";
  if (normalized === "severo" || normalized === "severe") return "damaged";
  return "evacuated";
}

export function inferState(city: string, address: string | null, zone: string | null): string {
  const haystack = `${city} ${address ?? ""} ${zone ?? ""}`.toLowerCase();

  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (haystack.includes(alias)) return state;
  }

  for (const state of VENEZUELA_STATES) {
    if (haystack.includes(state.toLowerCase())) return state;
  }

  return city || "Venezuela";
}

export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Une main_photo_url + media_urls sin duplicados ni vacíos. */
export function dedupeImageUrls(
  mainPhotoUrl: string | null | undefined,
  mediaUrls: string[] | null | undefined
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of [mainPhotoUrl, ...(mediaUrls ?? [])]) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

/** Elimina URLs vacías o repetidas preservando el orden. */
export function dedupeUrlList(urls: string[] | null | undefined): string[] {
  return dedupeImageUrls(null, urls);
}
