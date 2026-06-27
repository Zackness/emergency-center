import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";
import { AUTH_RATE_LIMIT, guardRequest, readJsonBody } from "@/lib/api-security";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardRequest(request, {
    namespace: "auth:verify-otp",
    ...AUTH_RATE_LIMIT,
    maxBodyBytes: 4 * 1024,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
    const email = String(body.email ?? "").trim().toLowerCase();
    const token = String(body.token ?? "").trim();
    const type = body.type === "email" ? "email" : "signup";

    if (!email || token.length < 6) {
      return new Response(JSON.stringify({ error: "Email and verification code are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient({ request, cookies });
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await supabase.auth.signOut();

    return new Response(JSON.stringify({ success: true, verified: true }), {
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
