import type { APIRoute } from "astro";

export const prerender = false;
import { createClient } from "@/lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/admin";

  const supabase = createClient({ request, cookies });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const redirectBase = next.startsWith("/") ? next.split("?")[0] : "/admin";
    return redirect(`${redirectBase}?error=${encodeURIComponent(error.message)}`);
  }

  return redirect(next.startsWith("/") ? next : "/admin");
};
