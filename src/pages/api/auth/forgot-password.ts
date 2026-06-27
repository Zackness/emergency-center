import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";
import {
  adminResetPath,
  authCallbackUrl,
  coordinatorResetPath,
} from "@/lib/auth-urls";
import { AUTH_RATE_LIMIT, guardRequest, readJsonBody } from "@/lib/api-security";
import type { Locale } from "@/i18n/config";
import { isValidLocale } from "@/i18n/config";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const blocked = guardRequest(request, {
    namespace: "auth:forgot-password",
    ...AUTH_RATE_LIMIT,
    maxBodyBytes: 4 * 1024,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
    const email = String(body.email ?? "").trim().toLowerCase();
    const context = body.context === "admin" ? "admin" : "coordinator";
    const localeRaw = String(body.locale ?? "es");
    const locale: Locale = isValidLocale(localeRaw) ? localeRaw : "es";

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resetPath =
      context === "admin" ? adminResetPath() : coordinatorResetPath(locale);
    const redirectTo = authCallbackUrl(request, resetPath);

    const supabase = createClient({ request, cookies });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

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
