import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "companies:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, any>>(request);
    const { createCompanyRegistration } = await import("@/lib/data");

    const required = [
      "companyName",
      "contactName",
      "phone",
      "email",
      "state",
      "city",
      "resources",
    ];
    for (const field of required) {
      if (!body[field] || (field === "resources" && !body.resources?.length)) {
        return new Response(
          JSON.stringify({ error: `Missing field: ${field}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    await createCompanyRegistration({
      companyName: body.companyName,
      contactName: body.contactName,
      phone: body.phone,
      email: body.email,
      state: body.state,
      city: body.city,
      resources: body.resources,
      description: body.description ?? null,
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
