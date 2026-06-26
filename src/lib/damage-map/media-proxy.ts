import { getTerremotoVzlaConfig } from "./adapter-config";

const PUBLIC_PREFIX = "/storage/v1/object/public/damage-media/";
const SIGNED_CACHE_TTL_MS = 50 * 60 * 1000;

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/** Detecta URLs del storage de terremotovenezuela.com (públicas o ya firmadas). */
export function isTerremotoDamageMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const { baseUrl } = getTerremotoVzlaConfig();
    return parsed.origin === new URL(baseUrl).origin && parsed.pathname.includes("/damage-media/");
  } catch {
    return false;
  }
}

/** Extrae la ruta interna del bucket, p. ej. `reports/uuid.jpg`. */
export function extractTerremotoStoragePath(url: string): string | null {
  try {
    const parsed = new URL(url);
    const publicIdx = parsed.pathname.indexOf(PUBLIC_PREFIX);
    if (publicIdx !== -1) {
      return decodeURIComponent(parsed.pathname.slice(publicIdx + PUBLIC_PREFIX.length));
    }
    const signMarker = "/storage/v1/object/sign/damage-media/";
    const signIdx = parsed.pathname.indexOf(signMarker);
    if (signIdx !== -1) {
      return decodeURIComponent(parsed.pathname.slice(signIdx + signMarker.length));
    }
    const damageIdx = parsed.pathname.indexOf("/damage-media/");
    if (damageIdx !== -1) {
      return decodeURIComponent(parsed.pathname.slice(damageIdx + "/damage-media/".length));
    }
    return null;
  } catch {
    return null;
  }
}

/** Convierte una URL del storage aliado en ruta de proxy local (para `<img src>`). */
export function proxiedDamageMediaUrl(url: string): string {
  if (!isTerremotoDamageMediaUrl(url)) return url;
  const path = extractTerremotoStoragePath(url);
  if (!path) return url;
  return `/api/damage-media?path=${encodeURIComponent(path)}`;
}

export function proxiedDamageMediaUrls(urls: string[] | null | undefined): string[] {
  if (!urls?.length) return [];
  return urls.map(proxiedDamageMediaUrl);
}

/** Firma una ruta del bucket privado de terremotovenezuela (con caché en memoria). */
export async function signTerremotoStoragePath(storagePath: string): Promise<string> {
  const normalized = storagePath.replace(/^\/+/, "");
  const cached = signedUrlCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const { baseUrl, apiKey } = getTerremotoVzlaConfig();
  const response = await fetch(
    `${baseUrl.replace(/\/+$/, "")}/storage/v1/object/sign/damage-media/${normalized}`,
    {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`No se pudo firmar imagen (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { signedURL?: string };
  if (!data.signedURL) {
    throw new Error("Respuesta de firma sin signedURL");
  }

  const signedUrl = data.signedURL.startsWith("http")
    ? data.signedURL
    : `${baseUrl.replace(/\/+$/, "")}/storage/v1${data.signedURL}`;

  signedUrlCache.set(normalized, {
    url: signedUrl,
    expiresAt: Date.now() + SIGNED_CACHE_TTL_MS,
  });

  return signedUrl;
}
