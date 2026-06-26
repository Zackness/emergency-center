import { VENEZUELA_STATES } from "@/data/seed";

const CITY_TO_STATE: Record<string, string> = {
  caracas: "Distrito Capital",
  "catia la mar": "La Guaira",
  "la guaira": "La Guaira",
  guaira: "La Guaira",
  maracay: "Aragua",
  valencia: "Carabobo",
  barquisimeto: "Lara",
  maracaibo: "Zulia",
  "puerto cabello": "Carabobo",
  tucacas: "Falcón",
  lecheria: "Anzoátegui",
  lechería: "Anzoátegui",
};

function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Infiere estado y ciudad desde texto libre de ubicación. */
export function parseLocation(location: string | null | undefined): {
  state: string;
  city: string;
} {
  const raw = (location ?? "").trim();
  if (!raw) {
    return { state: "Por confirmar", city: "Por confirmar" };
  }

  const normalized = normalizeForMatch(raw);

  for (const state of VENEZUELA_STATES) {
    const stateNorm = normalizeForMatch(state);
    if (normalized.includes(stateNorm)) {
      const city = raw
        .replace(new RegExp(state, "i"), "")
        .replace(/[,;|-]/g, " ")
        .trim();
      return {
        state,
        city: city || state,
      };
    }
  }

  for (const [cityKey, state] of Object.entries(CITY_TO_STATE)) {
    if (normalized.includes(cityKey)) {
      return { state, city: raw };
    }
  }

  return { state: "Por confirmar", city: raw };
}
