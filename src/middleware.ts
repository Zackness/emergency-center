import { defineMiddleware } from "astro:middleware";
import { getSessionUser, resolvePostLoginPath } from "@/lib/auth-center";
import { coordinatorAccesoPath } from "@/lib/auth-urls";
import { getLocaleFromPath } from "@/i18n/config";

const ACCESO_PATHS = new Set([
  "/centros-ayuda/acceso",
  "/en/centros-ayuda/acceso",
  "/pt/centros-ayuda/acceso",
  "/it/centros-ayuda/acceso",
]);

const PANEL_PATH_PREFIXES = [
  "/centros-ayuda/panel",
  "/en/centros-ayuda/panel",
  "/pt/centros-ayuda/panel",
  "/it/centros-ayuda/panel",
];

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

function isAccesoPath(pathname: string): boolean {
  return ACCESO_PATHS.has(pathname);
}

function isPanelPath(pathname: string): boolean {
  return PANEL_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = normalizePathname(context.url.pathname);
  const needsAuth = isAccesoPath(pathname) || isPanelPath(pathname);
  if (!needsAuth) return next();

  const user = await getSessionUser(context.request, context.cookies);
  const locale = getLocaleFromPath(pathname);

  if (isAccesoPath(pathname)) {
    if (user) {
      return context.redirect(resolvePostLoginPath(context.url, locale));
    }
    return next();
  }

  if (user) return next();

  const acceso = coordinatorAccesoPath(locale);
  return context.redirect(`${acceso}?next=${encodeURIComponent(pathname)}`);
});
