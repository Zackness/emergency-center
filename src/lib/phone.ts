/** Convierte teléfono venezolano a enlace tel: internacional (+58). */
export function phoneTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("58")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+58${digits.slice(1)}`;
  return `tel:+58${digits}`;
}
