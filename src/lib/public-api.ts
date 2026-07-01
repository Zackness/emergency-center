import { rateLimit } from "@/lib/api-security";

export const PUBLIC_API_RATE_LIMIT = {
  namespace: "public-api:read",
  max: 120,
  windowMs: 10 * 60 * 1000,
};

export const PUBLIC_API_CACHE_SECONDS = 120;

const CORS_METHODS = "GET, OPTIONS";
const CORS_HEADERS = "Content-Type, Authorization, X-API-Key";

function parseAllowedOrigins(): string[] | "*" {
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_CORS_ORIGINS) ||
    process.env.PUBLIC_API_CORS_ORIGINS ||
    "*";
  if (raw === "*") return "*";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function resolveCorsOrigin(request: Request): string | null {
  const allowed = parseAllowedOrigins();
  const origin = request.headers.get("origin");
  if (!origin) return "*";
  if (allowed === "*") return origin;
  return allowed.includes(origin) ? origin : null;
}

export function publicApiCorsHeaders(request: Request): HeadersInit {
  const origin = resolveCorsOrigin(request);
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": CORS_METHODS,
    "Access-Control-Allow-Headers": CORS_HEADERS,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function guardPublicApiRead(request: Request): Response | null {
  if (request.method === "OPTIONS") return null;
  return rateLimit(request, PUBLIC_API_RATE_LIMIT);
}

export function publicApiJson(
  request: Request,
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${PUBLIC_API_CACHE_SECONDS}`,
      ...publicApiCorsHeaders(request),
      ...extraHeaders,
    },
  });
}

export function publicApiOptions(request: Request): Response {
  const cors = publicApiCorsHeaders(request);
  if (!Object.keys(cors).length) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(null, { status: 204, headers: cors });
}

export const PUBLIC_API_CATALOG = {
  version: "1.0",
  base_path: "/api/v1",
  description:
    "API pública de Emergency Center para integración con otras plataformas de ayuda humanitaria en Venezuela.",
  documentation: "/api-docs",
  rate_limit: "120 solicitudes / 10 min por IP",
  endpoints: [
    {
      path: "/api/v1/help-centers",
      method: "GET",
      description: "Catálogo de centros de acopio verificados",
      params: ["state", "city", "search", "page", "limit"],
    },
    {
      path: "/api/v1/hospitals",
      method: "GET",
      description: "Directorio hospitalario nacional",
      params: ["state", "status", "search"],
    },
    {
      path: "/api/v1/shelters",
      method: "GET",
      description: "Refugios y albergues",
      params: ["state", "search"],
    },
    {
      path: "/api/v1/agencies",
      method: "GET",
      description: "Organismos de emergencia (bomberos, cruz roja, etc.)",
      params: ["category"],
    },
    {
      path: "/api/v1/damage-reports",
      method: "GET",
      description: "Reportes de daños estructurales",
      params: ["search", "severity", "state", "limit", "offset"],
    },
    {
      path: "/api/v1/missing-persons",
      method: "GET",
      description: "Personas desaparecidas",
      params: ["q", "state", "status", "page", "limit"],
    },
    {
      path: "/api/v1/missing-pets",
      method: "GET",
      description: "Mascotas perdidas/encontradas",
      params: ["q", "status", "species", "state", "page", "limit"],
    },
    {
      path: "/api/v1/children-emergency",
      method: "GET",
      description: "Niños en situación de emergencia",
      params: ["q", "source", "health", "hospital", "page", "limit"],
    },
    {
      path: "/api/v1/news",
      method: "GET",
      description: "Noticias verificadas por la comunidad",
      params: ["sort"],
    },
    {
      path: "/api/v1/allied-platforms",
      method: "GET",
      description: "Plataformas aliadas activas",
    },
    {
      path: "/api/v1/map/catalog",
      method: "GET",
      description: "Marcadores unificados para mapas",
      params: ["lang", "zone", "search", "severity", "layers", "limit"],
    },
    {
      path: "/api/v1/emergency-numbers",
      method: "GET",
      description: "Números de emergencia oficiales",
    },
    {
      path: "/api/v1/external-links",
      method: "GET",
      description: "Enlaces externos por categoría",
      params: ["category"],
    },
    {
      path: "/api/v1/vzlayuda/avisos",
      method: "GET",
      description: "Ofertas y solicitudes de VzlaAyuda",
      params: ["q", "kind", "category", "state", "page", "limit"],
    },
    {
      path: "/api/v1/donarseguro",
      method: "GET",
      description: "Organizaciones verificadas para donar (DonarSeguro)",
      params: ["category", "q"],
    },
    {
      path: "/api/v1/yummyrides-sos",
      method: "GET",
      description: "Reportes de daño y centros de acopio Yummy SOS",
      params: ["kind"],
    },
    {
      path: "/api/v1/allied-data",
      method: "GET",
      description: "Snapshot scrapeado de una plataforma aliada (desde BD)",
      params: ["domain", "adapter"],
    },
    {
      path: "/api/v1/scrape-status",
      method: "GET",
      description: "Estado del último scraping de plataformas aliadas",
    },
  ],
} as const;
