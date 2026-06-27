import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";

export function siteOrigin(request: Request): string {
  const configured = import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function authCallbackUrl(request: Request, next: string): string {
  const origin = siteOrigin(request);
  return `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
}

export function coordinatorResetPath(locale: Locale): string {
  return localePath(locale, "centros-ayuda/restablecer-contrasena");
}

export function adminResetPath(): string {
  return "/admin/restablecer";
}

export function coordinatorAccesoPath(locale: Locale): string {
  return localePath(locale, "centros-ayuda/acceso");
}
