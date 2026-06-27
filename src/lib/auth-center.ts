import type { AstroCookies, AstroGlobal } from "astro";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { coordinatorAccesoPath } from "@/lib/auth-urls";
import type { Locale } from "@/i18n/config";
import { getLocaleFromPath, localePath } from "@/i18n/config";

export async function getSessionUser(request: Request, cookies: AstroCookies) {
  const supabase = createClient({ request, cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return profile?.role ?? null;
}

export async function getManagedHelpCenterIds(userId: string): Promise<string[]> {
  const role = await getUserRole(userId);
  if (role === "admin") {
    const centers = await prisma.helpCenter.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    return centers.map((c) => c.id);
  }

  const assignments = await prisma.helpCenterCoordinator.findMany({
    where: { profileId: userId },
    select: { helpCenterId: true },
  });
  return assignments.map((a) => a.helpCenterId);
}

export async function canManageHelpCenter(userId: string, helpCenterId: string) {
  const role = await getUserRole(userId);
  if (role === "admin") return true;

  const assignment = await prisma.helpCenterCoordinator.findUnique({
    where: {
      profileId_helpCenterId: { profileId: userId, helpCenterId },
    },
  });
  return Boolean(assignment);
}

export async function requireCenterAccess(
  request: Request,
  cookies: AstroCookies,
  helpCenterId: string
) {
  const user = await getSessionUser(request, cookies);
  if (!user) return { ok: false as const, status: 401 as const, user: null };

  const allowed = await canManageHelpCenter(user.id, helpCenterId);
  if (!allowed) return { ok: false as const, status: 403 as const, user };

  return { ok: true as const, user };
}

export function resolvePostLoginPath(url: URL, locale: Locale): string {
  const nextParam = url.searchParams.get("next");
  const defaultNext = localePath(locale, "centros-ayuda/panel");
  if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
    return nextParam;
  }
  return defaultNext;
}

export async function requireCoordinatorSession(Astro: Pick<AstroGlobal, "request" | "cookies" | "redirect" | "url">) {
  const user = await getSessionUser(Astro.request, Astro.cookies);
  if (user) return { user, redirect: null as null };

  const locale = getLocaleFromPath(Astro.url.pathname);
  const acceso = coordinatorAccesoPath(locale);
  const next = `${Astro.url.pathname}${Astro.url.search}`;
  return {
    user: null as null,
    redirect: Astro.redirect(`${acceso}?next=${encodeURIComponent(next)}`),
  };
}
