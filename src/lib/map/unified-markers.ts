import { centerMatchesZone } from "@/data/emergency-zones";
import { NEXOSIGNAL_NINOS } from "@/data/children-emergency";
import { getRedAyudaSnapshot, REDAYUDA_PLATFORM_URL } from "@/data/redayuda-resources";
import { coordsForCaracasZone } from "@/lib/map/caracas-zone-coords";
import { centroidForZone } from "@/lib/map/zone-centroids";
import { localePath, type Locale } from "@/i18n/config";
import type {
  DamageReport,
  HelpCenter,
  Hospital,
  Shelter,
} from "@/types";
import type { ChildEmergencyCase } from "@/lib/children-emergency/types";
import { buildChildCaseMapMarkers } from "@/lib/map/children-case-markers";
import type { UnifiedMapLayer, UnifiedMapMarker } from "@/types/map";

const REDAYUDA_BASE = REDAYUDA_PLATFORM_URL;

export interface BuildUnifiedMapOptions {
  locale?: Locale;
  layers?: UnifiedMapLayer[];
  zone?: string;
  search?: string;
  severity?: string;
  helpCenters: HelpCenter[];
  hospitals: Hospital[];
  shelters: Shelter[];
  damageReports: DamageReport[];
  childCases?: ChildEmergencyCase[];
  limits?: Partial<Record<UnifiedMapLayer, number>>;
  maxTotal?: number;
}

const DEFAULT_LIMITS: Record<UnifiedMapLayer, number> = {
  help_center: 800,
  hospital: 400,
  shelter: 100,
  damage: 3000,
  quake: 50,
  redayuda: 50,
  platform: 30,
  children: 2000,
};

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function matchesSearch(marker: UnifiedMapMarker, search: string): boolean {
  const needle = normalizeSearch(search.trim());
  if (!needle) return true;
  const haystack = normalizeSearch(
    [marker.name, marker.description, marker.address, marker.city, marker.state, marker.meta, marker.source]
      .filter(Boolean)
      .join(" ")
  );
  return haystack.includes(needle);
}

function matchesZone(
  item: { city?: string | null; state?: string | null },
  zone?: string
): boolean {
  if (!zone || zone === "all") return true;
  return centerMatchesZone(
    { city: item.city ?? "", state: item.state ?? "" },
    zone
  );
}

function path(locale: Locale, segment: string): string {
  return localePath(locale, segment);
}

function helpCenterMarkers(centers: HelpCenter[], locale: Locale): UnifiedMapMarker[] {
  return centers.map((center) => ({
    id: `hc-${center.id}`,
    layer: "help_center",
    name: center.name,
    description: center.description,
    latitude: center.latitude,
    longitude: center.longitude,
    address: center.address,
    city: center.city,
    state: center.state,
    phone: center.phone,
    href: `${path(locale, "centros-ayuda")}#${center.id}`,
    hrefExternal: false,
    hrefLabel: locale === "es" ? "Ver centro" : "View center",
    source: center.is_verified ? "Centro de Emergencia" : null,
    meta: center.schedule ?? undefined,
  }));
}

function hospitalMarkers(hospitals: Hospital[], locale: Locale): UnifiedMapMarker[] {
  return hospitals.map((hospital) => ({
    id: `h-${hospital.id}`,
    layer: "hospital",
    name: hospital.name,
    latitude: hospital.latitude,
    longitude: hospital.longitude,
    address: hospital.address,
    city: hospital.city,
    state: hospital.state,
    phone: hospital.phone,
    status: hospital.status,
    description: hospital.notes,
    href: path(locale, "hospitales"),
    hrefExternal: false,
    hrefLabel: locale === "es" ? "Directorio de hospitales" : "Hospital directory",
    secondaryHref: "https://hospitalesenvenezuela.com",
    secondaryHrefExternal: true,
    secondaryHrefLabel: locale === "es" ? "Buscar ingresados" : "Search admissions",
    source: "Centro de Emergencia",
  }));
}

function shelterMarkers(shelters: Shelter[], locale: Locale): UnifiedMapMarker[] {
  return shelters.map((shelter) => ({
    id: `sh-${shelter.id}`,
    layer: "shelter",
    name: shelter.name,
    latitude: shelter.latitude,
    longitude: shelter.longitude,
    address: shelter.address,
    city: shelter.city,
    state: shelter.state,
    phone: shelter.phone,
    description: shelter.services?.join(", ") ?? null,
    href: `${path(locale, "refugios")}#${shelter.id}`,
    hrefExternal: false,
    hrefLabel: locale === "es" ? "Ver refugio" : "View shelter",
    meta: shelter.capacity ? `Cap. ${shelter.capacity}` : undefined,
    source: shelter.is_verified ? "Centro de Emergencia" : null,
  }));
}

function damageMarkers(reports: DamageReport[], locale: Locale): UnifiedMapMarker[] {
  return reports.map((report) => ({
    id: `dmg-${report.id}`,
    layer: "damage",
    name: report.title,
    description: report.description,
    latitude: report.latitude,
    longitude: report.longitude,
    address: report.address,
    city: report.city,
    state: report.state,
    severity: report.severity,
    href: `${path(locale, "danos")}#${report.id}`,
    hrefExternal: false,
    hrefLabel: locale === "es" ? "Ver en mapa de daños" : "View on damage map",
    secondaryHref: report.source_url ?? "https://terremotovenezuela.com",
    secondaryHrefExternal: true,
    secondaryHrefLabel: report.source_name ?? "Terremoto Venezuela",
    source: report.source_name,
    image_urls: report.image_urls,
  }));
}

function redAyudaMarkers(locale: Locale): UnifiedMapMarker[] {
  const snapshot = getRedAyudaSnapshot();
  const markers: UnifiedMapMarker[] = [];

  for (const quake of snapshot.quakes) {
    markers.push({
      id: `ra-quake-${quake.id}`,
      layer: "quake",
      name: `M${quake.mag.toFixed(1)} — ${quake.place}`,
      latitude: quake.lat,
      longitude: quake.lng,
      description:
        locale === "es"
          ? "Sismo reciente (USGS vía Red Ayuda Venezuela)"
          : "Recent earthquake (USGS via Red Ayuda Venezuela)",
      href: `${path(locale, "recursos")}#red-ayuda-venezuela`,
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Réplicas en recursos" : "Aftershocks in resources",
      secondaryHref: REDAYUDA_BASE,
      secondaryHrefExternal: true,
      secondaryHrefLabel: "Red Ayuda Venezuela",
      source: "Red Ayuda Venezuela / USGS",
      meta: new Date(quake.time).toLocaleString(locale === "es" ? "es-VE" : "en-US"),
    });
  }

  for (const hospital of snapshot.hospitals) {
    const coords = coordsForCaracasZone(hospital.zone);
    markers.push({
      id: `ra-h-${hospital.id}`,
      layer: "redayuda",
      name: hospital.name,
      latitude: coords.lat,
      longitude: coords.lng,
      address: `${hospital.zone}, ${hospital.city}`,
      city: hospital.city,
      state: hospital.state,
      phone: hospital.phone,
      description:
        locale === "es"
          ? "Hospital en Caracas (Red Ayuda Venezuela)"
          : "Caracas hospital (Red Ayuda Venezuela)",
      href: `${path(locale, "recursos")}#red-ayuda-venezuela`,
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Teléfonos y guía" : "Phones and guide",
      secondaryHref: `${REDAYUDA_BASE}/hospitales`,
      secondaryHrefExternal: true,
      secondaryHrefLabel: "Red Ayuda — Hospitales",
      source: "Red Ayuda Venezuela",
    });
  }

  const stats = snapshot.stats;
  if (stats) {
    const epicenter = snapshot.quakes.find((q) => q.mag >= 7) ?? snapshot.quakes[0];
    const hubLat = epicenter?.lat ?? 10.435;
    const hubLng = epicenter?.lng ?? -68.472;

    markers.push({
      id: "ra-hub-desaparecidos",
      layer: "platform",
      name:
        locale === "es"
          ? `Desaparecidos (${stats.desaparecidos.toLocaleString()})`
          : `Missing persons (${stats.desaparecidos.toLocaleString()})`,
      latitude: hubLat + 0.08,
      longitude: hubLng,
      description:
        locale === "es"
          ? "Registro ciudadano consolidado en Red Ayuda Venezuela"
          : "Consolidated citizen registry on Red Ayuda Venezuela",
      href: path(locale, "desaparecidos"),
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Hub de desaparecidos" : "Missing persons hub",
      secondaryHref: REDAYUDA_BASE,
      secondaryHrefExternal: true,
      secondaryHrefLabel: "Red Ayuda — Buscar",
      source: "Red Ayuda Venezuela",
    });

    markers.push({
      id: "ra-hub-salvo",
      layer: "platform",
      name:
        locale === "es"
          ? `Personas a salvo (${stats.salvo.toLocaleString()})`
          : `Safe reports (${stats.salvo.toLocaleString()})`,
      latitude: hubLat + 0.04,
      longitude: hubLng + 0.06,
      description:
        locale === "es"
          ? "Reportes de personas localizadas o a salvo"
          : "Reports of located or safe persons",
      href: REDAYUDA_BASE,
      hrefExternal: true,
      hrefLabel: "Red Ayuda Venezuela",
      source: "Red Ayuda Venezuela",
    });

    markers.push({
      id: "ra-hub-puntos",
      layer: "platform",
      name:
        locale === "es"
          ? `Puntos de ayuda (${stats.puntos})`
          : `Help points (${stats.puntos})`,
      latitude: 10.4806,
      longitude: -66.9036,
      city: "Caracas",
      state: "Distrito Capital",
      description:
        locale === "es"
          ? "Mapa de acopios, refugios y centros en Red Ayuda"
          : "Collection, shelter and aid points map on Red Ayuda",
      href: `${REDAYUDA_BASE}/ayuda/centros`,
      hrefExternal: true,
      hrefLabel: locale === "es" ? "Mapa en Red Ayuda" : "Map on Red Ayuda",
      secondaryHref: path(locale, "centros-ayuda"),
      secondaryHrefExternal: false,
      secondaryHrefLabel: locale === "es" ? "Centros verificados aquí" : "Verified centers here",
      source: "Red Ayuda Venezuela",
    });

    markers.push({
      id: "ra-hub-voluntarios",
      layer: "platform",
      name:
        locale === "es"
          ? `Voluntarios (${stats.voluntarios})`
          : `Volunteers (${stats.voluntarios})`,
      latitude: 10.47,
      longitude: -66.92,
      description:
        locale === "es"
          ? "Red de voluntarios en campo"
          : "Field volunteer network",
      href: `${REDAYUDA_BASE}/ayuda/voluntarios`,
      hrefExternal: true,
      hrefLabel: "Red Ayuda — Voluntarios",
      secondaryHref: path(locale, "voluntarios"),
      secondaryHrefExternal: false,
      secondaryHrefLabel: locale === "es" ? "Registrarse aquí" : "Register here",
      source: "Red Ayuda Venezuela",
    });

    markers.push({
      id: "ra-hub-necesidades",
      layer: "platform",
      name:
        locale === "es"
          ? `Necesidades (${stats.necesidades})`
          : `Needs (${stats.necesidades})`,
      latitude: 10.51,
      longitude: -66.88,
      description:
        locale === "es"
          ? "Pedidos de ayuda y suministros en tiempo real"
          : "Real-time aid and supply requests",
      href: `${REDAYUDA_BASE}/ayuda/necesidades`,
      hrefExternal: true,
      hrefLabel: "Red Ayuda — Necesidades",
      secondaryHref: "https://ayudaencamino.com",
      secondaryHrefExternal: true,
      secondaryHrefLabel: "Ayuda en Camino",
      source: "Red Ayuda Venezuela",
    });

    if (stats.atrapados > 0) {
      markers.push({
        id: "ra-hub-atrapados",
        layer: "platform",
        name:
          locale === "es"
            ? `Atrapados reportados (${stats.atrapados})`
            : `Reported trapped (${stats.atrapados})`,
        latitude: 10.599,
        longitude: -66.935,
        city: "La Guaira",
        state: "La Guaira",
        description:
          locale === "es"
            ? "Personas atrapadas en estructuras reportadas en Red Ayuda"
            : "Persons trapped in structures reported on Red Ayuda",
        href: path(locale, "danos"),
        hrefExternal: false,
        hrefLabel: locale === "es" ? "Mapa de daños" : "Damage map",
        secondaryHref: REDAYUDA_BASE,
        secondaryHrefExternal: true,
        secondaryHrefLabel: "Red Ayuda",
        source: "Red Ayuda Venezuela",
      });
    }

    if (snapshot.denuncias) {
      markers.push({
        id: "ra-hub-denuncias",
        layer: "platform",
        name:
          locale === "es"
            ? `Denuncias (${snapshot.denuncias})`
            : `Reports (${snapshot.denuncias})`,
        latitude: 10.465,
        longitude: -66.87,
        description:
          locale === "es"
            ? "Denuncias ciudadanas de irregularidades"
            : "Citizen reports of irregularities",
        href: `${REDAYUDA_BASE}/denuncias`,
        hrefExternal: true,
        hrefLabel: "Red Ayuda — Denuncias",
        source: "Red Ayuda Venezuela",
      });
    }
  }

  return markers;
}

function childrenHubMarkers(locale: Locale): UnifiedMapMarker[] {
  const snapshot = getRedAyudaSnapshot();
  const ninosCount = snapshot.ninos ?? 0;

  return [
    {
      id: "children-redayuda",
      layer: "children",
      name:
        locale === "es"
          ? `Red Ayuda — Niños (${ninosCount})`
          : `Red Ayuda — Children (${ninosCount})`,
      latitude: 10.492,
      longitude: -66.89,
      city: "Caracas",
      state: "Distrito Capital",
      description:
        locale === "es"
          ? "Niños y niñas desaparecidos reportados por familias y menores rescatados solos. Busca por nombre o reporta un niño encontrado."
          : "Missing children reported by families and unaccompanied rescued minors. Search by name or report a found child.",
      href: `${path(locale, "ninos")}#red-ayuda-ninos`,
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Directorio de niños" : "Children directory",
      secondaryHref: "https://redayudavenezuela.com/ninos",
      secondaryHrefExternal: true,
      secondaryHrefLabel: "redayudavenezuela.com/ninos",
      source: "Red Ayuda Venezuela",
    },
    {
      id: "children-nexosignal",
      layer: "children",
      name: locale === "es" ? "Niños de Pie — Nexo Signal" : "Niños de Pie — Nexo Signal",
      latitude: 10.485,
      longitude: -66.905,
      city: "Caracas",
      state: "Distrito Capital",
      description:
        locale === "es"
          ? "Directorio de niños rescatados de los escombros sin familia identificada. Busca por hospital o reporta un menor a tu cargo."
          : "Directory of children rescued from rubble without identified family. Search by hospital or report a child in your care.",
      href: `${path(locale, "ninos")}#nexosignal-ninos-de-pie`,
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Buscar niños rescatados" : "Search rescued children",
      secondaryHref: NEXOSIGNAL_NINOS.url,
      secondaryHrefExternal: true,
      secondaryHrefLabel: NEXOSIGNAL_NINOS.domain,
      source: "Nexo Signal",
    },
    {
      id: "children-jm-rios",
      layer: "children",
      name:
        locale === "es"
          ? "Hospital J.M. de los Ríos — menores"
          : "J.M. de los Ríos Hospital — minors",
      latitude: 10.5012,
      longitude: -66.8885,
      address: "San Bernardino, Caracas",
      city: "Caracas",
      state: "Distrito Capital",
      description:
        locale === "es"
          ? "Referencia frecuente en reportes de niños trasladados y atendidos tras el terremoto (vía Red Ayuda y medios)."
          : "Frequent reference in reports of children transferred and treated after the earthquake (via Red Ayuda and media).",
      href: `${path(locale, "ninos")}`,
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Página de niños" : "Children page",
      secondaryHref: `${REDAYUDA_BASE}/hospitales`,
      secondaryHrefExternal: true,
      secondaryHrefLabel: locale === "es" ? "Hospitales Red Ayuda" : "Red Ayuda hospitals",
      source: "Red Ayuda Venezuela",
    },
    {
      id: "children-casa-bambi",
      layer: "children",
      name: locale === "es" ? "Casa Bambi — Hogar Bambi" : "Casa Bambi — Hogar Bambi",
      latitude: 10.478,
      longitude: -66.868,
      city: "Caracas",
      state: "Distrito Capital",
      phone: "+58 414-3081107",
      description:
        locale === "es"
          ? "Apoyo a niños, niñas y adolescentes sin padres o afectados por el terremoto. Donaciones e insumos vía hogarbambi.org."
          : "Support for children and teens without parents or affected by the earthquake. Donations via hogarbambi.org.",
      href: `${path(locale, "empresas")}#casa-bambi`,
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Ver iniciativa" : "View initiative",
      secondaryHref: "https://hogarbambi.org/",
      secondaryHrefExternal: true,
      secondaryHrefLabel: "hogarbambi.org",
      source: "Hogar Bambi Venezuela",
    },
  ];
}

function platformHubMarkers(locale: Locale): UnifiedMapMarker[] {
  const hubs: Omit<UnifiedMapMarker, "id">[] = [
    {
      layer: "platform",
      name: locale === "es" ? "Desaparecidos — hub integrado" : "Missing persons — integrated hub",
      latitude: 10.515,
      longitude: -66.925,
      city: "Caracas",
      state: "Distrito Capital",
      description:
        locale === "es"
          ? "Búsqueda de personas desaparecidas tras el terremoto del 24 de junio"
          : "Search for missing persons after the June 24 earthquake",
      href: path(locale, "desaparecidos"),
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Hub de desaparecidos" : "Missing persons hub",
      secondaryHref: REDAYUDA_BASE,
      secondaryHrefExternal: true,
      secondaryHrefLabel: "Red Ayuda — Buscar",
      source: "Centro de Emergencia",
    },
    {
      layer: "platform",
      name: locale === "es" ? "Vzla Ayuda — ofertas y solicitudes" : "Vzla Ayuda — offers and requests",
      latitude: centroidForZone("caracas").lat,
      longitude: centroidForZone("caracas").lng,
      city: "Caracas",
      state: "Distrito Capital",
      description:
        locale === "es"
          ? "Directorio solidario: quien puede ayudar y quien necesita apoyo"
          : "Solidarity directory: who can help and who needs support",
      href: path(locale, "voluntarios"),
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Ver voluntarios" : "View volunteers",
      secondaryHref: "https://vzlayuda.com",
      secondaryHrefExternal: true,
      secondaryHrefLabel: "vzlayuda.com",
      source: "Vzla Ayuda",
    },
    {
      layer: "platform",
      name: locale === "es" ? "VenApp — Reportes oficiales" : "VenApp — Official reports",
      latitude: 10.505,
      longitude: -66.915,
      description:
        locale === "es"
          ? "Plataforma oficial: desaparecidos y daños en viviendas"
          : "Official platform: missing persons and housing damage",
      href: "https://venapp.com",
      hrefExternal: true,
      hrefLabel: "VenApp",
      source: "Gobierno de Venezuela",
    },
    {
      layer: "platform",
      name: locale === "es" ? "Terremoto Venezuela — Mapa de daños" : "Terremoto Venezuela — Damage map",
      latitude: 10.59,
      longitude: -66.94,
      city: "La Guaira",
      state: "La Guaira",
      description:
        locale === "es"
          ? "Edificios afectados reportados por la comunidad"
          : "Community-reported affected buildings",
      href: path(locale, "danos"),
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Mapa integrado aquí" : "Integrated map here",
      secondaryHref: "https://terremotovenezuela.com",
      secondaryHrefExternal: true,
      secondaryHrefLabel: "terremotovenezuela.com",
      source: "Terremoto Venezuela",
    },
    {
      layer: "platform",
      name: "Centroacopio.site",
      latitude: centroidForZone("valencia").lat,
      longitude: centroidForZone("valencia").lng,
      city: "Valencia",
      state: "Carabobo",
      description:
        locale === "es"
          ? "Red nacional de acopios y deliveries gratuitos"
          : "National collection centers and free deliveries",
      href: path(locale, "centros-ayuda"),
      hrefExternal: false,
      hrefLabel: locale === "es" ? "Centros verificados" : "Verified centers",
      secondaryHref: "https://centroacopio.site/",
      secondaryHrefExternal: true,
      secondaryHrefLabel: "centroacopio.site",
      source: "Centroacopio.site",
    },
    {
      layer: "platform",
      name: locale === "es" ? "Mascotas perdidas" : "Lost pets",
      latitude: centroidForZone("la-guaira").lat,
      longitude: centroidForZone("la-guaira").lng,
      description:
        locale === "es"
          ? "Registro de mascotas extraviadas tras el sismo"
          : "Lost pet registry after the earthquake",
      href: path(locale, "mascotas"),
      hrefExternal: false,
      hrefLabel: locale === "es" ? "HuellasCAN y más" : "HuellasCAN and more",
      secondaryHref: "https://www.huellascan.com/terremoto",
      secondaryHrefExternal: true,
      secondaryHrefLabel: "HuellasCAN",
      source: "Centro de Emergencia",
    },
  ];

  return hubs.map((hub, index) => ({
    ...hub,
    id: `platform-hub-${index}`,
  }));
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function buildUnifiedMapMarkers(options: BuildUnifiedMapOptions): UnifiedMapMarker[] {
  const locale = options.locale ?? "es";
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  const activeLayers = new Set<UnifiedMapLayer>(
    options.layers?.length ? options.layers : (Object.keys(DEFAULT_LIMITS) as UnifiedMapLayer[])
  );

  const buckets: UnifiedMapMarker[] = [];

  if (activeLayers.has("help_center")) {
    const filtered = options.helpCenters.filter((c) => matchesZone(c, options.zone));
    buckets.push(...helpCenterMarkers(filtered.slice(0, limits.help_center), locale));
  }

  if (activeLayers.has("hospital")) {
    const filtered = options.hospitals.filter((h) => matchesZone(h, options.zone));
    buckets.push(...hospitalMarkers(filtered.slice(0, limits.hospital), locale));
  }

  if (activeLayers.has("shelter")) {
    const filtered = options.shelters.filter((s) => matchesZone(s, options.zone));
    buckets.push(...shelterMarkers(filtered.slice(0, limits.shelter), locale));
  }

  if (activeLayers.has("damage")) {
    let filtered = options.damageReports.filter((d) => matchesZone(d, options.zone));
    if (options.severity && options.severity !== "all") {
      filtered = filtered.filter((d) => d.severity === options.severity);
    }
    buckets.push(...damageMarkers(filtered.slice(0, limits.damage), locale));
  }

  if (activeLayers.has("quake")) {
    buckets.push(
      ...redAyudaMarkers(locale)
        .filter((m) => m.layer === "quake")
        .slice(0, limits.quake)
    );
  }

  if (activeLayers.has("redayuda")) {
    buckets.push(
      ...redAyudaMarkers(locale)
        .filter((m) => m.layer === "redayuda")
        .slice(0, limits.redayuda)
    );
  }

  if (activeLayers.has("platform")) {
    buckets.push(
      ...redAyudaMarkers(locale)
        .filter((m) => m.layer === "platform")
        .slice(0, limits.platform)
    );
    buckets.push(...platformHubMarkers(locale));
  }

  if (activeLayers.has("children")) {
    const hubs = childrenHubMarkers(locale);
    const caseLimit = Math.max(0, (limits.children ?? DEFAULT_LIMITS.children) - hubs.length);
    if (options.childCases?.length) {
      buckets.push(...buildChildCaseMapMarkers(options.childCases, locale, caseLimit));
    }
    buckets.push(...hubs);
  }

  let result = buckets.filter((m) => isValidCoord(m.latitude, m.longitude));

  if (options.search?.trim()) {
    result = result.filter((m) => matchesSearch(m, options.search!));
  }

  const maxTotal = options.maxTotal ?? 2000;
  return result.slice(0, maxTotal);
}

export function countMarkersByLayer(markers: UnifiedMapMarker[]): Partial<Record<UnifiedMapLayer, number>> {
  const counts: Partial<Record<UnifiedMapLayer, number>> = {};
  for (const marker of markers) {
    counts[marker.layer] = (counts[marker.layer] ?? 0) + 1;
  }
  return counts;
}
