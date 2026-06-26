export type Locale = "es" | "en";

export const locales: Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isValidLocale(segment) ? segment : defaultLocale;
}

export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function switchLocalePath(
  currentPath: string,
  targetLocale: Locale
): string {
  const parts = currentPath.split("/").filter(Boolean);
  if (parts.length > 0 && isValidLocale(parts[0])) {
    parts[0] = targetLocale;
    return `/${parts.join("/")}`;
  }
  return localizedPath(targetLocale, currentPath);
}
