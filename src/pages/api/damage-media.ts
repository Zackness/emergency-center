import type { APIRoute } from "astro";
import { signTerremotoStoragePath } from "@/lib/damage-map/media-proxy";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const storagePath = url.searchParams.get("path")?.trim();
  if (!storagePath || storagePath.includes("..")) {
    return new Response(JSON.stringify({ error: "Invalid path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const signedUrl = await signTerremotoStoragePath(storagePath);
    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        "Cache-Control": "private, max-age=1800",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sign media URL";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};
