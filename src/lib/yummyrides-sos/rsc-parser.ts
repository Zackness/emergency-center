const FETCH_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent":
    "Mozilla/5.0 (compatible; EmergencyCenter/1.0; +https://startupven.com) AppleWebKit/537.36",
};

export function getRscField(
  chunk: string,
  key: string
): string | number | boolean | null | undefined {
  const strMatch = chunk.match(new RegExp(`\\\\"${key}\\\\":\\\\"([^\\\\"]*)\\\\"`));
  if (strMatch) return strMatch[1];

  const numMatch = chunk.match(
    new RegExp(`\\\\"${key}\\\\":([0-9.Ee+-]+|true|false|null)`)
  );
  if (!numMatch) return undefined;
  if (numMatch[1] === "true") return true;
  if (numMatch[1] === "false") return false;
  if (numMatch[1] === "null") return null;
  return Number(numMatch[1]);
}

export function parseRscObjects<T extends { id: string }>(
  html: string,
  fields: string[],
  validate: (item: Record<string, unknown>) => item is T,
  chunkSize = 1800
): T[] {
  const byId = new Map<string, T>();
  const idRe = /\\"id\\":\\"([a-f0-9-]{36})\\"/g;
  let match: RegExpExecArray | null;

  while ((match = idRe.exec(html))) {
    const chunk = html.slice(match.index, match.index + chunkSize);
    const item: Record<string, unknown> = { id: match[1] };

    for (const key of fields) {
      const value = getRscField(chunk, key);
      if (value !== undefined) item[key] = value;
    }

    if (validate(item)) {
      byId.set(match[1], item);
    }
  }

  return [...byId.values()];
}

export async function fetchYummyHtml(path: string): Promise<string> {
  const url = new URL(path, "https://sos.yummyrides.com");
  const res = await fetch(url.toString(), { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`Yummy SOS ${path}: HTTP ${res.status}`);
  return res.text();
}

export function parseHomeStats(html: string): {
  reportCount: number | null;
  acopioCount: number | null;
} {
  const reportMatch = html.match(/(\d[\d,.]*)\s*<\/[^>]+>\s*Reportes recibidos/i);
  const acopioMatch = html.match(/(\d[\d,.]*)\s*<\/[^>]+>\s*Centros de acopio/i);
  const parseNum = (raw: string | undefined) => {
    if (!raw) return null;
    const n = Number(raw.replace(/[^\d]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  return {
    reportCount: parseNum(reportMatch?.[1]),
    acopioCount: parseNum(acopioMatch?.[1]),
  };
}
