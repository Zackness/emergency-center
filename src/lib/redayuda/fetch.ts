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
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
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
    fetch(BASE, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null),
  ]);

  let hospitals = REDAYUDA_CARACAS_HOSPITALS;
  let communityGuide = REDAYUDA_COMMUNITY_GUIDE;
  const phones: RedAyudaPhoneEntry[] = REDAYUDA_EMERGENCY_PHONES;

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
  }

  return {
    source: "redayudavenezuela.com",
    source_url: BASE,
    fetched_at: new Date().toISOString(),
    stats: statsPayload?.stats ?? null,
    official: statsPayload?.official ?? null,
    ninos: statsPayload?.ninos ?? null,
    denuncias: statsPayload?.denuncias ?? null,
    quakes: sismosPayload?.quakes ?? [],
    hospitals,
    phones,
    community_guide: communityGuide,
  };
}
