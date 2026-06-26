import type { DamageReport } from "@/types";

export const PRIORITY_RESCUE_SOURCE_URL = "https://www.instagram.com/rdelbufalo/";
export const PRIORITY_RESCUE_SOURCE_NAME = "@rdelbufalo — Terremoto Venezuela";
export const PRIORITY_RESCUE_PUBLISHED_AT = "2026-06-25T12:00:00Z";

export interface PriorityRescueZoneMeta {
  id: string;
  titleEs: string;
  titleEn: string;
}

export const PRIORITY_RESCUE_ZONES: PriorityRescueZoneMeta[] = [
  { id: "caraballeda", titleEs: "Caraballeda", titleEn: "Caraballeda" },
  {
    id: "catia-maiquetia",
    titleEs: "Catia La Mar y Maiquetía",
    titleEn: "Catia La Mar and Maiquetía",
  },
  { id: "caracas", titleEs: "Caracas", titleEn: "Caracas" },
  {
    id: "interior",
    titleEs: "Interior (Aragua y Falcón)",
    titleEn: "Interior (Aragua and Falcón)",
  },
  {
    id: "institutions",
    titleEs: "Instituciones con víctimas múltiples",
    titleEn: "Institutions with multiple victims",
  },
];

interface PrioritySiteInput {
  id: string;
  zone: string;
  title: string;
  description: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  severity: "collapsed" | "damaged";
}

const SITES: PrioritySiteInput[] = [
  {
    id: "pr-01",
    zone: "caraballeda",
    title: "Edificio Tahiti",
    description: "3 personas desaparecidas identificadas.",
    state: "La Guaira",
    city: "Caraballeda",
    address: "Caraballeda, eje 10.618 N, -66.85 W",
    latitude: 10.6184,
    longitude: -66.8495,
    severity: "collapsed",
  },
  {
    id: "pr-02",
    zone: "caraballeda",
    title: "Hotel La Gabarra del Caribe",
    description: "Colapso confirmado + personas desaparecidas.",
    state: "La Guaira",
    city: "Caraballeda",
    address: "Caraballeda",
    latitude: 10.6188,
    longitude: -66.8531,
    severity: "collapsed",
  },
  {
    id: "pr-03",
    zone: "caraballeda",
    title: "Residencias Mar de Leva",
    description: "Colapso confirmado.",
    state: "La Guaira",
    city: "Caraballeda",
    address: "Caraballeda",
    latitude: 10.618,
    longitude: -66.8537,
    severity: "collapsed",
  },
  {
    id: "pr-04",
    zone: "caraballeda",
    title: "Residencias Vista al Mar",
    description: "Colapso confirmado.",
    state: "La Guaira",
    city: "Caraballeda",
    address: "Caraballeda",
    latitude: 10.6187,
    longitude: -66.8486,
    severity: "collapsed",
  },
  {
    id: "pr-05",
    zone: "caraballeda",
    title: "Apartamentos Club Bahía Mar",
    description: "Colapso confirmado.",
    state: "La Guaira",
    city: "Caraballeda",
    address: "Caraballeda",
    latitude: 10.6179,
    longitude: -66.8544,
    severity: "collapsed",
  },
  {
    id: "pr-06",
    zone: "catia-maiquetia",
    title: "Edificio Cambural",
    description: "Familia Ramírez atrapada (madre e hijo). La Guaira.",
    state: "La Guaira",
    city: "La Guaira",
    address: "Edificio Cambural, La Guaira",
    latitude: 10.6094,
    longitude: -67.0138,
    severity: "collapsed",
  },
  {
    id: "pr-07",
    zone: "catia-maiquetia",
    title: "Conjunto Residencial Belo Horizonte",
    description: "Múltiples familias desaparecidas (Playa Grande).",
    state: "La Guaira",
    city: "Catia La Mar",
    address: "Playa Grande, Catia La Mar",
    latitude: 10.6094,
    longitude: -67.027,
    severity: "collapsed",
  },
  {
    id: "pr-08",
    zone: "catia-maiquetia",
    title: "Hotel Eduard",
    description: "Colapso confirmado (ocurrió durante un juego de béisbol).",
    state: "La Guaira",
    city: "Maiquetía",
    address: "Maiquetía",
    latitude: 10.5998,
    longitude: -67.0413,
    severity: "collapsed",
  },
  {
    id: "pr-09",
    zone: "catia-maiquetia",
    title: "Hotel Chipi",
    description: "Colapso confirmado, adyacente al Edificio Cambural.",
    state: "La Guaira",
    city: "La Guaira",
    address: "Junto al Edificio Cambural, La Guaira",
    latitude: 10.608,
    longitude: -67.01,
    severity: "collapsed",
  },
  {
    id: "pr-10",
    zone: "caracas",
    title: "Edificio San Judas Tadeo",
    description: "9 personas por rescatar (reporte del 25/6 a las 01:23).",
    state: "Distrito Capital",
    city: "Caracas",
    address: "Caracas",
    latitude: 10.4854,
    longitude: -66.9488,
    severity: "collapsed",
  },
  {
    id: "pr-11",
    zone: "caracas",
    title: "Edificio frente a Altamira Suites",
    description: "3 víctimas reportadas.",
    state: "Miranda",
    city: "Caracas",
    address: "Frente a Altamira Suites",
    latitude: 10.4929,
    longitude: -66.848,
    severity: "damaged",
  },
  {
    id: "pr-12",
    zone: "interior",
    title: "Conjunto Bosque Lindo — Torre 4",
    description: "Torre 4 colapsada, fatalidades familiares. Turmero.",
    state: "Aragua",
    city: "Turmero",
    address: "Conjunto Bosque Lindo, Turmero",
    latitude: 10.2325,
    longitude: -67.4805,
    severity: "collapsed",
  },
  {
    id: "pr-13",
    zone: "interior",
    title: "Hotel La Mar Suites",
    description: "Personas desaparecidas reportadas. Tucacas.",
    state: "Falcón",
    city: "Tucacas",
    address: "Tucacas",
    latitude: 10.2768,
    longitude: -67.9192,
    severity: "collapsed",
  },
  {
    id: "pr-14",
    zone: "institutions",
    title: "Universidad Marítima del Caribe (UMEC)",
    description:
      "Estudiantes sin contacto desde las 14:28 del 24 de junio. Catia La Mar.",
    state: "La Guaira",
    city: "Catia La Mar",
    address: "Universidad Marítima del Caribe, Catia La Mar",
    latitude: 10.6036,
    longitude: -67.0389,
    severity: "damaged",
  },
  {
    id: "pr-15",
    zone: "institutions",
    title: "Academia Militar de la Armada Bolivariana",
    description:
      "Escuela Naval, sector Meseta — colapso confirmado. Catia La Mar.",
    state: "La Guaira",
    city: "Catia La Mar",
    address: "Escuela Naval, sector Meseta, Catia La Mar",
    latitude: 10.6045,
    longitude: -67.012,
    severity: "collapsed",
  },
];

export const PRIORITY_RESCUE_SITES: DamageReport[] = SITES.map((site) => ({
  id: `priority-${site.id}`,
  title: site.title,
  severity: site.severity,
  state: site.state,
  city: site.city,
  address: site.address,
  zone: site.zone,
  latitude: site.latitude,
  longitude: site.longitude,
  description: site.description,
  reporter_name: null,
  reporter_contact: null,
  source_name: PRIORITY_RESCUE_SOURCE_NAME,
  source_url: PRIORITY_RESCUE_SOURCE_URL,
  image_urls: [],
  external_reference: site.id,
  is_verified: true,
  is_active: true,
  created_at: PRIORITY_RESCUE_PUBLISHED_AT,
  updated_at: PRIORITY_RESCUE_PUBLISHED_AT,
  source_synced_at: PRIORITY_RESCUE_PUBLISHED_AT,
}));

export const PRIORITY_RESCUE_STATS = {
  structures: 13,
  zones: 5,
  victimsLabel: "30+",
};

export function getPrioritySitesByZone(zoneId: string): DamageReport[] {
  return PRIORITY_RESCUE_SITES.filter((site) => site.zone === zoneId);
}
