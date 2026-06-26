import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";
import { AUTH_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "auth:signup",
    ...AUTH_RATE_LIMIT,
    maxBodyBytes: 16 * 1024,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, any>>(request, 16 * 1024);
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const fullName = String(body.full_name ?? body.fullName ?? "").trim();

    if (!email || !password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Email and password (min 8 chars) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient({ request, cookies });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email },
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: data.user
          ? { id: data.user.id, email: data.user.email }
          : null,
        session: Boolean(data.session),
        needs_confirmation: !data.session,
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
