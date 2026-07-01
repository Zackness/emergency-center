import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { volunteerRegistrationSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "volunteers:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const parsed = parseBody(volunteerRegistrationSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { createVolunteerRegistration } = await import("@/lib/data");
    const data = parsed.data;

    await createVolunteerRegistration({
      name: data.name,
      city: data.city,
      state: data.state,
      profession: data.profession,
      specialty: data.specialty,
      vehicle: data.vehicle,
      availability: data.availability,
      phone: data.phone,
      email: data.email,
      location: data.location,
      notes: data.notes,
      help_center_id: data.help_center_id,
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
