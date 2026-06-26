import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "volunteers:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, any>>(request);
    const { createVolunteerRegistration } = await import("@/lib/data");

    const required = ["name", "city", "state", "profession", "availability", "phone", "email"];
    for (const field of required) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing field: ${field}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    await createVolunteerRegistration({
      name: body.name,
      city: body.city,
      state: body.state,
      profession: body.profession,
      specialty: body.specialty ?? null,
      vehicle: body.vehicle ?? null,
      availability: body.availability,
      phone: body.phone,
      email: body.email,
      location: body.location ?? null,
      notes: body.notes ?? null,
      help_center_id: body.help_center_id ?? null,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
