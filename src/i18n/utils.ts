import type { Locale } from "./config";
import es from "./locales/es.json";
import en from "./locales/en.json";

const dictionaries = { es, en } as const;

export type TranslationKey = keyof typeof es;
export type NestedKey<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKey<T[K]>}`
        : K
      : never }[keyof T]
  : never;

export function useTranslations(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries.es;

  function t(key: string): string {
    const keys = key.split(".");
    let value: unknown = dict;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  }

  return { t, dict };
}

export function getNavItems(locale: Locale) {
  const { t } = useTranslations(locale);
  return [
    { href: `/${locale}`, label: t("nav.home"), icon: "home" },
    {
      href: `/${locale}/centros-ayuda`,
      label: t("nav.helpCenters"),
      icon: "map-pin",
    },
    {
      href: `/${locale}/hospitales`,
      label: t("nav.hospitals"),
      icon: "hospital",
    },
    {
      href: `/${locale}/refugios`,
      label: t("nav.shelters"),
      icon: "tent",
    },
    {
      href: `/${locale}/danos`,
      label: t("nav.damage"),
      icon: "alert-triangle",
    },
    {
      href: `/${locale}/organismos`,
      label: t("nav.agencies"),
      icon: "building",
    },
    {
      href: `/${locale}/desaparecidos`,
      label: t("nav.missing"),
      icon: "users",
    },
    {
      href: `/${locale}/mascotas`,
      label: t("nav.pets"),
      icon: "paw",
    },
    {
      href: `/${locale}/noticias`,
      label: t("nav.news"),
      icon: "newspaper",
    },
    {
      href: `/${locale}/voluntarios`,
      label: t("nav.volunteers"),
      icon: "heart-handshake",
    },
    {
      href: `/${locale}/empresas`,
      label: t("nav.companies"),
      icon: "briefcase",
    },
    {
      href: `/${locale}/recursos`,
      label: t("nav.resources"),
      icon: "book-open",
    },
    {
      href: `/${locale}/roadmap`,
      label: t("nav.roadmap"),
      icon: "sparkles",
    },
  ];
}
