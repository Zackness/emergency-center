import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { companyRegistrationSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "companies:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const parsed = parseBody(companyRegistrationSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { createCompanyRegistration } = await import("@/lib/data");
    const data = parsed.data;

    await createCompanyRegistration({
      companyName: data.companyName,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      state: data.state,
      city: data.city,
      resources: data.resources,
      description: data.description,
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
