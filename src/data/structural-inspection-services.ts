export type StructuralInspectionKind = "volunteer" | "company";

export interface StructuralInspectionService {
  id: string;
  name: string;
  handle: string;
  instagram_url: string;
  phone?: string;
  whatsapp?: string;
  website_url?: string;
  kind: StructuralInspectionKind;
  /** Empresas que también deben aparecer en la sección de voluntarios. */
  listAsVolunteer?: boolean;
  services: { es: string; en: string };
  coverage: { es: string; en: string };
  description: { es: string; en: string };
  is_verified: boolean;
  sort_order: number;
}

/** Inspecciones, evaluaciones y asesoría estructural gratuita tras el terremoto del 24-jun-2026. */
export const STRUCTURAL_INSPECTION_SERVICES: StructuralInspectionService[] = [
  {
    id: "fceunimet-directorio-estructural",
    name: "FCE UNIMET — Directorio estructural",
    handle: "@fceunimet",
    instagram_url: "https://www.instagram.com/fceunimet/",
    kind: "volunteer",
    services: {
      es: "Directorio de egresados en ingeniería civil (varias universidades) · inspección y orientación estructural",
      en: "Directory of civil engineering graduates (multiple universities) · structural inspection and guidance",
    },
    coverage: {
      es: "Nacional — consultas presenciales y remotas según disponibilidad",
      en: "Nationwide — on-site and remote consultations depending on availability",
    },
    description: {
      es: "La Facultad de Ciencias de la Educación / comunidad UNIMET publicó un directorio estructural con egresados de distintas universidades (ingenieros civiles) que ofrecen consultas gratuitas sobre daños en edificaciones. El listado completo con contactos directos está en Instagram @fceunimet.",
      en: "The UNIMET community published a structural directory of graduates from various universities (civil engineers) offering free consultations on building damage. The full list with direct contacts is on Instagram @fceunimet.",
    },
    is_verified: true,
    sort_order: 1,
  },
  {
    id: "sophystik2",
    name: "Sophystik — Evaluaciones estructurales",
    handle: "@sophystik2",
    instagram_url: "https://www.instagram.com/sophystik2/",
    kind: "volunteer",
    services: {
      es: "Evaluación estructural · reforzamiento · reparación",
      en: "Structural evaluation · reinforcement · repair",
    },
    coverage: {
      es: "Consultar disponibilidad por Instagram",
      en: "Check availability via Instagram",
    },
    description: {
      es: "Profesional que ofrece evaluaciones de estructuras dañadas, orientación sobre reforzamiento y reparación tras el sismo. Coordina casos por Instagram @sophystik2.",
      en: "Professional offering evaluations of damaged structures, guidance on reinforcement and repair after the earthquake. Coordinate via Instagram @sophystik2.",
    },
    is_verified: false,
    sort_order: 2,
  },
  {
    id: "somosmetra",
    name: "Somos Metra",
    handle: "@somosmetra",
    instagram_url: "https://www.instagram.com/somosmetra/",
    phone: "0424-9077426",
    whatsapp: "584249077426",
    kind: "volunteer",
    services: {
      es: "Orientación técnica estructural",
      en: "Structural technical guidance",
    },
    coverage: {
      es: "Nacional — contacto por Instagram o teléfono",
      en: "Nationwide — contact via Instagram or phone",
    },
    description: {
      es: "Equipo que brinda orientación sobre el estado de estructuras y próximos pasos tras el terremoto. Contacto por Instagram @somosmetra o al 0424-9077426.",
      en: "Team providing guidance on structural condition and next steps after the earthquake. Contact via Instagram @somosmetra or 0424-9077426.",
    },
    is_verified: false,
    sort_order: 3,
  },
  {
    id: "comca-ve",
    name: "COMCA",
    handle: "@comca_ve",
    instagram_url: "https://www.instagram.com/comca_ve/",
    kind: "volunteer",
    services: {
      es: "Evaluaciones presenciales en estructuras",
      en: "On-site structural evaluations",
    },
    coverage: {
      es: "Consultar zonas de cobertura por Instagram",
      en: "Check coverage areas via Instagram",
    },
    description: {
      es: "Brigada que realiza evaluaciones presenciales en edificaciones con daño visible. Solicita cita y comparte ubicación y fotos del daño por Instagram @comca_ve.",
      en: "Team performing on-site evaluations of buildings with visible damage. Request an appointment and share location and damage photos via Instagram @comca_ve.",
    },
    is_verified: false,
    sort_order: 4,
  },
  {
    id: "ingefalca",
    name: "Ingefalca",
    handle: "@ingefalca",
    instagram_url: "https://www.instagram.com/ingefalca/",
    kind: "volunteer",
    services: {
      es: "Inspecciones estructurales gratuitas",
      en: "Free structural inspections",
    },
    coverage: {
      es: "Consultar disponibilidad por Instagram",
      en: "Check availability via Instagram",
    },
    description: {
      es: "Ofrece inspecciones estructurales sin costo para viviendas y edificios con daño reportado tras el sismo. Contacto por Instagram @ingefalca.",
      en: "Offers free structural inspections for homes and buildings with reported damage after the earthquake. Contact via Instagram @ingefalca.",
    },
    is_verified: false,
    sort_order: 5,
  },
  {
    id: "constructora360-cima",
    name: "Cima — Constructora 360",
    handle: "@constructora360",
    instagram_url: "https://www.instagram.com/constructora360/",
    kind: "company",
    listAsVolunteer: true,
    services: {
      es: "Inspección gratuita de estructuras",
      en: "Free structural inspection",
    },
    coverage: {
      es: "Consultar cobertura por Instagram",
      en: "Check coverage via Instagram",
    },
    description: {
      es: "Constructora Cima (@constructora360) activó un servicio gratuito de inspección de estructuras para evaluar habitabilidad y daños visibles tras el terremoto.",
      en: "Cima construction company (@constructora360) activated a free structural inspection service to assess habitability and visible damage after the earthquake.",
    },
    is_verified: false,
    sort_order: 10,
  },
  {
    id: "materiales-el-bosque",
    name: "Materiales El Bosque",
    handle: "@materialeselbosque",
    instagram_url: "https://www.instagram.com/materialeselbosque/",
    kind: "company",
    listAsVolunteer: true,
    services: {
      es: "Evaluaciones estructurales gratuitas",
      en: "Free structural evaluations",
    },
    coverage: {
      es: "Consultar cobertura por Instagram",
      en: "Check coverage via Instagram",
    },
    description: {
      es: "Ferretería / materiales de construcción que ofrece evaluaciones estructurales gratuitas para apoyar a familias con edificaciones dañadas. Contacto @materialeselbosque.",
      en: "Hardware / building materials supplier offering free structural evaluations to support families with damaged buildings. Contact @materialeselbosque.",
    },
    is_verified: false,
    sort_order: 11,
  },
  {
    id: "ofisolis",
    name: "OfiSolis",
    handle: "@ofisolis",
    instagram_url: "https://www.instagram.com/ofisolis/",
    kind: "company",
    listAsVolunteer: true,
    services: {
      es: "Asesoría estructural en línea",
      en: "Online structural advisory",
    },
    coverage: {
      es: "Nacional — atención por web / Instagram",
      en: "Nationwide — support via web / Instagram",
    },
    description: {
      es: "Ofrece asesoría técnica sobre daños estructurales de forma remota (web). Ideal para una primera orientación antes de una visita presencial. @ofisolis.",
      en: "Offers remote (web) technical advisory on structural damage. Useful for initial guidance before an on-site visit. @ofisolis.",
    },
    is_verified: false,
    sort_order: 12,
  },
  {
    id: "grupoavila",
    name: "Grupo Ávila",
    handle: "@grupoavila.ve",
    instagram_url: "https://www.instagram.com/grupoavila.ve/",
    phone: "0424-1993167",
    whatsapp: "584241993167",
    kind: "company",
    listAsVolunteer: true,
    services: {
      es: "Inspecciones técnicas de habitabilidad",
      en: "Technical habitability inspections",
    },
    coverage: {
      es: "Caracas — Chacao, El Hatillo y Sucre",
      en: "Caracas — Chacao, El Hatillo and Sucre",
    },
    description: {
      es: "Grupo de ingenieros que realiza inspecciones técnicas gratuitas en Caracas (Chacao, El Hatillo, Sucre). Envía fotos del daño visible por WhatsApp 0424-1993167 o Instagram @grupoavila.ve antes de solicitar visita.",
      en: "Engineering group performing free technical inspections in Caracas (Chacao, El Hatillo, Sucre). Send photos of visible damage via WhatsApp 0424-1993167 or Instagram @grupoavila.ve before requesting a visit.",
    },
    is_verified: true,
    sort_order: 13,
  },
  {
    id: "athyco",
    name: "Athyco",
    handle: "@athyco.empresa",
    instagram_url: "https://www.instagram.com/athyco.empresa/",
    kind: "company",
    listAsVolunteer: true,
    services: {
      es: "Asesoría estructural y técnica",
      en: "Structural and technical advisory",
    },
    coverage: {
      es: "Caracas y La Guaira",
      en: "Caracas and La Guaira",
    },
    description: {
      es: "Empresa de ingeniería que ofrece asesoría sobre daños estructurales en Caracas y La Guaira tras el terremoto. Contacto @athyco.empresa.",
      en: "Engineering firm offering advisory on structural damage in Caracas and La Guaira after the earthquake. Contact @athyco.empresa.",
    },
    is_verified: false,
    sort_order: 14,
  },
  {
    id: "ascensores-climb",
    name: "Ascensores Climb",
    handle: "@ascensoresclimb",
    instagram_url: "https://www.instagram.com/ascensoresclimb/",
    kind: "company",
    services: {
      es: "Atención preventiva de ascensores en emergencia",
      en: "Preventive elevator emergency response",
    },
    coverage: {
      es: "Consultar cobertura por Instagram",
      en: "Check coverage via Instagram",
    },
    description: {
      es: "Departamento de atención preventiva para emergencias en ascensores: revisión y orientación cuando el sismo afectó sistemas de elevación en edificios. @ascensoresclimb.",
      en: "Preventive emergency department for elevators: inspection and guidance when the earthquake affected lift systems in buildings. @ascensoresclimb.",
    },
    is_verified: false,
    sort_order: 15,
  },
  {
    id: "grupocopovenca",
    name: "Grupo Copovenca",
    handle: "@grupocopovenca",
    instagram_url: "https://www.instagram.com/grupocopovenca/",
    kind: "company",
    listAsVolunteer: true,
    services: {
      es: "Recolección de escombros",
      en: "Debris removal",
    },
    coverage: {
      es: "Aragua",
      en: "Aragua state",
    },
    description: {
      es: "Empresa que ofrece recoger escombros en Aragua para facilitar labores de limpieza y acceso en zonas afectadas. Coordina por Instagram @grupocopovenca.",
      en: "Company offering debris collection in Aragua to support cleanup and access in affected areas. Coordinate via Instagram @grupocopovenca.",
    },
    is_verified: false,
    sort_order: 16,
  },
];

export function getStructuralInspectionServices() {
  return [...STRUCTURAL_INSPECTION_SERVICES].sort((a, b) => a.sort_order - b.sort_order);
}

export function getStructuralInspectionVolunteers() {
  return getStructuralInspectionServices().filter(
    (entry) => entry.kind === "volunteer" || entry.listAsVolunteer
  );
}

export function getStructuralInspectionCompanies() {
  return getStructuralInspectionServices().filter((entry) => entry.kind === "company");
}
