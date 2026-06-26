const STATE_ALIASES: Record<string, string> = {
  "distrito capital": "Distrito Capital",
  caracas: "Distrito Capital",
  "la guaira": "La Guaira",
  vargas: "La Guaira",
  macuto: "La Guaira",
  carabobo: "Carabobo",
  miranda: "Miranda",
  aragua: "Aragua",
  zulia: "Zulia",
  lara: "Lara",
  mérida: "Mérida",
  merida: "Mérida",
  anzoátegui: "Anzoátegui",
  anzoategui: "Anzoátegui",
};

export function inferPetState(location: string): { city: string | null; state: string | null } {
  const haystack = location.toLowerCase();
  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (haystack.includes(alias)) {
      const city = location.split(",")[0]?.trim() || null;
      return { city, state };
    }
  }
  const city = location.split(",")[0]?.trim() || location.trim() || null;
  return { city, state: null };
}

function decodeHtmlEntity(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u00e1/g, "á")
    .replace(/\\u00e9/g, "é")
    .replace(/\\u00ed/g, "í")
    .replace(/\\u00f3/g, "ó")
    .replace(/\\u00fa/g, "ú")
    .replace(/\\u00f1/g, "ñ");
}

function parseOptionalField(raw: string): string | null {
  if (raw === "null") return null;
  const decoded = decodeHtmlEntity(raw.replace(/^&quot;|&quot;$/g, ""));
  return decoded.trim() || null;
}

const REPORT_RE =
  /descargarCartel\(event,\s*(\d+),\s*&quot;(lost|found)&quot;,\s*&quot;((?:\\.|[^&])*)&quot;,\s*&quot;((?:\\.|[^&])*)&quot;,\s*(null|&quot;(?:\\.|[^&])*&quot;),\s*(null|&quot;(?:\\.|[^&])*&quot;)\)/g;

export function extractMaxPage(html: string): number {
  const pages = [...html.matchAll(/gotoPage\((\d+),\s*'page'\)/g)].map((m) => Number(m[1]));
  return pages.length ? Math.max(...pages) : 1;
}

export function parseHuellascanPage(html: string) {
  const items: Array<{
    externalId: string;
    name: string;
    status: "lost" | "found";
    location: string;
    distinctive_marks: string | null;
    contact_phone: string | null;
    photo_url: string | null;
  }> = [];

  for (const match of html.matchAll(REPORT_RE)) {
    const index = match.index ?? 0;
    const chunk = html.slice(Math.max(0, index - 3000), index);
    const photoMatches = [
      ...chunk.matchAll(/src="(https:\/\/media\.huellascan\.com\/uploads\/earthquake\/[^"]+)"/g),
    ];
    const photo_url = photoMatches.at(-1)?.[1] ?? null;

    items.push({
      externalId: match[1],
      name: decodeHtmlEntity(match[3]).trim(),
      status: match[2] as "lost" | "found",
      location: decodeHtmlEntity(match[4]).trim(),
      distinctive_marks: parseOptionalField(match[5]),
      contact_phone: parseOptionalField(match[6]),
      photo_url,
    });
  }

  return items;
}

export async function fetchHuellascanHtml(page: number): Promise<string> {
  const url = page <= 1 ? "https://www.huellascan.com/terremoto" : `https://www.huellascan.com/terremoto?page=${page}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "EmergencyCenter/1.0 (+https://emergency-center.local)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(`HuellasCAN HTTP ${response.status} (página ${page})`);
  }
  return response.text();
}
