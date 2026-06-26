import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const { fetchMissingPersons, countMissingPersons } = await import("@/lib/data");

    const q = url.searchParams.get("q") ?? undefined;
    const state = url.searchParams.get("state") ?? undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "24");

    const [items, total] = await Promise.all([
      fetchMissingPersons({ q, state, page, limit }),
      countMissingPersons({ q, state }),
    ]);

    return new Response(
      JSON.stringify({
        items,
        total,
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
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
  try {
    const body = await request.json();
    const { createMissingPerson } = await import("@/lib/data");

    const required = [
      "full_name",
      "state",
      "city",
      "contact_name",
      "contact_phone",
    ];
    for (const field of required) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing field: ${field}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const result = await createMissingPerson({
      full_name: body.full_name,
      age: body.age ? Number(body.age) : null,
      gender: body.gender ?? null,
      state: body.state,
      city: body.city,
      last_seen_location: body.last_seen_location ?? null,
      last_seen_at: body.last_seen_at ?? null,
      description: body.description ?? null,
      photo_url: body.photo_url ?? null,
      contact_name: body.contact_name,
      contact_phone: body.contact_phone,
      contact_email: body.contact_email ?? null,
      external_source_slug: body.external_source_slug ?? null,
      external_url: body.external_url ?? null,
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
