import type { APIRoute } from "astro";
import { readJsonBody } from "@/lib/api-security";
import { requireAdmin } from "@/lib/auth-admin";
import { deactivateAlliedPlatform, updateAlliedPlatform } from "@/lib/allied-platforms/service";
import { parseAlliedPlatformInput } from "@/lib/allied-platforms/utils";
import { mapAlliedPlatform } from "@/lib/mappers";
import { isDatabaseConfigured } from "@/lib/prisma";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const auth = await requireAdmin(request, cookies);
  if (!auth.ok) return json({ error: "Unauthorized" }, auth.status);

  if (!isDatabaseConfigured()) {
    return json({ error: "Database not configured" }, 503);
  }

  const id = params.id;
  if (!id) return json({ error: "Missing id" }, 400);

  try {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const parsed = parseAlliedPlatformInput({
      url: typeof body.url === "string" ? body.url : "https://example.com",
      description_es: typeof body.description_es === "string" ? body.description_es : "x",
      description_en: typeof body.description_en === "string" ? body.description_en : "x",
      ...body,
    });

    if (!parsed) return json({ error: "Invalid payload" }, 400);

    const row = await updateAlliedPlatform(id, {
      domain: typeof body.domain === "string" ? body.domain.trim() : parsed.domain,
      url: parsed.url,
      description_es: parsed.description_es,
      description_en: parsed.description_en,
      color: parsed.color,
      sort_order: parsed.sort_order,
      is_active: typeof body.is_active === "boolean" ? body.is_active : parsed.is_active,
    });

    return json({ item: mapAlliedPlatform(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("Unique constraint")) {
      return json({ error: "Ya existe una plataforma con ese dominio" }, 409);
    }
    if (message.includes("Record to update not found")) {
      return json({ error: "Not found" }, 404);
    }
    return json({ error: "Internal server error" }, 500);
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const auth = await requireAdmin(request, cookies);
  if (!auth.ok) return json({ error: "Unauthorized" }, auth.status);

  if (!isDatabaseConfigured()) {
    return json({ error: "Database not configured" }, 503);
  }

  const id = params.id;
  if (!id) return json({ error: "Missing id" }, 400);

  try {
    const row = await deactivateAlliedPlatform(id);
    return json({ item: mapAlliedPlatform(row) });
  } catch {
    return json({ error: "Not found" }, 404);
  }
};
