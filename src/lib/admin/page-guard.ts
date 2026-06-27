import type { AstroGlobal } from "astro";
import { getProfileRole } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

type AstroAdminContext = Pick<AstroGlobal, "request" | "cookies" | "redirect" | "url">;

export async function requireAdminSession(Astro: AstroAdminContext) {
  const supabase = createClient({ request: Astro.request, cookies: Astro.cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent(Astro.url.pathname);
    return { user: null as null, redirect: Astro.redirect(`/admin?next=${next}`) };
  }

  const role = await getProfileRole(user.id);
  if (role !== "admin") {
    return { user: null as null, redirect: Astro.redirect("/admin?error=unauthorized") };
  }

  return { user, redirect: null as null };
}
