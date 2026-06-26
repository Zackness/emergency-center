import type { APIRoute } from "astro";

export const prerender = false;
import { createClient } from "@/lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createClient({ request, cookies });
  await supabase.auth.signOut();
  return redirect("/admin");
};
