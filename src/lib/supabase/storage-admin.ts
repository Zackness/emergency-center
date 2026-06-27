import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "uploads";

function env(name: string): string {
  const fromMeta = (import.meta.env?.[name] as string | undefined) ?? "";
  const fromProcess =
    typeof process !== "undefined" ? (process.env[name] ?? "") : "";
  return (fromMeta || fromProcess).trim();
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(env("PUBLIC_SUPABASE_URL") && env("SUPABASE_SECRET_KEY"));
}

export function createStorageAdmin(): SupabaseClient {
  const url = env("PUBLIC_SUPABASE_URL");
  const secret = env("SUPABASE_SECRET_KEY");

  if (!url || !secret) {
    throw new Error(
      "Faltan PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY para Supabase Storage."
    );
  }

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sanitizeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export function storagePathFromPublicUrl(
  publicUrl: string,
  bucket = STORAGE_BUCKET
): string | null {
  try {
    const u = new URL(publicUrl);
    const marker = `/object/public/${bucket}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export function getPublicStorageUrl(path: string, bucket = STORAGE_BUCKET): string {
  const supabase = createStorageAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadToSupabaseStorage(
  file: File,
  subfolder: string,
  bucket = STORAGE_BUCKET
): Promise<string> {
  const supabase = createStorageAdmin();
  const safeName = sanitizeFilename(file.name) || `file-${Date.now()}`;
  const objectPath = `${subfolder}/${Date.now()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { data, error } = await supabase.storage.from(bucket).upload(objectPath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) throw new Error(error.message);
  if (!data?.path) throw new Error("No se recibió ruta del archivo subido");

  return getPublicStorageUrl(data.path, bucket);
}

export async function deleteFromSupabaseStorage(
  publicUrl: string,
  bucket = STORAGE_BUCKET
): Promise<{ deleted: boolean }> {
  const path = storagePathFromPublicUrl(publicUrl, bucket);
  if (!path) return { deleted: false };

  const supabase = createStorageAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
  return { deleted: true };
}

export async function listSupabaseStorageFiles(
  subfolder: string,
  bucket = STORAGE_BUCKET
): Promise<
  Array<{ name: string; size: number; url: string; lastModified: string | null }>
> {
  const supabase = createStorageAdmin();
  const { data, error } = await supabase.storage.from(bucket).list(subfolder, {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((entry) => entry.id)
    .map((entry) => {
      const path = `${subfolder}/${entry.name}`;
      return {
        name: entry.name,
        size: entry.metadata?.size ?? 0,
        url: getPublicStorageUrl(path, bucket),
        lastModified: entry.updated_at ?? entry.created_at ?? null,
      };
    });
}
