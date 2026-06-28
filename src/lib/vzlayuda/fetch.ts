import { VENEZUELA_STATES } from "@/data/seed";
import {
  VZLAYUDA_CATEGORIES,
  type VzlaAyudaAviso,
  type VzlaAyudaSnapshot,
  type VzlaAyudaTipo,
} from "@/lib/vzlayuda/types";

const BASE = "https://vzlayuda.com";
const UA = "Mozilla/5.0 (compatible; emergency-center/1.0)";
const DELAY_MS = 120;
const MAX_JSON_CHARS = 24_000;

/** Términos amplios para barrido vía POST /api/buscar */
const SEARCH_TERMS = [
  "",
  "ayuda",
  "medicina",
  "médico",
  "enfermería",
  "transporte",
  "carro",
  "comida",
  "agua",
  "refugio",
  "albergue",
  "escombros",
  "techo",
  "gasolina",
  "hospital",
  "voluntario",
  "donación",
  "alimentos",
  "herramientas",
  "palas",
  "toldo",
  "veterinario",
  "mascota",
  "psicólogo",
  "ingeniero",
  "electricidad",
  "Caracas",
  "La Guaira",
  "Valencia",
  "Maracay",
  "Barquisimeto",
  "necesito",
  "solicitud",
  "ofrezco",
  "gasolina",
  "toldos",
  "palas",
];

const HTML_PAGES: { path: "/necesito" | "/ayudar"; defaultTipo: VzlaAyudaTipo }[] = [
  { path: "/necesito", defaultTipo: "oferta" },
  { path: "/ayudar", defaultTipo: "solicitud" },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeAviso(
  raw: Record<string, unknown>,
  defaultTipo?: VzlaAyudaTipo
): VzlaAyudaAviso | null {
  const id = typeof raw.id === "string" ? raw.id : null;
  const tipo =
    raw.tipo === "oferta" || raw.tipo === "solicitud"
      ? raw.tipo
      : defaultTipo ?? null;
  const titulo = typeof raw.titulo === "string" ? raw.titulo.trim() : null;
  if (!id || !tipo || !titulo) return null;

  return {
    id,
    tipo,
    categoria: typeof raw.categoria === "string" ? raw.categoria : null,
    titulo,
    descripcion: typeof raw.descripcion === "string" ? raw.descripcion : null,
    estado: typeof raw.estado === "string" ? raw.estado : null,
    ciudad: typeof raw.ciudad === "string" ? raw.ciudad : null,
    zona: typeof raw.zona === "string" ? raw.zona : null,
    nombre: typeof raw.nombre === "string" ? raw.nombre : null,
    creado_en: typeof raw.creado_en === "string" ? raw.creado_en : null,
    confirmado_en: typeof raw.confirmado_en === "string" ? raw.confirmado_en : null,
    expira_en: typeof raw.expira_en === "string" ? raw.expira_en : null,
  };
}

function parseJsonObjectAt(html: string, start: number): { end: number; parsed: Record<string, unknown> } | null {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < Math.min(html.length, start + MAX_JSON_CHARS); i++) {
    const ch = html[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(html.slice(start, i + 1)) as Record<string, unknown>;
          return { end: i + 1, parsed };
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

/** Extrae objetos aviso embebidos en HTML RSC de Next.js. */
export function extractAvisosFromHtml(html: string, defaultTipo?: VzlaAyudaTipo): VzlaAyudaAviso[] {
  const found: VzlaAyudaAviso[] = [];
  const seen = new Set<string>();
  const variants = html.includes('\\"') ? [html, html.replace(/\\"/g, '"')] : [html];

  for (const source of variants) {
    let cursor = 0;
    while (cursor < source.length) {
      const start = source.indexOf('{"id":"', cursor);
      if (start === -1) break;

      const result = parseJsonObjectAt(source, start);
      if (!result) {
        cursor = start + 8;
        continue;
      }

      const aviso = normalizeAviso(result.parsed, defaultTipo);
      if (aviso && !seen.has(aviso.id)) {
        seen.add(aviso.id);
        found.push(aviso);
      }

      cursor = start + 8;
    }
  }

  return found;
}

async function postBuscar(
  query: string,
  filtros: {
    tipo?: VzlaAyudaTipo | null;
    categoria?: string | null;
    estado?: string | null;
    ciudad?: string | null;
  }
): Promise<VzlaAyudaAviso[]> {
  try {
    const res = await fetch(`${BASE}/api/buscar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({
        query,
        filtros: {
          tipo: filtros.tipo ?? null,
          categoria: filtros.categoria ?? null,
          estado: filtros.estado ?? null,
          ciudad: filtros.ciudad ?? null,
          ayuda: null,
          quien: null,
        },
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { avisos?: Record<string, unknown>[] };
    const defaultTipo = filtros.tipo ?? undefined;
    return (data.avisos ?? [])
      .map((row) => normalizeAviso(row, defaultTipo))
      .filter((row): row is VzlaAyudaAviso => row !== null);
  } catch {
    return [];
  }
}

async function fetchHtmlAvisos(path: "/necesito" | "/ayudar", defaultTipo: VzlaAyudaTipo): Promise<VzlaAyudaAviso[]> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    return extractAvisosFromHtml(html, defaultTipo);
  } catch {
    return [];
  }
}

async function sweepTipo(tipo: VzlaAyudaTipo): Promise<VzlaAyudaAviso[]> {
  const byId = new Map<string, VzlaAyudaAviso>();

  function merge(rows: VzlaAyudaAviso[]) {
    for (const row of rows) {
      byId.set(row.id, row);
    }
  }

  merge(await postBuscar("", { tipo }));
  await sleep(DELAY_MS);

  for (const categoria of VZLAYUDA_CATEGORIES) {
    merge(await postBuscar("", { tipo, categoria }));
    await sleep(DELAY_MS);
  }

  for (const term of SEARCH_TERMS) {
    merge(await postBuscar(term, { tipo }));
    await sleep(DELAY_MS);
  }

  for (const estado of VENEZUELA_STATES) {
    merge(await postBuscar("", { tipo, estado }));
    await sleep(DELAY_MS);
  }

  return [...byId.values()];
}

export async function fetchVzlaAyudaSnapshot(): Promise<VzlaAyudaSnapshot> {
  const byId = new Map<string, VzlaAyudaAviso>();

  function merge(rows: VzlaAyudaAviso[]) {
    for (const row of rows) {
      const existing = byId.get(row.id);
      if (!existing || (!existing.descripcion && row.descripcion)) {
        byId.set(row.id, row);
      }
    }
  }

  for (const { path, defaultTipo } of HTML_PAGES) {
    merge(await fetchHtmlAvisos(path, defaultTipo));
  }

  for (const tipo of ["solicitud", "oferta"] as const) {
    merge(await sweepTipo(tipo));
  }

  const avisos = [...byId.values()].sort((a, b) => {
    const ta = a.creado_en ? Date.parse(a.creado_en) : 0;
    const tb = b.creado_en ? Date.parse(b.creado_en) : 0;
    return tb - ta;
  });

  return {
    source: "vzlayuda.com",
    source_url: BASE,
    fetched_at: new Date().toISOString(),
    counts: {
      oferta: avisos.filter((a) => a.tipo === "oferta").length,
      solicitud: avisos.filter((a) => a.tipo === "solicitud").length,
      total: avisos.length,
    },
    avisos,
  };
}
