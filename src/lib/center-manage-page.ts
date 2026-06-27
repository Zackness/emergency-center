import type { AstroGlobal } from "astro";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import { canManageHelpCenter, requireCoordinatorSession } from "@/lib/auth-center";
import { getHelpCenterForManagement } from "@/lib/center-dashboard";

export type CenterSection = "centro" | "voluntarios" | "inventario";

export const CENTER_SECTIONS: CenterSection[] = ["inventario", "voluntarios", "centro"];

/** Sección al abrir /panel/[id] desde el hub */
export const DEFAULT_CENTER_SECTION: CenterSection = "inventario";

export function centerSectionPath(
  locale: Locale,
  centerId: string,
  section: CenterSection
): string {
  return localePath(locale, `centros-ayuda/panel/${centerId}/${section}`);
}

export function isCenterSection(value: string | undefined): value is CenterSection {
  return CENTER_SECTIONS.includes(value as CenterSection);
}

type AstroPage = Pick<AstroGlobal, "request" | "cookies" | "redirect" | "url">;

export async function resolveCenterManagePage(
  Astro: AstroPage,
  locale: Locale,
  centerId: string | undefined
) {
  const panelPath = localePath(locale, "centros-ayuda/panel");

  if (!centerId) {
    return { redirect: Astro.redirect(panelPath) as Response };
  }

  const session = await requireCoordinatorSession(Astro);
  if (session.redirect) {
    return { redirect: session.redirect as Response };
  }

  const user = session.user!;
  const allowed = await canManageHelpCenter(user.id, centerId);
  if (!allowed) {
    return { redirect: Astro.redirect(panelPath) as Response };
  }

  const centerRow = await getHelpCenterForManagement(centerId);
  if (!centerRow) {
    return { redirect: Astro.redirect(panelPath) as Response };
  }

  return {
    redirect: null as null,
    user,
    centerId,
    centerName: centerRow.name,
    panelPath,
  };
}
