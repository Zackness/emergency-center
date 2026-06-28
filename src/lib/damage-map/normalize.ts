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
  táchira: "Táchira",
  tachira: "Táchira",
  bolívar: "Bolívar",
  bolivar: "Bolívar",
  monagas: "Monagas",
  guárico: "Guárico",
  guarico: "Guárico",
  cojedes: "Cojedes",
  caracas: "Distrito Capital",
};

/** Ciudades frecuentes en reportes que no coinciden con el nombre del estado. */
const CITY_TO_STATE: Record<string, string> = {
  caracas: "Distrito Capital",
  caraballeda: "La Guaira",
  maiquetia: "La Guaira",
  maquetia: "La Guaira",
  macuto: "La Guaira",
  naiguata: "La Guaira",
  "catia la mar": "La Guaira",
  valencia: "Carabobo",
  maracay: "Aragua",
  barquisimeto: "Lara",
  maracaibo: "Zulia",
  tucacas: "Falcón",
  "puerto cabello": "Carabobo",
  "san cristobal": "Táchira",
  maturin: "Monagas",
  "ciudad bolivar": "Bolívar",
  "ciudad guayana": "Bolívar",
  "puerto la cruz": "Anzoátegui",
  "lecheria": "Anzoátegui",
  "los teques": "Miranda",
  guarenas: "Miranda",
  guatire: "Miranda",
  petare: "Miranda",
  "san antonio de los altos": "Miranda",
  "altagracia de orituco": "Guárico",
  tinaquillo: "Cojedes",
  "ciudad mariche": "Miranda",
};

export function mapExternalDamageLevel(level: string): DamageSeverity {
  const normalized = level.trim().toLowerCase();
  if (normalized === "total") return "collapsed";
  if (normalized === "severo" || normalized === "severe") return "damaged";
  return "evacuated";
}

export function inferState(city: string, address: string | null, zone: string | null): string {
  const haystack = normalizeSearchText(`${city} ${address ?? ""} ${zone ?? ""}`);
  const cityNorm = normalizeSearchText(city.trim());

  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (haystack.includes(normalizeSearchText(alias))) return state;
  }

  if (CITY_TO_STATE[cityNorm]) return CITY_TO_STATE[cityNorm];

  for (const [cityKey, state] of Object.entries(CITY_TO_STATE)) {
    if (haystack.includes(cityKey)) return state;
  }

  for (const state of VENEZUELA_STATES) {
    if (haystack.includes(normalizeSearchText(state))) return state;
  }

  if (haystack.includes("mariche")) return "Miranda";

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
