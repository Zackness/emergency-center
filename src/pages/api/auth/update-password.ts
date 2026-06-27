import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth-center";
import { AUTH_RATE_LIMIT, guardRequest, readJsonBody } from "@/lib/api-security";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardRequest(request, {
    namespace: "auth:update-password",
    ...AUTH_RATE_LIMIT,
    maxBodyBytes: 4 * 1024,
  });
  if (blocked) return blocked;

  try {
    const user = await getSessionUser(request, cookies);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
    const password = String(body.password ?? "");

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient({ request, cookies });
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
