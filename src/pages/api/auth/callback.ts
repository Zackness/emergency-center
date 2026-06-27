import type { APIRoute } from "astro";

export const prerender = false;
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"), "/admin");

  if (!code) {
    return redirect("/admin?error=missing_code");
  }

  const supabase = createClient({ request, cookies });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorTarget = next.startsWith("/admin")
      ? `/admin?error=${encodeURIComponent(error.message)}`
      : `${next.split("?")[0]}?error=${encodeURIComponent(error.message)}`;
    return redirect(errorTarget);
  }

  return redirect(next);
};
