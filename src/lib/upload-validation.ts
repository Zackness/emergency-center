const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_MB = 8;

export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!file.type.startsWith("image/") && !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, error: "Solo se permiten imágenes (JPEG, PNG, WebP, GIF)." };
  }

  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return { ok: false, error: `La imagen no puede superar ${MAX_IMAGE_MB} MB.` };
  }

  return { ok: true };
}

/** Carpetas permitidas bajo startupven-responde/ */
export const UPLOAD_FOLDERS = new Set([
  "missing-persons",
  "damage-reports",
  "help-centers",
  "media",
]);

export function sanitizeUploadFolder(folder: string | null | undefined): string {
  const clean = (folder ?? "media").trim().replace(/[^a-z0-9-_]/gi, "");
  return UPLOAD_FOLDERS.has(clean) ? clean : "media";
}
