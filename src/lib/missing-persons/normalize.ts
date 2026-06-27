/** Normaliza texto para comparación (minúsculas, sin acentos, espacios colapsados). */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeName(fullName: string): string {
  return normalizeText(fullName);
}

/** Solo dígitos; para teléfonos venezolanos usa los últimos 10. */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function normalizeNationalId(id: string | null | undefined): string | null {
  if (!id) return null;
  const digits = id.replace(/\D/g, "");
  return digits || null;
}

/** Formato legible para mostrar CI venezolana (solo dígitos almacenados). */
export function formatNationalIdDisplay(id: string | null | undefined): string | null {
  const digits = normalizeNationalId(id);
  if (!digits) return null;
  if (digits.length <= 9) return `V-${digits}`;
  return digits;
}

const PLACEHOLDER_PHONES = new Set([
  "por confirmar",
  "sin datos",
  "n/a",
  "na",
  "no disponible",
]);

/** URL de foto normalizada para comparar el mismo archivo entre plataformas. */
export function normalizePhotoUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname.toLowerCase();
    const keyMatch = path.match(/\/(?:photos?|foto|media|storage|uploads)\/([^/]+)$/i);
    if (keyMatch) {
      return `photo:${keyMatch[1].replace(/\.\w+$/i, "")}`;
    }
    return `photo:${path}`;
  } catch {
    const fallback = trimmed.toLowerCase().split("?")[0]?.split("#")[0] ?? trimmed.toLowerCase();
    const keyMatch = fallback.match(/\/([^/]+)$/);
    if (keyMatch) return `photo:${keyMatch[1].replace(/\.\w+$/i, "")}`;
    return `photo:${fallback}`;
  }
}

export function dedupKeys(record: {
  fullName: string;
  age: number | null;
  contactPhone: string;
  nationalId: string | null;
  photoUrl?: string | null;
  lastSeenLocation?: string | null;
  state?: string | null;
  city?: string | null;
}): string[] {
  const name = normalizeName(record.fullName);
  const phone = normalizePhone(record.contactPhone);
  const phoneRaw = normalizeText(record.contactPhone);
  const cedula = normalizeNationalId(record.nationalId);
  const photo = normalizePhotoUrl(record.photoUrl);
  const location = record.lastSeenLocation ? normalizeText(record.lastSeenLocation) : null;
  const state = record.state ? normalizeText(record.state) : null;
  const city = record.city ? normalizeText(record.city) : null;
  const keys: string[] = [];
  const phoneIsPlaceholder = PLACEHOLDER_PHONES.has(phoneRaw);

  if (cedula) keys.push(`cedula:${cedula}`);
  if (photo) keys.push(photo);
  if (name && record.age != null) keys.push(`name:${name}|age:${record.age}`);
  if (name && phone && !phoneIsPlaceholder) {
    keys.push(`name:${name}|phone:${phone}`);
    keys.push(`phone:${phone}`);
  }
  if (name && location) keys.push(`name:${name}|loc:${location}`);
  if (name && city && state) keys.push(`name:${name}|city:${city}|state:${state}`);

  return keys;
}
