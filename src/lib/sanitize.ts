const HTML_TAG_RE = /<[^>]*>/g;
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const MULTI_SPACE_RE = /\s{2,}/g;

/** Elimina etiquetas HTML y caracteres de control de un texto libre. */
export function stripHtml(input: string): string {
  return input
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_CHARS_RE, "")
    .replace(MULTI_SPACE_RE, " ")
    .trim();
}

/** Normaliza texto: trim, sin HTML, longitud máxima. */
export function sanitizeText(input: unknown, maxLength = 500): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== "string") return null;
  const cleaned = stripHtml(input);
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

/** Texto requerido con sanitización. */
export function sanitizeRequiredText(input: unknown, maxLength = 500): string {
  const value = sanitizeText(input, maxLength);
  if (!value) throw new Error("Campo de texto requerido inválido");
  return value;
}

/** Normaliza email a minúsculas. */
export function sanitizeEmail(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase().slice(0, 254);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function sanitizeRequiredEmail(input: unknown): string {
  const email = sanitizeEmail(input);
  if (!email) throw new Error("Email inválido");
  return email;
}

/** Normaliza teléfono: solo dígitos, +, espacios y guiones. */
export function sanitizePhone(input: unknown, maxLength = 30): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== "string") return null;
  const phone = input.replace(/[^\d+\-\s()]/g, "").trim().slice(0, maxLength);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return phone;
}

export function sanitizeRequiredPhone(input: unknown): string {
  const phone = sanitizePhone(input);
  if (!phone) throw new Error("Teléfono inválido");
  return phone;
}

/** Valida y normaliza URL http(s). */
export function sanitizeUrl(input: unknown, maxLength = 2048): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== "string") return null;
  const trimmed = input.trim().slice(0, maxLength);
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeRequiredUrl(input: unknown): string {
  const url = sanitizeUrl(input);
  if (!url) throw new Error("URL inválida");
  return url;
}

/** Valida que image_url apunte al storage de Supabase propio. */
export function sanitizeStorageImageUrl(input: unknown): string | null {
  const url = sanitizeUrl(input);
  if (!url) return null;

  const supabaseUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SUPABASE_URL) ||
    process.env.PUBLIC_SUPABASE_URL ||
    "";

  if (supabaseUrl) {
    try {
      const base = new URL(supabaseUrl);
      const parsed = new URL(url);
      if (parsed.origin !== base.origin) return null;
      if (!parsed.pathname.includes("/storage/v1/object/public/uploads/")) return null;
    } catch {
      return null;
    }
  }

  return url;
}

/** Coordenadas dentro del rango aproximado de Venezuela. */
export function sanitizeLatitude(input: unknown): number | null {
  const n = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(n) || n < 0.5 || n > 13.5) return null;
  return Math.round(n * 1_000_000) / 1_000_000;
}

export function sanitizeLongitude(input: unknown): number | null {
  const n = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(n) || n < -74 || n > -59) return null;
  return Math.round(n * 1_000_000) / 1_000_000;
}

export function sanitizeRequiredCoords(
  lat: unknown,
  lon: unknown
): { latitude: number; longitude: number } {
  const latitude = sanitizeLatitude(lat);
  const longitude = sanitizeLongitude(lon);
  if (latitude === null || longitude === null) {
    throw new Error("Coordenadas inválidas");
  }
  return { latitude, longitude };
}

/** Cédula venezolana opcional (V/E + dígitos). */
export function sanitizeNationalId(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== "string") return null;
  const id = input.trim().toUpperCase().replace(/[^VE0-9]/g, "").slice(0, 12);
  if (!id || id.length < 6) return null;
  return id;
}

/** Edad opcional entre 0 y 120. */
export function sanitizeAge(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;
  const n = Number(input);
  if (!Number.isFinite(n) || n < 0 || n > 120) return null;
  return Math.floor(n);
}

/** Array de strings sanitizados con límite de elementos. */
export function sanitizeStringArray(
  input: unknown,
  maxItems = 20,
  maxItemLength = 100
): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is string => typeof item === "string")
    .map((item) => stripHtml(item).slice(0, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

/** Token de votante: alfanumérico, 8-64 chars. */
export function sanitizeVoterToken(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const token = input.trim().slice(0, 64);
  if (token.length < 8 || !/^[a-zA-Z0-9_-]+$/.test(token)) return null;
  return token;
}
