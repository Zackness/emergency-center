import type { APIRoute } from "astro";

export const prerender = false;
import { createClient } from "@/lib/supabase/server";

function safeRedirectPath(value: FormDataEntryValue | null, fallback: string): string {
  const path = String(value ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createClient({ request, cookies });
  await supabase.auth.signOut();

  const formData = await request.formData();
  const redirectTo = safeRedirectPath(formData.get("redirect"), "/admin");

  return redirect(redirectTo);
};
