export type RoadmapFeatureStatus = "in_progress" | "planned" | "shipped";

export type RoadmapFeatureCategory =
  | "missing"
  | "help_centers"
  | "maps"
  | "volunteers"
  | "infrastructure"
  | "community";

export interface RoadmapFeature {
  id: string;
  status: RoadmapFeatureStatus;
  category: RoadmapFeatureCategory;
  /** 0–100, solo para in_progress. */
  progress?: number;
  title: { es: string; en: string };
  description: { es: string; en: string };
  href?: string;
}

export const ROADMAP_FEATURES: RoadmapFeature[] = [
  {
    id: "missing-hub",
    status: "in_progress",
    category: "missing",
    progress: 85,
    title: {
      es: "Hub unificado de desaparecidos",
      en: "Unified missing persons hub",
    },
    description: {
      es: "Consolidación y deduplicación de registros desde Venezuela Te Busca, Encuéntralos y otras fuentes.",
      en: "Consolidation and deduplication from Venezuela Te Busca, Encuéntralos and other sources.",
    },
    href: "/desaparecidos",
  },
  {
    id: "center-dashboard",
    status: "in_progress",
    category: "help_centers",
    progress: 75,
    title: {
      es: "Panel de centros de acopio",
      en: "Collection center dashboard",
    },
    description: {
      es: "Gestión de voluntarios e inventario de suministros para coordinadores de centros.",
      en: "Volunteer and supply inventory management for center coordinators.",
    },
    href: "/centros-ayuda/panel",
  },
  {
    id: "bunny-uploads",
    status: "in_progress",
    category: "infrastructure",
    progress: 70,
    title: {
      es: "Subida de fotos (Bunny.net)",
      en: "Photo uploads (Bunny.net)",
    },
    description: {
      es: "Carga de imágenes para reportes de desaparecidos y otros formularios.",
      en: "Image uploads for missing person reports and other forms.",
    },
  },
  {
    id: "damage-map",
    status: "done",
    category: "maps",
    progress: 100,
    title: {
      es: "Mapa de daños colaborativo",
      en: "Collaborative damage map",
    },
    description: {
      es: "Reportes ciudadanos de edificios afectados con mapa interactivo.",
      en: "Citizen reports of affected buildings with an interactive map.",
    },
    href: "/danos",
  },
  {
    id: "allied-platforms",
    status: "in_progress",
    category: "community",
    progress: 90,
    title: {
      es: "Plataformas aliadas",
      en: "Allied platforms",
    },
    description: {
      es: "Directorio de iniciativas ciudadanas que complementan la respuesta de emergencia.",
      en: "Directory of citizen-led initiatives that complement the emergency response.",
    },
  },
  {
    id: "news-fact-check",
    status: "shipped",
    category: "community",
    title: {
      es: "Verificación comunitaria de noticias",
      en: "Community news fact-checking",
    },
    description: {
      es: "Publicar noticias y votar si parecen ciertas o falsas para estimar credibilidad colectiva.",
      en: "Publish news and vote whether items seem true or false to estimate collective credibility.",
    },
    href: "/noticias",
  },
  {
    id: "auto-sync",
    status: "planned",
    category: "missing",
    title: {
      es: "Sincronización automática programada",
      en: "Scheduled automatic sync",
    },
    description: {
      es: "Actualización periódica de fuentes externas de desaparecidos sin intervención manual.",
      en: "Periodic updates of external missing persons sources without manual intervention.",
    },
  },
  {
    id: "pwa-offline",
    status: "planned",
    category: "infrastructure",
    title: {
      es: "Modo offline mejorado (PWA)",
      en: "Enhanced offline mode (PWA)",
    },
    description: {
      es: "Acceso a centros de ayuda, refugios y números de emergencia sin conexión.",
      en: "Access to help centers, shelters and emergency numbers without connectivity.",
    },
  },
  {
    id: "alerts",
    status: "planned",
    category: "community",
    title: {
      es: "Alertas por WhatsApp / SMS",
      en: "WhatsApp / SMS alerts",
    },
    description: {
      es: "Notificaciones cuando se localiza una persona o hay actualizaciones en tu zona.",
      en: "Notifications when a person is located or there are updates in your area.",
    },
  },
  {
    id: "public-metrics",
    status: "planned",
    category: "infrastructure",
    title: {
      es: "Métricas públicas en tiempo real",
      en: "Real-time public metrics",
    },
    description: {
      es: "Panel abierto con estadísticas de donaciones, voluntarios y reportes por estado.",
      en: "Open dashboard with donation, volunteer and report stats by state.",
    },
  },
  {
    id: "solidarity-companies",
    status: "shipped",
    category: "help_centers",
    title: {
      es: "Empresas solidarias",
      en: "Solidarity companies",
    },
    description: {
      es: "Directorio de empresas que ofrecen transporte, medicinas, alimentos y más.",
      en: "Directory of companies offering transport, medicine, food and more.",
    },
    href: "/empresas",
  },
  {
    id: "global-search",
    status: "shipped",
    category: "infrastructure",
    title: {
      es: "Búsqueda global",
      en: "Global search",
    },
    description: {
      es: "Encuentra centros, refugios, guías y recursos desde cualquier página.",
      en: "Find centers, shelters, guides and resources from any page.",
    },
    href: "/buscar",
  },
  {
    id: "volunteer-registry",
    status: "shipped",
    category: "volunteers",
    title: {
      es: "Registro de voluntarios",
      en: "Volunteer registration",
    },
    description: {
      es: "Formulario para ofrecer ayuda profesional o logística por estado y ciudad.",
      en: "Form to offer professional or logistical help by state and city.",
    },
    href: "/voluntarios",
  },
];

export function getRoadmapFeaturesByStatus(status: RoadmapFeatureStatus) {
  return ROADMAP_FEATURES.filter((f) => f.status === status);
}
