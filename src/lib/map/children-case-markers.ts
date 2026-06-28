import type { ChildEmergencyCase } from "@/lib/children-emergency/types";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import type { UnifiedMapMarker } from "@/types/map";

export type ChildMapStatus = "missing" | "critical" | "unidentified" | "stable" | "under_care";

const HOSPITAL_COORDS: Record<
  string,
  { lat: number; lng: number; city: string; state: string }
> = {
  "Hospital Domingo Luciani": {
    lat: 10.5015,
    lng: -66.892,
    city: "Caracas",
    state: "Distrito Capital",
  },
  "Hospital Miguel Pérez Carreño": {
    lat: 10.4895,
    lng: -66.878,
    city: "Caracas",
    state: "Distrito Capital",
  },
  "Hospital de La Guaira": {
    lat: 10.601,
    lng: -66.931,
    city: "La Guaira",
    state: "La Guaira",
  },
  "Hospital Vargas": {
    lat: 10.598,
    lng: -66.928,
    city: "La Guaira",
    state: "La Guaira",
  },
  "Centro Médico de Caracas": {
    lat: 10.488,
    lng: -66.875,
    city: "Caracas",
    state: "Distrito Capital",
  },
};

const LOCATION_HINTS: Array<{ pattern: RegExp; lat: number; lng: number; city: string; state: string }> = [
  {
    pattern: /guaira|guayra|vargas|maiquet[ií]a|caribe|catia la mar|macuto|naiguat[aá]/i,
    lat: 10.599,
    lng: -66.934,
    city: "La Guaira",
    state: "La Guaira",
  },
  {
    pattern: /caraballeda|tanaguarena|camuri|los corales/i,
    lat: 10.623,
    lng: -66.845,
    city: "Caraballeda",
    state: "La Guaira",
  },
  {
    pattern: /catia(?! la mar)/i,
    lat: 10.507,
    lng: -66.958,
    city: "Caracas",
    state: "Distrito Capital",
  },
  {
    pattern: /caracas|san bernardino|luciani|p[eé]rez carre[nñ]o|chacao|altamira|petare/i,
    lat: 10.491,
    lng: -66.879,
    city: "Caracas",
    state: "Distrito Capital",
  },
  {
    pattern: /maracay|turmero|aragua/i,
    lat: 10.247,
    lng: -67.596,
    city: "Maracay",
    state: "Aragua",
  },
  {
    pattern: /valencia|carabobo/i,
    lat: 10.162,
    lng: -68.008,
    city: "Valencia",
    state: "Carabobo",
  },
  {
    pattern: /barquisimeto|lara/i,
    lat: 10.065,
    lng: -69.357,
    city: "Barquisimeto",
    state: "Lara",
  },
  {
    pattern: /maracaibo|zulia/i,
    lat: 10.632,
    lng: -71.642,
    city: "Maracaibo",
    state: "Zulia",
  },
  {
    pattern: /tucacas|falc[oó]n/i,
    lat: 10.812,
    lng: -68.325,
    city: "Tucacas",
    state: "Falcón",
  },
  {
    pattern: /parque del oeste|parque del este|chaca[oí]/i,
    lat: 10.493,
    lng: -66.865,
    city: "Caracas",
    state: "Distrito Capital",
  },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function jitterCoords(lat: number, lng: number, seed: string): { lat: number; lng: number } {
  const hash = hashSeed(seed);
  const angle = ((hash % 360) * Math.PI) / 180;
  const radius = 0.0015 + (hash % 7) * 0.00035;
  return {
    lat: lat + Math.sin(angle) * radius,
    lng: lng + Math.cos(angle) * radius,
  };
}

export function classifyChildMapStatus(item: ChildEmergencyCase): ChildMapStatus {
  const blob = normalizeText(
    [item.name, item.found_location, item.child_statement].filter(Boolean).join(" ")
  );

  if (
    /\b(desaparec|desaparecid|missing|busca(n)?|extraviad|sin rastro|aun no|aun estan|no saben nada|perdido)\b/.test(
      blob
    )
  ) {
    return "missing";
  }
  if (item.health_status === "critical") return "critical";
  if (item.health_status === "stable") return "stable";
  if (item.health_status === "unidentified") return "unidentified";
  if (item.custody_status === "under_care") return "under_care";
  return "under_care";
}

export function childMapStatusPriority(status: ChildMapStatus): number {
  switch (status) {
    case "missing":
      return 0;
    case "critical":
      return 1;
    case "unidentified":
      return 2;
    case "under_care":
      return 3;
    case "stable":
      return 4;
    default:
      return 5;
  }
}

export function resolveChildCaseCoords(item: ChildEmergencyCase): {
  lat: number;
  lng: number;
  city: string;
  state: string;
  placeLabel: string;
} {
  const hospital = item.hospital?.trim();
  if (hospital && hospital !== "Otro" && HOSPITAL_COORDS[hospital]) {
    const place = HOSPITAL_COORDS[hospital];
    const jittered = jitterCoords(place.lat, place.lng, item.id);
    return { ...jittered, city: place.city, state: place.state, placeLabel: hospital };
  }

  const locationBlob = normalizeText(
    [item.found_location, item.hospital, item.child_statement, item.name].filter(Boolean).join(" ")
  );

  for (const hint of LOCATION_HINTS) {
    if (hint.pattern.test(locationBlob)) {
      const jittered = jitterCoords(hint.lat, hint.lng, item.id);
      return {
        ...jittered,
        city: hint.city,
        state: hint.state,
        placeLabel: item.found_location?.trim() || item.hospital?.trim() || hint.city,
      };
    }
  }

  const fallback = HOSPITAL_COORDS["Hospital Domingo Luciani"];
  const jittered = jitterCoords(fallback.lat, fallback.lng, item.id);
  return {
    ...jittered,
    city: fallback.city,
    state: fallback.state,
    placeLabel: item.found_location?.trim() || item.hospital?.trim() || fallback.city,
  };
}

export function prioritizeChildCasesForMap(cases: ChildEmergencyCase[]): ChildEmergencyCase[] {
  return [...cases]
    .filter((item) => item.is_active)
    .sort((a, b) => {
      const pa = childMapStatusPriority(classifyChildMapStatus(a));
      const pb = childMapStatusPriority(classifyChildMapStatus(b));
      if (pa !== pb) return pa - pb;
      return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
    });
}

function statusLabel(status: ChildMapStatus, locale: Locale): string {
  const es: Record<ChildMapStatus, string> = {
    missing: "Desaparecido / en peligro",
    critical: "Estado crítico",
    unidentified: "Sin identificar",
    stable: "Estable",
    under_care: "Bajo resguardo",
  };
  const en: Record<ChildMapStatus, string> = {
    missing: "Missing / in danger",
    critical: "Critical condition",
    unidentified: "Unidentified",
    stable: "Stable",
    under_care: "Under care",
  };
  return (locale === "es" ? es : en)[status];
}

function buildDescription(item: ChildEmergencyCase, locale: Locale, placeLabel: string): string {
  const parts: string[] = [];
  if (item.age) {
    parts.push(locale === "es" ? `~${item.age} años` : `~${item.age} years old`);
  }
  if (placeLabel) {
    parts.push(placeLabel);
  }
  if (item.child_statement) {
    const snippet = item.child_statement.slice(0, 120);
    parts.push(`"${snippet}${item.child_statement.length > 120 ? "…" : ""}"`);
  }
  return parts.join(" · ");
}

export function buildChildCaseMapMarkers(
  cases: ChildEmergencyCase[],
  locale: Locale,
  limit: number
): UnifiedMapMarker[] {
  const ordered = prioritizeChildCasesForMap(cases).slice(0, Math.max(0, limit));

  return ordered.map((item) => {
    const childStatus = classifyChildMapStatus(item);
    const coords = resolveChildCaseCoords(item);
    const sourceName =
      item.source === "nexosignal" ? "Niños de Pie — Nexo Signal" : "Red Ayuda — Niños";

    return {
      id: `child-case-${item.id}`,
      layer: "children",
      name: item.name,
      description: buildDescription(item, locale, coords.placeLabel),
      latitude: coords.lat,
      longitude: coords.lng,
      city: coords.city,
      state: coords.state,
      phone: item.contact_phone,
      href: `${localePath(locale, "ninos")}#registro-ninos`,
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Ver en registro de niños" : "View in children registry",
      secondaryHref: item.source_url,
      secondaryHrefExternal: true,
      secondaryHrefLabel:
        item.source === "nexosignal" ? "busca.nexosignal.co" : "redayudavenezuela.com/ninos",
      source: sourceName,
      image_urls: item.photo_url ? [item.photo_url] : undefined,
      meta: statusLabel(childStatus, locale),
      childStatus,
      priority: childStatus === "missing" || childStatus === "critical",
    } satisfies UnifiedMapMarker;
  });
}

export function countChildMapStatuses(cases: ChildEmergencyCase[]) {
  let missing = 0;
  let critical = 0;
  let nexosignal = 0;
  let redayuda = 0;

  for (const item of cases) {
    if (!item.is_active) continue;
    const status = classifyChildMapStatus(item);
    if (status === "missing") missing += 1;
    if (status === "critical") critical += 1;
    if (item.source === "nexosignal") nexosignal += 1;
    if (item.source === "redayuda") redayuda += 1;
  }

  return {
    total: cases.filter((c) => c.is_active).length,
    missing,
    critical,
    nexosignal,
    redayuda,
  };
}
