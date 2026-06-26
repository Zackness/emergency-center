import type { HelpCenter } from "@/types";

export const RDELBUFALO_ACOPIO_SOURCE = "https://www.instagram.com/rdelbufalo/";

const DESC_PREFIX =
  "Centro de acopio activo reportado el 25 de junio de 2026 (@rdelbufalo / Terremoto Venezuela). ";

const ACCEPTS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

const TIMESTAMP = "2026-06-25T14:00:00Z";

export const RDELBUFALO_WHAT_TO_BRING = {
  es: [
    "Agua embotellada",
    "Alimentos no perecederos (enlatados, arroz, pasta, harina)",
    "Ropa en buen estado",
    "Aseo personal",
    "Pañales",
    "Medicamentos sellados",
    "Linternas",
  ],
  en: [
    "Bottled water",
    "Non-perishable food (canned goods, rice, pasta, flour)",
    "Clothing in good condition",
    "Personal hygiene items",
    "Diapers",
    "Sealed medications",
    "Flashlights",
  ],
};

export interface ActiveAcopioRegionMeta {
  id: string;
  titleEs: string;
  titleEn: string;
  pointCount: number;
}

export const RDELBUFALO_ACOPIO_REGIONS: ActiveAcopioRegionMeta[] = [
  { id: "caracas", titleEs: "Caracas (Distrito Capital)", titleEn: "Caracas (Capital District)", pointCount: 3 },
  { id: "aragua", titleEs: "Aragua", titleEn: "Aragua", pointCount: 2 },
  { id: "carabobo", titleEs: "Carabobo", titleEn: "Carabobo", pointCount: 1 },
  { id: "andes", titleEs: "Andes", titleEn: "Andes", pointCount: 2 },
  { id: "oriente", titleEs: "Oriente (Anzoátegui)", titleEn: "East (Anzoátegui)", pointCount: 4 },
  {
    id: "sur-centro",
    titleEs: "Sur y Centro-Occidente",
    titleEn: "South and Central-West",
    pointCount: 2,
  },
];

interface SiteInput {
  id: string;
  region: string;
  name: string;
  description: string;
  type: HelpCenter["type"];
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  schedule?: string;
  virtual?: boolean;
}

const SITES: SiteInput[] = [
  {
    id: "78",
    region: "caracas",
    name: "Centro Mormón — Acopio y refugio",
    description:
      "Funciona también como refugio. Recibe donaciones para familias afectadas por la emergencia.",
    type: "community",
    state: "Distrito Capital",
    city: "Caracas",
    address: "Caracas (coord. 10.611, -66.886)",
    latitude: 10.611,
    longitude: -66.886,
    schedule: "Confirmar horario en sitio",
  },
  {
    id: "79",
    region: "caracas",
    name: "Quinta Bejucal",
    description: "Punto de acopio activo en Caracas. Plus Code: G46W+7R5, Caracas, Miranda.",
    type: "community",
    state: "Miranda",
    city: "Caracas",
    address: "Quinta Bejucal, Plus Code G46W+7R5, Caracas",
    latitude: 10.4847,
    longitude: -66.9583,
    schedule: "Confirmar horario en sitio",
  },
  {
    id: "80",
    region: "caracas",
    name: "Tinta Violeta — Atención psicológica",
    description:
      "Servicio gratuito de atención psicológica por equipos virtuales. No requiere desplazamiento; contacta por sus canales oficiales.",
    type: "ngo",
    state: "Distrito Capital",
    city: "Caracas",
    address: "Atención virtual — sin sede física de acopio",
    latitude: 10.49,
    longitude: -66.88,
    schedule: "Virtual",
    virtual: true,
  },
  {
    id: "81",
    region: "aragua",
    name: "Centro Comercial La Capilla — Maracay",
    description: "Punto de acopio en Maracay.",
    type: "community",
    state: "Aragua",
    city: "Maracay",
    address: "Av. 19 de Abril, piso 1, local 21, Centro Comercial La Capilla",
    latitude: 10.2028,
    longitude: -67.6185,
    schedule: "Horario del centro comercial — confirmar en sitio",
  },
  {
    id: "82",
    region: "aragua",
    name: "Redoma Gran Mariscal Corinsa — Cagua",
    description: "Punto vial con fácil acceso para vehículos.",
    type: "community",
    state: "Aragua",
    city: "Cagua",
    address: "Redoma Gran Mariscal Corinsa, Cagua",
    latitude: 10.1851,
    longitude: -67.4523,
    schedule: "Confirmar en sitio",
  },
  {
    id: "83",
    region: "carabobo",
    name: "Edificio Talislandia — Naguanagua",
    description: "Punto de acopio en El Viñedo, Naguanagua.",
    type: "community",
    state: "Carabobo",
    city: "Naguanagua",
    address: "Av. Monseñor Adams, El Viñedo, mezzanina, Edificio Talislandia",
    latitude: 10.2445,
    longitude: -68.0055,
    schedule: "Confirmar horario en sitio",
  },
  {
    id: "84",
    region: "andes",
    name: "Universidad de Los Andes — Núcleo Táchira",
    description:
      "Recibe alimentos no perecederos, agua potable y ropa en buen estado.",
    type: "university",
    state: "Táchira",
    city: "San Cristóbal",
    address: "Núcleo Táchira, Universidad de Los Andes (ULA)",
    latitude: 7.786,
    longitude: -72.2263,
    schedule: "Confirmar horario institucional",
  },
  {
    id: "85",
    region: "andes",
    name: "Centro Vente — Barinas",
    description: "Punto de acopio y ayuda humanitaria.",
    type: "community",
    state: "Barinas",
    city: "Barinas",
    address: "Centro Vente, Barinas",
    latitude: 8.6305,
    longitude: -70.253,
    schedule: "Confirmar en sitio",
  },
  {
    id: "86",
    region: "oriente",
    name: "Colegio Miguel Otero Silva — CB4 Anzoátegui",
    description: "Centro de acopio CB4 Anzoátegui.",
    type: "community",
    state: "Anzoátegui",
    city: "Puerto La Cruz",
    address: "Colegio Miguel Otero Silva",
    latitude: 10.257,
    longitude: -64.621,
    schedule: "Confirmar en sitio",
  },
  {
    id: "87",
    region: "oriente",
    name: "Plaza Puerto Príncipe y Plaza Bolívar",
    description: "Puntos de acopio comunitarios en Lechería y Barcelona.",
    type: "community",
    state: "Anzoátegui",
    city: "Lechería / Barcelona",
    address: "Plaza Puerto Príncipe (Lechería) y Plaza Bolívar (Barcelona)",
    latitude: 10.5845,
    longitude: -64.6129,
    schedule: "Confirmar en sitio",
  },
  {
    id: "88",
    region: "oriente",
    name: "Casa del Abuelo",
    description: "Punto vecinal habilitado para recibir donaciones.",
    type: "community",
    state: "Anzoátegui",
    city: "Barcelona",
    address: "Casa del Abuelo, municipio Simón Bolívar",
    latitude: 10.14,
    longitude: -64.69,
    schedule: "Confirmar en sitio",
  },
  {
    id: "89",
    region: "oriente",
    name: "Alcaldía del Municipio Simón Bolívar",
    description: "Punto institucional de acopio.",
    type: "government",
    state: "Anzoátegui",
    city: "Barcelona",
    address: "Alcaldía del Municipio Simón Bolívar, Barcelona",
    latitude: 10.136,
    longitude: -64.682,
    schedule: "Horario de la alcaldía — confirmar en sitio",
  },
  {
    id: "90",
    region: "sur-centro",
    name: "UCAB Guayana — Casa del Estudiante",
    description: "Piso alto de la Casa del Estudiante, Ciudad Guayana.",
    type: "university",
    state: "Bolívar",
    city: "Ciudad Guayana",
    address: "UCAB Guayana, piso alto Casa del Estudiante",
    latitude: 8.3065,
    longitude: -62.7175,
    schedule: "Confirmar horario universitario",
  },
  {
    id: "91",
    region: "sur-centro",
    name: "Red Cecosesola — Barquisimeto",
    description: "Ferias de acopio en puntos comunitarios de la red Cecosesola.",
    type: "community",
    state: "Lara",
    city: "Barquisimeto",
    address: "Red Cecosesola, puntos comunitarios, Barquisimeto",
    latitude: 10.0638,
    longitude: -69.3208,
    schedule: "Consultar fechas de ferias de acopio en redes de Cecosesola",
  },
];

export const RDELBUFALO_ACOPIO_CENTERS: HelpCenter[] = SITES.map((site) => ({
  id: site.id,
  name: site.name,
  description: `${DESC_PREFIX}${site.description}${site.virtual ? "" : " Fuente: @rdelbufalo."}`,
  type: site.type,
  state: site.state,
  city: site.city,
  address: site.address,
  latitude: site.latitude,
  longitude: site.longitude,
  phone: site.phone ?? null,
  email: null,
  schedule: site.schedule ?? "Por confirmar",
  accepts: [...ACCEPTS],
  image_url: null,
  image_urls: [],
  is_verified: true,
  is_active: true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
}));

export function getAcopioCentersByRegion(regionId: string): HelpCenter[] {
  const regionSites = SITES.filter((s) => s.region === regionId);
  return RDELBUFALO_ACOPIO_CENTERS.filter((c) =>
    regionSites.some((s) => s.id === c.id),
  );
}
