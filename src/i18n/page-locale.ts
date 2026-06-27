import type { AstroGlobal } from "astro";
import type { Locale } from "./config";
import { isValidLocale, localePath, secondaryLocaleStaticPaths } from "./config";

export { secondaryLocaleStaticPaths };

type AstroPageContext = Pick<AstroGlobal, "params" | "redirect">;

export function resolveSecondaryLocale(
  Astro: AstroPageContext,
  spanishPath: string
): Locale | ReturnType<AstroGlobal["redirect"]> {
  const { lang } = Astro.params;
  if (!lang || !isValidLocale(lang) || lang === "es") {
    return Astro.redirect(spanishPath);
  }
  return lang;
}

export function defaultPanelPath(locale: Locale): string {
  return localePath(locale, "centros-ayuda/panel");
}

export function defaultRegisterPath(locale: Locale): string {
  return localePath(locale, "centros-ayuda/registrar");
}

export function resolvePanelPath(
  locale: Locale,
  nextParam: string | null
): string {
  const defaultPath = defaultPanelPath(locale);
  if (!nextParam) return defaultPath;
  if (locale === "es") {
    return nextParam.startsWith("/") && !nextParam.startsWith("/es/")
      ? nextParam
      : defaultPath;
  }
  return nextParam.startsWith(`/${locale}/`) ? nextParam : defaultPath;
}
