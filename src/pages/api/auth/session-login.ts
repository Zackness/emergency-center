import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";
import { AUTH_RATE_LIMIT, guardRequest, readJsonBody } from "@/lib/api-security";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardRequest(request, {
    namespace: "auth:session-login",
    ...AUTH_RATE_LIMIT,
    maxBodyBytes: 16 * 1024,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, any>>(request, 16 * 1024);
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient({ request, cookies });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
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
