import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { createFeatureSuggestion } = await import("@/lib/data");

    if (!body.title?.trim() || !body.description?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, description" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (body.title.length > 200 || body.description.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Title or description too long" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await createFeatureSuggestion({
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category?.trim() || null,
      contact_name: body.contact_name?.trim() || null,
      contact_email: body.contact_email?.trim() || null,
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
