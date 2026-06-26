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

export function dedupKeys(record: {
  fullName: string;
  age: number | null;
  contactPhone: string;
  nationalId: string | null;
}): string[] {
  const name = normalizeName(record.fullName);
  const phone = normalizePhone(record.contactPhone);
  const cedula = normalizeNationalId(record.nationalId);
  const keys: string[] = [];

  if (cedula) keys.push(`cedula:${cedula}`);
  if (name && record.age != null) keys.push(`name:${name}|age:${record.age}`);
  if (name && phone) keys.push(`name:${name}|phone:${phone}`);

  return keys;
}
