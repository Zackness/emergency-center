import { Buffer } from "node:buffer";

type BunnyConfig = {
  storageZoneName: string;
  apiKey: string;
  storageBaseUrl: string;
  publicBaseUrl: string;
};

/** Prefijo raíz en la Storage Zone (como `caleta/` en CALETAS, `blog/` en StartupVen). */
export const BUNNY_ROOT_FOLDER = "startupven-responde";

function env(name: string): string {
  const fromProcess =
    typeof process !== "undefined" ? (process.env[name] ?? "") : "";
  const fromMeta = (import.meta.env?.[name] as string | undefined) ?? "";
  return (fromProcess || fromMeta).trim();
}

/**
 * Variables soportadas (mismas que StartupVen / CALETAS):
 * - BUNNY_STORAGE_ZONE_NAME
 * - BUNNY_API_KEY | BUNNYCDN_API_KEY
 * - BUNNY_BASE_URL (default https://storage.bunnycdn.com)
 * - BUNNY_PUBLIC_BASE_URL (opcional; default https://{zone}.b-cdn.net)
 */
export function isBunnyConfigured(): boolean {
  try {
    getBunnyConfig();
    return true;
  } catch {
    return false;
  }
}

function getBunnyConfig(): BunnyConfig {
  const storageZoneName = (
    env("BUNNY_STORAGE_ZONE_NAME") || env("BUNNY_STORAGE_ZONE")
  ).trim();

  const apiKey = (
    env("BUNNY_API_KEY") ||
    env("BUNNYCDN_API_KEY") ||
    env("BUNNY_STORAGE_ACCESS_KEY")
  ).trim();

  const storageBaseUrl = (
    env("BUNNY_BASE_URL") ||
    env("BUNNY_STORAGE_BASE_URL") ||
    "https://storage.bunnycdn.com"
  ).trim();

  const publicBaseUrl = (
    env("BUNNY_PUBLIC_BASE_URL") ||
    (storageZoneName ? `https://${storageZoneName}.b-cdn.net` : "")
  ).trim();

  const missing: string[] = [];
  if (!storageZoneName) missing.push("BUNNY_STORAGE_ZONE_NAME");
  if (!apiKey) missing.push("BUNNY_API_KEY o BUNNYCDN_API_KEY");
  if (!storageBaseUrl) missing.push("BUNNY_BASE_URL");
  if (!publicBaseUrl) {
    missing.push("BUNNY_PUBLIC_BASE_URL (o BUNNY_STORAGE_ZONE_NAME para inferir el CDN)");
  }

  if (missing.length > 0) {
    throw new Error(`Configuración Bunny.net incompleta. Falta: ${missing.join(", ")}.`);
  }

  return { storageZoneName, apiKey, storageBaseUrl, publicBaseUrl };
}

function sanitizeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

function normalizePath(path: string) {
  return path.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

export function bunnyPublicUrlForPath(path: string) {
  const cfg = getBunnyConfig();
  return `${cfg.publicBaseUrl.replace(/\/+$/, "")}/${normalizePath(path)}`;
}

export function bunnyPathFromPublicUrl(url: string): string | null {
  try {
    const cfg = getBunnyConfig();
    const u = new URL(url);
    const publicBase = new URL(cfg.publicBaseUrl);
    if (u.host !== publicBase.host) return null;
    return normalizePath(u.pathname);
  } catch {
    return null;
  }
}

export async function bunnyUploadBytes(opts: {
  folder?: string;
  filename: string;
  bytes: Uint8Array;
  contentType?: string;
}) {
  const cfg = getBunnyConfig();
  const folder = normalizePath(opts.folder ?? `${BUNNY_ROOT_FOLDER}/uploads`);
  const safe = sanitizeFilename(opts.filename) || `file-${Date.now()}`;
  const key = normalizePath(`${folder}/${Date.now()}-${safe}`);

  const uploadUrl = `${cfg.storageBaseUrl.replace(/\/+$/, "")}/${cfg.storageZoneName}/${key}`;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      AccessKey: cfg.apiKey,
      "Content-Type": opts.contentType ?? "application/octet-stream",
    },
    body: Buffer.from(opts.bytes),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bunny upload failed (${res.status}): ${text}`);
  }

  return { path: key, url: bunnyPublicUrlForPath(key) };
}

/** Sube un File del navegador (patrón CALETAS `uploadToBunny`). */
export async function uploadToBunny(
  file: File,
  options: { subfolder?: string; prefix?: string } = {}
) {
  const prefix = normalizePath(options.prefix ?? BUNNY_ROOT_FOLDER);
  const subfolder = options.subfolder ? normalizePath(options.subfolder) : "";
  const folder = [prefix, subfolder].filter(Boolean).join("/");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await bunnyUploadBytes({
    folder,
    filename: file.name,
    bytes,
    contentType: file.type || "application/octet-stream",
  });

  return result.url;
}

export async function bunnyDeleteByPath(path: string) {
  const cfg = getBunnyConfig();
  const key = normalizePath(path);
  const deleteUrl = `${cfg.storageBaseUrl.replace(/\/+$/, "")}/${cfg.storageZoneName}/${key}`;

  const res = await fetch(deleteUrl, {
    method: "DELETE",
    headers: { AccessKey: cfg.apiKey },
  });

  if (res.status === 404) return { deleted: false };

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bunny delete failed (${res.status}): ${text}`);
  }

  return { deleted: true };
}

export async function bunnyDeleteByPublicUrl(publicUrl: string) {
  const path = bunnyPathFromPublicUrl(publicUrl);
  if (!path) return { deleted: false };
  return bunnyDeleteByPath(path);
}

export type BunnyStorageItem = {
  ObjectName: string;
  Path: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
  ContentType?: string;
};

export async function bunnyListFolder(folderPath = ""): Promise<BunnyStorageItem[]> {
  const cfg = getBunnyConfig();
  const clean = normalizePath(folderPath);
  const suffix = clean ? `${clean}/` : "";
  const listUrl = `${cfg.storageBaseUrl.replace(/\/+$/, "")}/${cfg.storageZoneName}/${suffix}`;

  const res = await fetch(listUrl, {
    method: "GET",
    headers: { AccessKey: cfg.apiKey, Accept: "application/json" },
  });

  if (res.status === 404) return [];

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bunny list failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as BunnyStorageItem[];
  return Array.isArray(data) ? data : [];
}

export async function listBunnyFiles(subfolder = "") {
  const folder = normalizePath(
    [BUNNY_ROOT_FOLDER, subfolder].filter(Boolean).join("/")
  );
  const entries = await bunnyListFolder(folder);
  const publicBase = getBunnyConfig().publicBaseUrl.replace(/\/+$/, "");

  return entries
    .filter((e) => !e.IsDirectory)
    .map((e) => {
      const relative = normalizePath(`${folder}/${e.ObjectName}`);
      return {
        name: e.ObjectName,
        size: e.Length,
        url: `${publicBase}/${relative}`,
        lastModified: e.LastChanged,
      };
    });
}
