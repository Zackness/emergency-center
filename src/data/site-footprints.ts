import type { Locale } from "@/i18n/config";

export type FootprintGroupId = "help" | "people" | "participate" | "info";

export interface SiteFootprintDef {
  path: string;
  icon: string;
  group: FootprintGroupId;
  titleKey: string;
  descKey: string;
}

export const SITE_FOOTPRINT_GROUPS: FootprintGroupId[] = [
  "help",
  "people",
  "participate",
  "info",
];

export const SITE_FOOTPRINTS: SiteFootprintDef[] = [
  {
    path: "/centros-ayuda",
    icon: "map-pin",
    group: "help",
    titleKey: "nav.helpCenters",
    descKey: "helpCenters.subtitle",
  },
  {
    path: "/hospitales",
    icon: "hospital",
    group: "help",
    titleKey: "nav.hospitals",
    descKey: "hospitals.subtitle",
  },
  {
    path: "/refugios",
    icon: "tent",
    group: "help",
    titleKey: "nav.shelters",
    descKey: "shelters.subtitle",
  },
  {
    path: "/danos",
    icon: "alert-triangle",
    group: "help",
    titleKey: "nav.damage",
    descKey: "damage.subtitle",
  },
  {
    path: "/organismos",
    icon: "building",
    group: "help",
    titleKey: "nav.agencies",
    descKey: "agencies.subtitle",
  },
  {
    path: "/desaparecidos",
    icon: "users",
    group: "people",
    titleKey: "nav.missing",
    descKey: "missing.subtitle",
  },
  {
    path: "/mascotas",
    icon: "paw",
    group: "people",
    titleKey: "nav.pets",
    descKey: "pets.subtitle",
  },
  {
    path: "/centros-ayuda/registrar",
    icon: "plus-circle",
    group: "participate",
    titleKey: "helpCenters.register.title",
    descKey: "helpCenters.register.subtitle",
  },
  {
    path: "/centros-ayuda/panel",
    icon: "layout-dashboard",
    group: "participate",
    titleKey: "centerDashboard.title",
    descKey: "centerDashboard.subtitle",
  },
  {
    path: "/voluntarios",
    icon: "heart",
    group: "participate",
    titleKey: "nav.volunteers",
    descKey: "volunteers.subtitle",
  },
  {
    path: "/empresas",
    icon: "briefcase",
    group: "participate",
    titleKey: "nav.companies",
    descKey: "companies.subtitle",
  },
  {
    path: "/buscar",
    icon: "search",
    group: "info",
    titleKey: "search.title",
    descKey: "search.subtitle",
  },
  {
    path: "/noticias",
    icon: "newspaper",
    group: "info",
    titleKey: "nav.news",
    descKey: "news.subtitle",
  },
  {
    path: "/recursos",
    icon: "book-open",
    group: "info",
    titleKey: "nav.resources",
    descKey: "resources.subtitle",
  },
  {
    path: "/roadmap",
    icon: "sparkles",
    group: "info",
    titleKey: "nav.roadmap",
    descKey: "roadmap.subtitle",
  },
];

export interface ResolvedSiteFootprint {
  href: string;
  title: string;
  description: string;
  icon: string;
  group: FootprintGroupId;
}

export function resolveSiteFootprints(
  locale: Locale,
  t: (key: string) => string
): ResolvedSiteFootprint[] {
  return SITE_FOOTPRINTS.map((def) => ({
    href: `/${locale}${def.path}`,
    title: t(def.titleKey),
    description: t(def.descKey),
    icon: def.icon,
    group: def.group,
  }));
}

export function groupSiteFootprints(footprints: ResolvedSiteFootprint[]) {
  return SITE_FOOTPRINT_GROUPS.map((groupId) => ({
    id: groupId,
    items: footprints.filter((footprint) => footprint.group === groupId),
  })).filter((group) => group.items.length > 0);
}
