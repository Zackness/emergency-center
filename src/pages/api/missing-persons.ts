import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { missingPersonSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const { fetchMissingPersons, countMissingPersons } = await import("@/lib/data");

    const q = url.searchParams.get("q") ?? undefined;
    const state = url.searchParams.get("state") ?? undefined;
    const statusParam = url.searchParams.get("status");
    const status =
      statusParam === "missing" || statusParam === "found" || statusParam === "all"
        ? statusParam
        : "all";
    const parsedPage = Number(url.searchParams.get("page") ?? "1");
    const parsedLimit = Number(url.searchParams.get("limit") ?? "24");
    const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(100, Math.max(1, parsedLimit))
      : 24;

    const [items, total] = await Promise.all([
      fetchMissingPersons({ q, state, status, page, limit }),
      countMissingPersons({ q, state, status }),
    ]);

    return new Response(
      JSON.stringify({
        items,
        total,
        page,
        limit,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "missing-persons:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const parsed = parseBody(missingPersonSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { createMissingPerson } = await import("@/lib/data");
    const data = parsed.data;

    const result = await createMissingPerson({
      full_name: data.full_name,
      national_id: data.national_id,
      age: data.age,
      gender: data.gender,
      state: data.state,
      city: data.city,
      last_seen_location: data.last_seen_location,
      last_seen_at: data.last_seen_at,
      description: data.description,
      photo_url: data.photo_url,
      contact_name: data.contact_name,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      external_source_slug: data.external_source_slug,
      external_url: data.external_url,
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({
          duplicate: true,
          existing_id: result.existing_id,
          full_name: result.full_name,
          message: "Esta persona ya está registrada en nuestra base de datos.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
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
