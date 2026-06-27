import type { AlliedPlatformColor } from "@/data/allied-platforms";

export function domainFromUrl(url: string): string {
  try {
    const parsed = new URL(url.trim().match(/^https?:\/\//i) ? url.trim() : `https://${url.trim()}`);
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return url
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0] ?? url.trim();
  }
}

export function normalizeAlliedPlatformUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol = trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  return `${parsed.protocol}//${parsed.hostname}${parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/$/, "") || "/"}`;
}

export function isAlliedPlatformColor(value: string): value is AlliedPlatformColor {
  return value === "blue" || value === "yellow" || value === "red";
}

export interface AlliedPlatformInput {
  domain?: string;
  url: string;
  description_es: string;
  description_en: string;
  color?: AlliedPlatformColor;
  sort_order?: number;
  is_active?: boolean;
}

export function parseAlliedPlatformInput(body: Record<string, unknown>): AlliedPlatformInput | null {
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const description_es = typeof body.description_es === "string" ? body.description_es.trim() : "";
  const description_en = typeof body.description_en === "string" ? body.description_en.trim() : "";

  if (!url || !description_es || !description_en) return null;

  const domain =
    typeof body.domain === "string" && body.domain.trim()
      ? body.domain.trim().replace(/^www\./i, "")
      : domainFromUrl(url);

  const colorRaw = typeof body.color === "string" ? body.color : "blue";
  const color = isAlliedPlatformColor(colorRaw) ? colorRaw : "blue";

  const sort_order =
    typeof body.sort_order === "number"
      ? body.sort_order
      : typeof body.sort_order === "string" && body.sort_order.trim()
        ? Number(body.sort_order)
        : 0;

  const is_active = typeof body.is_active === "boolean" ? body.is_active : true;

  return {
    domain,
    url: normalizeAlliedPlatformUrl(url),
    description_es,
    description_en,
    color,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    is_active,
  };
}
