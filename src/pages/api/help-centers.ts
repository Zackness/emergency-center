import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardRequest, readJsonBody } from "@/lib/api-security";
import { sanitizeHelpCenterAccepts } from "@/lib/help-centers/accepts";
import { helpCenterRegistrationSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardRequest(request, {
    namespace: "help-centers:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const parsed = parseBody(helpCenterRegistrationSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const data = parsed.data;
    const accepts = sanitizeHelpCenterAccepts(data.accepts);
    if (!accepts.length) {
      return validationErrorResponse("Tipos de donación inválidos");
    }

    let ownerUserId: string | null = null;

    if (data.registration_type === "own") {
      const { getSessionUser } = await import("@/lib/auth-center");
      const user = await getSessionUser(request, cookies);
      if (!user) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
            message: "Debes iniciar sesión para registrar tu centro de acopio.",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      ownerUserId = user.id;
    }

    const { createHelpCenterRegistration } = await import("@/lib/data");
    const center = await createHelpCenterRegistration(
      {
        registration_type: data.registration_type,
        name: data.name,
        description: data.description,
        type: data.type,
        state: data.state,
        city: data.city,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        schedule: data.schedule,
        accepts,
        reporter_name: data.reporter_name,
        reporter_phone: data.reporter_phone,
        image_url: data.image_url,
      },
      ownerUserId
    );

    return new Response(
      JSON.stringify({
        success: true,
        id: center.id,
        registration_type: data.registration_type,
        panel_url: data.registration_type === "own" ? "/centros-ayuda/panel" : null,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
