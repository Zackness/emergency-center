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

const PHOTO_RE =
  /src="(https:\/\/media\.huellascan\.com\/uploads\/earthquake\/[^"]+)"/g;

function collectPhotoEntries(html: string) {
  return [...html.matchAll(PHOTO_RE)].map((match) => ({
    url: match[1],
    index: match.index ?? 0,
  }));
}

/** Asigna la foto del card que precede a cada botón descargarCartel. */
function photoBeforeReport(
  photoEntries: Array<{ url: string; index: number }>,
  reportIndex: number,
  lastPhotoIndex: number
): { url: string | null; lastPhotoIndex: number } {
  const candidates = photoEntries.filter(
    (photo) => photo.index > lastPhotoIndex && photo.index < reportIndex
  );
  const chosen = candidates.at(-1);
  if (!chosen) return { url: null, lastPhotoIndex };
  return { url: chosen.url, lastPhotoIndex: chosen.index };
}

export function extractMaxPage(html: string): number {
  const pages = [...html.matchAll(/gotoPage\((\d+),\s*'page'\)/g)].map((m) => Number(m[1]));
  return pages.length ? Math.max(...pages) : 1;
}

function breedBeforeReport(html: string, reportIndex: number): string | null {
  const block = html.slice(Math.max(0, reportIndex - 12_000), reportIndex);
  const matches = [...block.matchAll(/Raza:<\/b>\s*\n?\s*([^<]+)/g)];
  const breed = matches.at(-1)?.[1]?.trim();
  return breed || null;
}

export function parseHuellascanPage(html: string) {
  const photoEntries = collectPhotoEntries(html);
  let lastPhotoIndex = -1;

  const items: Array<{
    externalId: string;
    name: string;
    status: "lost" | "found";
    location: string;
    distinctive_marks: string | null;
    contact_phone: string | null;
    photo_url: string | null;
    breed: string | null;
  }> = [];

  for (const match of html.matchAll(REPORT_RE)) {
    const reportIndex = match.index ?? 0;
    const { url: photo_url, lastPhotoIndex: nextIndex } = photoBeforeReport(
      photoEntries,
      reportIndex,
      lastPhotoIndex
    );
    lastPhotoIndex = nextIndex;

    items.push({
      externalId: match[1],
      name: decodeHtmlEntity(match[3]).trim(),
      status: match[2] as "lost" | "found",
      location: decodeHtmlEntity(match[4]).trim(),
      distinctive_marks: parseOptionalField(match[5]),
      contact_phone: parseOptionalField(match[6]),
      photo_url,
      breed: breedBeforeReport(html, reportIndex),
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
