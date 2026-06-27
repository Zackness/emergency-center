export type Locale = "es" | "en" | "pt" | "it";

export const locales: Locale[] = ["es", "en", "pt", "it"];
export const defaultLocale: Locale = "es";
export const secondaryLocales = ["en", "pt", "it"] as const satisfies readonly Locale[];
export type SecondaryLocale = (typeof secondaryLocales)[number];

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  it: "Italiano",
};

export const localeCodes: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
  it: "IT",
};

export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}

export function isSecondaryLocale(lang: string): lang is SecondaryLocale {
  return (secondaryLocales as readonly string[]).includes(lang);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isSecondaryLocale(segment) ? segment : defaultLocale;
}

/** URL path for a locale. Spanish (default) has no prefix. */
export function localePath(locale: Locale, path = ""): string {
  const normalized = path.replace(/^\//, "").replace(/\/$/, "");
  if (locale === defaultLocale) {
    return normalized ? `/${normalized}` : "/";
  }
  return normalized ? `/${locale}/${normalized}` : `/${locale}`;
}

export function switchLocalePath(
  currentPath: string,
  targetLocale: Locale
): string {
  const parts = currentPath.split("/").filter(Boolean);
  const hasLocalePrefix = parts.length > 0 && isSecondaryLocale(parts[0]!);
  const rest = hasLocalePrefix ? parts.slice(1) : parts;
  return localePath(targetLocale, rest.join("/"));
}

/** @deprecated Use localePath */
export function localizedPath(locale: Locale, path: string): string {
  return localePath(locale, path);
}

export function secondaryLocaleStaticPaths() {
  return secondaryLocales.map((lang) => ({ params: { lang } }));
}

export function ogLocaleTag(locale: Locale): string {
  const tags: Record<Locale, string> = {
    es: "es_VE",
    en: "en_US",
    pt: "pt_BR",
    it: "it_IT",
  };
  return tags[locale];
}
