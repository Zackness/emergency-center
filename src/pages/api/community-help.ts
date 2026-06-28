import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";

export const prerender = false;

const VALID_KINDS = new Set(["offer", "request"]);
const VALID_CATEGORIES = new Set([
  "estructural",
  "salud",
  "transporte",
  "oficios",
  "alimentos",
  "alojamiento",
  "negocio",
  "exterior",
  "mascotas",
  "comunicacion",
  "materiales",
]);

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "community-help:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const kind = body.kind;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const state = typeof body.state === "string" ? body.state.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const contactName = typeof body.contact_name === "string" ? body.contact_name.trim() : "";
    const contactPhone = typeof body.contact_phone === "string" ? body.contact_phone.trim() : "";

    if (!VALID_KINDS.has(kind as string)) {
      return json({ error: "Invalid kind" }, 400);
    }
    if (!title || !state || !city || !contactName || !contactPhone) {
      return json({ error: "Missing required fields" }, 400);
    }

    const category =
      typeof body.category === "string" && VALID_CATEGORIES.has(body.category)
        ? body.category
        : null;
    const description =
      typeof body.description === "string" ? body.description.trim().slice(0, 280) : null;
    const zone = typeof body.zone === "string" ? body.zone.trim().slice(0, 120) : null;

    const { isDatabaseConfigured } = await import("@/lib/prisma");
    if (!isDatabaseConfigured()) {
      return json({ error: "Database not configured" }, 503);
    }

    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.communityHelpPost.create({
      data: {
        kind: kind as "offer" | "request",
        title: title.slice(0, 60),
        description,
        category,
        state,
        city,
        zone,
        contactName,
        contactPhone,
      },
    });

    return json(
      {
        success: true,
        id: row.id,
        vzlayudaUrl: "https://vzlayuda.com/publicar",
      },
      201
    );
  } catch {
    return json({ error: "Internal server error" }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
