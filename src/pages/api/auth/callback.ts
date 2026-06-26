import type { APIRoute } from "astro";

export const prerender = false;
import { createClient } from "@/lib/supabase/server";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (!code) {
    return redirect("/admin?error=missing_code");
  }

  const supabase = createClient({ request, cookies });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  return redirect(next);
};
