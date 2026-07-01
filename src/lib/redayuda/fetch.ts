import {
  REDAYUDA_CARACAS_HOSPITALS,
  REDAYUDA_COMMUNITY_GUIDE,
  REDAYUDA_EMERGENCY_PHONES,
  REDAYUDA_SOURCE_URL,
} from "@/data/redayuda-static";
import type {
  RedAyudaCommunityGuideItem,
  RedAyudaHospitalEntry,
  RedAyudaPhoneEntry,
  RedAyudaQuake,
  RedAyudaSnapshot,
  RedAyudaStats,
} from "@/lib/redayuda/types";

const BASE = REDAYUDA_SOURCE_URL;
const FETCH_TIMEOUT_MS = 20_000;

const BROWSER_HEADERS = {
  Accept: "application/json, text/html, */*",
  "User-Agent":
    "Mozilla/5.0 (compatible; EmergencyCenter/1.0; +https://startupven.com) AppleWebKit/537.36",
  Referer: `${BASE}/`,
};

function parseCount(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Fallback: extrae stats embebidos en HTML (__NEXT_DATA__, scripts, etc.). */
export function scrapeStatsFromHtml(html: string): Partial<RedAyudaStats> & { ninos?: number; denuncias?: number } {
  const decoded = decodeHtml(html);
  const out: Partial<RedAyudaStats> & { ninos?: number; denuncias?: number } = {};

  const patterns: [keyof RedAyudaStats | "ninos" | "denuncias", RegExp][] = [
    ["desaparecidos", /"desaparecidos"\s*:\s*(\d+)/i],
    ["salvo", /"salvo"\s*:\s*(\d+)/i],
    ["puntos", /"puntos"\s*:\s*(\d+)/i],
    ["hospital", /"hospital"\s*:\s*(\d+)/i],
    ["voluntarios", /"voluntarios"\s*:\s*(\d+)/i],
    ["necesidades", /"necesidades"\s*:\s*(\d+)/i],
    ["atrapados", /"atrapados"\s*:\s*(\d+)/i],
    ["danos", /"danos"\s*:\s*(\d+)/i],
    ["ninos", /"ninos"\s*:\s*(\d+)/i],
    ["denuncias", /"denuncias"\s*:\s*(\d+)/i],
  ];

  for (const [key, re] of patterns) {
    const match = decoded.match(re);
    const value = parseCount(match?.[1]);
    if (value != null) {
      if (key === "ninos" || key === "denuncias") {
        out[key] = value;
      } else {
        out[key as keyof RedAyudaStats] = value;
      }
    }
  }

  return out;
}

export function mergeRedAyudaSnapshots(
  previous: RedAyudaSnapshot | null,
  next: RedAyudaSnapshot,
): RedAyudaSnapshot {
  if (!previous) return next;

  const mergedStats =
    next.stats ??
    (previous.stats
      ? { ...previous.stats }
      : null);

  return {
    ...next,
    stats: mergedStats,
    official: next.official ?? previous.official,
    ninos: next.ninos ?? previous.ninos,
    denuncias: next.denuncias ?? previous.denuncias,
    quakes: next.quakes.length ? next.quakes : previous.quakes,
    hospitals: next.hospitals.length ? next.hospitals : previous.hospitals,
    phones: next.phones.length ? next.phones : previous.phones,
    community_guide: next.community_guide.length
      ? next.community_guide
      : previous.community_guide,
  };
}

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú");
}

function normalizePhone(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .replace(/\./g, "-")
    .replace(/^\(0?212\)/, "0212-")
    .replace(/^0212-?/, "0212-");
}

/** Intenta extraer hospitales de Caracas del HTML de la home. */
export function scrapeCaracasHospitals(html: string): RedAyudaHospitalEntry[] {
  const decoded = decodeHtml(html);
  const sectionMatch = decoded.match(
    /Hospitales en Caracas([\s\S]*?)(?:Teléfonos de emergencia|Guía rápida|$)/i
  );
  if (!sectionMatch) return [];

  const block = sectionMatch[1];
  const lines = block
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const found: RedAyudaHospitalEntry[] = [];
  let pendingName: string | null = null;
  let pendingZone: string | null = null;

  for (const line of lines) {
    const hospitalMatch = line.match(/^(Hospital|Policlínica)\s+(.+?)\s*\(([^)]+)\)\s*$/i);
    if (hospitalMatch) {
      pendingName = `${hospitalMatch[1]} ${hospitalMatch[2]}`.trim();
      pendingZone = hospitalMatch[3].trim();
      continue;
    }

    const phoneMatch = line.match(/\(?0?212\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/);
    if (phoneMatch && pendingName && pendingZone) {
      found.push({
        id: `ra-scraped-${found.length + 1}`,
        name: pendingName,
        zone: pendingZone,
        city: "Caracas",
        state: "Distrito Capital",
        phone: normalizePhone(phoneMatch[0]),
      });
      pendingName = null;
      pendingZone = null;
    }
  }

  return found.length ? found : [];
}

/** Intenta extraer ítems numerados de la guía comunitaria del HTML. */
export function scrapeCommunityGuide(html: string): RedAyudaCommunityGuideItem[] {
  const decoded = decodeHtml(html);
  const sectionMatch = decoded.match(/Guía rápida para la comunidad([\s\S]*?)(?:Compartir por WhatsApp|$)/i);
  if (!sectionMatch) return [];

  const items: RedAyudaCommunityGuideItem[] = [];
  const pattern = /\d+\s*([^\d<][^<\n]+?)(?=\d+\s|$)/g;
  let match: RegExpExecArray | null;
  let order = 1;

  while ((match = pattern.exec(sectionMatch[1])) !== null) {
    const text = match[1].trim().replace(/\s+/g, " ");
    if (text.length < 20) continue;
    items.push({
      order,
      text_es: text,
      text_en: text,
    });
    order += 1;
  }

  return items.length >= 5 ? items : [];
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (text.trim().startsWith("<")) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function fetchRedAyudaSnapshot(): Promise<RedAyudaSnapshot> {
  const [statsPayload, sismosPayload, homeRes] = await Promise.all([
    fetchJson<{
      stats?: RedAyudaStats;
      official?: RedAyudaSnapshot["official"];
      ninos?: number;
      denuncias?: number;
    }>("/api/stats"),
    fetchJson<{ quakes?: RedAyudaQuake[] }>("/api/sismos"),
    fetch(BASE, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }).catch(() => null),
  ]);

  let hospitals = REDAYUDA_CARACAS_HOSPITALS;
  let communityGuide = REDAYUDA_COMMUNITY_GUIDE;
  const phones: RedAyudaPhoneEntry[] = REDAYUDA_EMERGENCY_PHONES;
  let stats = statsPayload?.stats ?? null;
  let ninos = statsPayload?.ninos ?? null;
  let denuncias = statsPayload?.denuncias ?? null;
  let quakes = sismosPayload?.quakes ?? [];

  if (homeRes?.ok) {
    const html = await homeRes.text();
    const scrapedHospitals = scrapeCaracasHospitals(html);
    const scrapedGuide = scrapeCommunityGuide(html);
    if (scrapedHospitals.length >= REDAYUDA_CARACAS_HOSPITALS.length - 2) {
      hospitals = scrapedHospitals;
    }
    if (scrapedGuide.length >= 5) {
      communityGuide = scrapedGuide;
    }

    if (!stats) {
      const scraped = scrapeStatsFromHtml(html);
      if (scraped.desaparecidos != null) {
        stats = {
          desaparecidos: scraped.desaparecidos,
          salvo: scraped.salvo ?? 0,
          puntos: scraped.puntos ?? 0,
          hospital: scraped.hospital ?? 0,
          voluntarios: scraped.voluntarios ?? 0,
          necesidades: scraped.necesidades ?? 0,
          atrapados: scraped.atrapados ?? 0,
          danos: scraped.danos ?? 0,
        };
      }
      ninos = ninos ?? scraped.ninos ?? null;
      denuncias = denuncias ?? scraped.denuncias ?? null;
    }
  }

  return {
    source: "redayudavenezuela.com",
    source_url: BASE,
    fetched_at: new Date().toISOString(),
    stats,
    official: statsPayload?.official ?? null,
    ninos,
    denuncias,
    quakes,
    hospitals,
    phones,
    community_guide: communityGuide,
  };
}
