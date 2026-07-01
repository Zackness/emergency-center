import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { communityHelpSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "community-help:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const parsed = parseBody(communityHelpSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { isDatabaseConfigured } = await import("@/lib/prisma");
    if (!isDatabaseConfigured()) {
      return json({ error: "Database not configured" }, 503);
    }

    const data = parsed.data;
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.communityHelpPost.create({
      data: {
        kind: data.kind,
        title: data.title,
        description: data.description,
        category: data.category,
        state: data.state,
        city: data.city,
        zone: data.zone,
        contactName: data.contact_name,
        contactPhone: data.contact_phone,
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
