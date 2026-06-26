export type AlliedPlatformColor = "blue" | "yellow" | "red";

export interface AlliedPlatform {
  /** Dominio mostrado, sin protocolo. */
  domain: string;
  url: string;
  description: { es: string; en: string };
  /** Color del punto indicador (bandera de Venezuela). */
  color: AlliedPlatformColor;
}

/**
 * Plataformas aliadas de emergencia que consolidan o complementan
 * información de desaparecidos, ayuda y mapas de sismos.
 */
export const ALLIED_PLATFORMS: AlliedPlatform[] = [
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
