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
    id: "supabase-uploads",
    status: "shipped",
    category: "infrastructure",
    progress: 100,
    title: {
      es: "Subida de fotos (Supabase Storage)",
      en: "Photo uploads (Supabase Storage)",
    },
    description: {
      es: "Carga de imágenes para reportes, centros de acopio e inventario.",
      en: "Image uploads for reports, help centers, and inventory.",
    },
  },
  {
    id: "damage-map",
    status: "shipped",
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
    status: "shipped",
    category: "community",
    progress: 100,
    title: {
      es: "Plataformas aliadas",
      en: "Allied platforms",
    },
    description: {
      es: "Directorio en BD con scraping unificado: DonarSeguro, Yummy SOS, VzlaAyuda, HuellasCAN, Red Ayuda y más.",
      en: "DB-backed directory with unified scraping: DonarSeguro, Yummy SOS, VzlaAyuda, HuellasCAN, Red Ayuda and more.",
    },
    href: "/recursos",
  },
  {
    id: "public-api",
    status: "shipped",
    category: "infrastructure",
    title: {
      es: "API pública v1 para desarrolladores",
      en: "Public API v1 for developers",
    },
    description: {
      es: "Endpoints REST de lectura (acopios, desaparecidos, daños, mascotas, aliadas) con CORS, rate limit y documentación en /api-docs.",
      en: "Read-only REST endpoints (help centers, missing persons, damage, pets, allied data) with CORS, rate limits and docs at /api-docs.",
    },
    href: "/api-docs",
  },
  {
    id: "allied-scrapers-db",
    status: "shipped",
    category: "infrastructure",
    title: {
      es: "Scraping aliado → base de datos",
      en: "Allied scraping → database",
    },
    description: {
      es: "Snapshots scrapeados en data_cache y tablas relacionales; nuevas plataformas aliadas se incorporan al orquestador sync:allied-scrapers.",
      en: "Scraped snapshots in data_cache and relational tables; new allied platforms plug into the sync:allied-scrapers orchestrator.",
    },
  },
  {
    id: "form-sanitization",
    status: "shipped",
    category: "infrastructure",
    title: {
      es: "Formularios sanitizados (Zod)",
      en: "Sanitized forms (Zod)",
    },
    description: {
      es: "Validación y limpieza de entradas en reportes, voluntarios, noticias, centros de acopio y sugerencias.",
      en: "Input validation and sanitization for reports, volunteers, news, help centers and suggestions.",
    },
  },
  {
    id: "auto-sync",
    status: "shipped",
    category: "infrastructure",
    title: {
      es: "Sincronización automática (GitHub Actions)",
      en: "Automatic sync (GitHub Actions)",
    },
    description: {
      es: "Workflow programado cada 8 h (scrapers) y diario (sync completo) sin depender de cron en Vercel.",
      en: "Scheduled workflow every 8 h (scrapers) and daily (full sync) without Vercel cron.",
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
