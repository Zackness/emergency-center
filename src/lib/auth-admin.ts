import type { AstroCookies } from "astro";
import { getSessionUser, getUserRole } from "@/lib/auth-center";

export async function requireAdmin(request: Request, cookies: AstroCookies) {
  const user = await getSessionUser(request, cookies);
  if (!user) return { ok: false as const, status: 401 as const, user: null };

  const role = await getUserRole(user.id);
  if (role !== "admin") return { ok: false as const, status: 403 as const, user };

  return { ok: true as const, user };
}
