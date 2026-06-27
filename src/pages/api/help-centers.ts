import type { APIRoute } from "astro";
import type { HelpCenterRegistration, HelpCenterType } from "@/types";
import { PUBLIC_FORM_RATE_LIMIT, guardRequest, readJsonBody } from "@/lib/api-security";

export const prerender = false;

const ACCEPT_KEYS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;
const TYPE_KEYS: HelpCenterType[] = ["church", "community", "university", "government", "ngo"];

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardRequest(request, {
    namespace: "help-centers:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<HelpCenterRegistration>(request);

    if (body.registration_type !== "own" && body.registration_type !== "third_party") {
      return badRequest("registration_type must be own or third_party");
    }

    const required = ["name", "state", "city", "address", "type"] as const;
    for (const field of required) {
      if (!body[field]) return badRequest(`Missing field: ${field}`);
    }

    if (!TYPE_KEYS.includes(body.type)) {
      return badRequest("Invalid center type");
    }

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return badRequest("Invalid coordinates");
    }

    if (!Array.isArray(body.accepts) || body.accepts.length === 0) {
      return badRequest("Select at least one accepted donation type");
    }

    const accepts = body.accepts.filter((item) =>
      ACCEPT_KEYS.includes(item as (typeof ACCEPT_KEYS)[number])
    );
    if (!accepts.length) return badRequest("Invalid accepts values");

    const imageUrl = body.image_url?.trim();
    if (!imageUrl) {
      return badRequest("Missing field: image_url");
    }

    if (body.registration_type === "third_party") {
      if (!body.reporter_name?.trim()) {
        return badRequest("Missing field: reporter_name");
      }
    }

    let ownerUserId: string | null = null;

    if (body.registration_type === "own") {
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
        registration_type: body.registration_type,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        type: body.type,
        state: body.state.trim(),
        city: body.city.trim(),
        address: body.address.trim(),
        latitude,
        longitude,
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        schedule: body.schedule?.trim() || null,
        accepts,
        reporter_name: body.reporter_name?.trim() || null,
        reporter_phone: body.reporter_phone?.trim() || null,
        image_url: imageUrl,
      },
      ownerUserId
    );

    return new Response(
      JSON.stringify({
        success: true,
        id: center.id,
        registration_type: body.registration_type,
        panel_url: body.registration_type === "own" ? "/centros-ayuda/panel" : null,
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
