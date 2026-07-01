import type { Locale } from "@/i18n/config";
import { localePath, locales, ogLocaleTag, switchLocalePath } from "@/i18n/config";
import { HOME_HERO_IMAGE } from "@/data/site-images";

export const SITE_NAME = "Emergency Center";
export const DEFAULT_OG_IMAGE = HOME_HERO_IMAGE;
export const TWITTER_HANDLE = "@startupven";

const NOINDEX_PREFIXES = [
  "/admin",
  "/centros-ayuda/panel",
  "/centros-ayuda/acceso",
  "/centros-ayuda/restablecer-contrasena",
  "/api/",
];

export function isIndexablePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return !NOINDEX_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function absoluteUrl(site: URL | string | undefined, pathname: string): URL {
  return new URL(pathname, site);
}

export function absoluteAssetUrl(site: URL | string | undefined, assetPath: string): string {
  return absoluteUrl(site, assetPath).href;
}

export function hreflangAlternates(
  site: URL | string | undefined,
  pathname: string,
): { locale: Locale; href: string }[] {
  return locales.map((loc) => ({
    locale: loc,
    href: absoluteUrl(site, switchLocalePath(pathname, loc)).href,
  }));
}

export function ogLocaleAlternates(currentLocale: Locale): string[] {
  return locales.filter((loc) => loc !== currentLocale).map((loc) => ogLocaleTag(loc));
}

export function buildWebSiteJsonLd(site: URL | string | undefined, locale: Locale) {
  const origin = absoluteUrl(site, "/").href;
  const searchPath = localePath(locale, "buscar");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: origin,
    inLanguage: locale,
    description:
      locale === "es"
        ? "Hub central de información y ayuda durante emergencias nacionales en Venezuela."
        : "Central hub for verified emergency information and aid in Venezuela.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(site, searchPath).href}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd(site: URL | string | undefined) {
  const origin = absoluteUrl(site, "/").href;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: origin,
    logo: absoluteAssetUrl(site, "/favicon.svg"),
    sameAs: ["https://startupven.com"],
  };
}

export function sitemapFilter(page: string): boolean {
  try {
    const pathname = new URL(page).pathname;
    return isIndexablePath(pathname);
  } catch {
    return true;
  }
}
