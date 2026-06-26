export interface PsychologicalSupportResource {
  id: string;
  name: string;
  description: { es: string; en: string };
  phone?: string;
  website_url?: string;
  instagram_url?: string;
  handle?: string;
  is_verified: boolean;
  sort_order: number;
}

export const PSYCHOLOGICAL_SUPPORT_RESOURCES: PsychologicalSupportResource[] = [
  {
    id: "pap-gilmer-pinto",
    name: "Protocolo PAP — Red de Apoyo Psicoemocional",
    description: {
      es: "Guía clínica de primeros auxilios psicológicos para usar mientras acompañas a alguien tras el terremoto. Incluye pasos del protocolo, respiración 4-4-6 y ejercicios de enraizamiento. ByGilmerPinto®.",
      en: "Clinical psychological first aid guide to use while supporting someone after the earthquake. Includes protocol steps, 4-4-6 breathing and grounding exercises. ByGilmerPinto®.",
    },
    website_url: "https://primeros-auxilios-psicologicos-ve.netlify.app/",
    is_verified: false,
    sort_order: 0,
  },
  {
    id: "fceunimet",
    name: "FCE UNIMET — Psicólogos egresados",
    description: {
      es: "Consultas y orientación psicológica gratuita con egresados de la Universidad Metropolitana (UNIMET). Contacto y actualizaciones por Instagram: @fceunimet.",
      en: "Free psychological guidance and consultations with Universidad Metropolitana (UNIMET) alumni. Contact and updates via Instagram: @fceunimet.",
    },
    instagram_url: "https://www.instagram.com/fceunimet/",
    handle: "@fceunimet",
    is_verified: true,
    sort_order: 1,
  },
  {
    id: "fpv-lapsi",
    name: "Federación de Psicólogos de Venezuela — LAPSI",
    description: {
      es: "Primeros auxilios psicológicos, intervención en crisis, orientación y apoyo emocional por vía telefónica.",
      en: "Psychological first aid, crisis intervention, guidance and emotional support by phone.",
    },
    phone: "0424-2907338",
    website_url: "https://fpv.org.ve/servicios/",
    is_verified: true,
    sort_order: 2,
  },
  {
    id: "psicologos-sin-fronteras",
    name: "Psicólogos Sin Fronteras",
    description: {
      es: "Línea de apoyo psicológico y contención emocional para personas afectadas por la emergencia.",
      en: "Psychological support and emotional containment line for people affected by the emergency.",
    },
    phone: "0412-9270304",
    is_verified: true,
    sort_order: 3,
  },
  {
    id: "rehabilitarte",
    name: "Rehabilitarte",
    description: {
      es: "Atención de contención emocional y apoyo psicológico durante la emergencia.",
      en: "Emotional containment and psychological support during the emergency.",
    },
    phone: "0424-6115506",
    is_verified: true,
    sort_order: 4,
  },
];

export function getPsychologicalSupportResources() {
  return [...PSYCHOLOGICAL_SUPPORT_RESOURCES].sort((a, b) => a.sort_order - b.sort_order);
}
