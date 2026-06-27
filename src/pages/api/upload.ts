import type { APIRoute } from "astro";
import {
  deleteFromSupabaseStorage,
  isSupabaseStorageConfigured,
  listSupabaseStorageFiles,
  uploadToSupabaseStorage,
} from "@/lib/supabase/storage-admin";
import { UPLOAD_RATE_LIMIT, guardPublicWrite } from "@/lib/api-security";
import { sanitizeUploadFolder, validateImageFile } from "@/lib/upload-validation";

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  const uploadSecret = import.meta.env.UPLOAD_SECRET ?? process.env.UPLOAD_SECRET;
  const auth = request.headers.get("authorization");
  if (!uploadSecret || auth !== `Bearer ${uploadSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isSupabaseStorageConfigured()) {
    return new Response(JSON.stringify({ error: "Supabase Storage not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const subfolder = sanitizeUploadFolder(url.searchParams.get("folder"));
    const files = await listSupabaseStorageFiles(subfolder);
    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "uploads:create",
    ...UPLOAD_RATE_LIMIT,
    maxBodyBytes: 10 * 1024 * 1024,
  });
  if (blocked) return blocked;

  if (!isSupabaseStorageConfigured()) {
    return new Response(JSON.stringify({ error: "Supabase Storage not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Archivo requerido (campo file)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validation = validateImageFile(file);
    if (!validation.ok) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subfolder = sanitizeUploadFolder(formData.get("folder") as string | null);
    const fileUrl = await uploadToSupabaseStorage(file, subfolder);

    return new Response(JSON.stringify({ url: fileUrl, folder: subfolder }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ url, request }) => {
  const uploadSecret = import.meta.env.UPLOAD_SECRET ?? process.env.UPLOAD_SECRET;
  const auth = request.headers.get("authorization");
  if (!uploadSecret || auth !== `Bearer ${uploadSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isSupabaseStorageConfigured()) {
    return new Response(JSON.stringify({ error: "Supabase Storage not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fileUrl = url.searchParams.get("url");
  if (!fileUrl) {
    return new Response(JSON.stringify({ error: "url requerida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await deleteFromSupabaseStorage(fileUrl);
    return new Response(JSON.stringify({ deleted: result.deleted }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
