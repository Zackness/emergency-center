import type { AlliedPlatform } from "@/types";

export type { AlliedPlatform, AlliedPlatformColor } from "@/types";

/**
 * Plataformas aliadas de emergencia que consolidan o complementan
 * información de desaparecidos, ayuda y mapas de sismos.
 */
export const ALLIED_PLATFORMS: AlliedPlatform[] = [
  {
    domain: "hospitalesenvenezuela.com",
    url: "https://hospitalesenvenezuela.com",
    description: {
      es: "Busca por nombre o cédula si un familiar está ingresado en un hospital.",
      en: "Search by name or ID if a relative is admitted to a hospital.",
    },
    color: "blue",
  },
  {
    domain: "centroacopio.site",
    url: "https://centroacopio.site/",
    description: {
      es: "Red nacional de centros de acopio y voluntarios de delivery gratuito.",
      en: "National network of collection centers and free delivery volunteers.",
    },
    color: "yellow",
  },
  {
    domain: "vzlayuda.com",
    url: "https://vzlayuda.com",
    description: {
      es: "Encuentra o brinda ayuda cerca de ti. Sin cuentas, al instante.",
      en: "Find or offer help near you. No accounts needed, instantly.",
    },
    color: "yellow",
  },
  {
    domain: "terremotovenezuela.com",
    url: "https://terremotovenezuela.com",
    description: {
      es: "Mapa de daños: edificios afectados reportados por la comunidad.",
      en: "Damage map: community-reported affected buildings.",
    },
    color: "red",
  },
  {
    domain: "habitable.lovable.app",
    url: "https://habitable.lovable.app/",
    description: {
      es: "Ingenieros por Venezuela: registro de ingenieros voluntarios e inspección de edificios dañados.",
      en: "Ingenieros por Venezuela: volunteer engineer registration and damaged building inspections.",
    },
    color: "blue",
  },
  {
    domain: "interp-aid.lovable.app",
    url: "https://interp-aid.lovable.app/",
    description: {
      es: "Red de intérpretes voluntarios: conecta traductores con brigadas de rescate internacionales.",
      en: "Volunteer interpreter network: connects translators with international rescue brigades.",
    },
    color: "blue",
  },
  {
    domain: "primeros-auxilios-psicologicos-ve.netlify.app",
    url: "https://primeros-auxilios-psicologicos-ve.netlify.app/",
    description: {
      es: "Protocolo de Primeros Auxilios Psicológicos (PAP): guía clínica para acompañar en crisis tras el terremoto.",
      en: "Psychological First Aid (PFA) protocol: clinical guide for crisis support after the earthquake.",
    },
    color: "blue",
  },
  {
    domain: "terremotovenezuela.app",
    url: "https://terremotovenezuela.app",
    description: {
      es: "Reportes, desaparecidos y mapa de emergencia.",
      en: "Reports, missing persons and emergency map.",
    },
    color: "blue",
  },
  {
    domain: "venezuelatebusca.com",
    url: "https://venezuelatebusca.com",
    description: {
      es: "Busca familiares o amigos desaparecidos.",
      en: "Search for missing family or friends.",
    },
    color: "yellow",
  },
  {
    domain: "encuentralos.tecnosoft.dev",
    url: "https://encuentralos.tecnosoft.dev/",
    description: {
      es: "Reporta y busca personas desaparecidas tras el terremoto.",
      en: "Report and search for missing persons after the earthquake.",
    },
    color: "yellow",
  },
  {
    domain: "huellascan.com",
    url: "https://www.huellascan.com/terremoto",
    description: {
      es: "Mascotas perdidas y encontradas tras el terremoto.",
      en: "Lost and found pets after the earthquake.",
    },
    color: "yellow",
  },
  {
    domain: "sismovenezuela.com",
    url: "https://sismovenezuela.com",
    description: {
      es: "Mapa de calor consolidando múltiples fuentes.",
      en: "Heat map consolidating multiple sources.",
    },
    color: "red",
  },
  {
    domain: "venezuelareporta.org",
    url: "https://venezuelareporta.org",
    description: {
      es: "Registro y consulta de personas desaparecidas.",
      en: "Registry and lookup of missing persons.",
    },
    color: "red",
  },
  {
    domain: "desaparecidosterremotovenezuela.com",
    url: "https://desaparecidosterremotovenezuela.com",
    description: {
      es: "Directorio de desaparecidos tras el terremoto.",
      en: "Directory of missing persons after the earthquake.",
    },
    color: "blue",
  },
  {
    domain: "ayudavenezuela.app",
    url: "https://ayudavenezuela.app",
    description: {
      es: "Coordinación de ayuda y emergencias.",
      en: "Aid and emergency coordination.",
    },
    color: "yellow",
  },
  {
    domain: "ayudasismo.org",
    url: "https://ayudasismo.org",
    description: {
      es: "Ayuda y coordinación ante sismos.",
      en: "Earthquake aid and coordination.",
    },
    color: "red",
  },
];
