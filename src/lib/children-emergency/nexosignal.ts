import { NINOS_DE_PIE } from "@/data/ninos-de-pie";

function readEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env[name]) {
    return process.env[name];
  }
  const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return metaEnv?.[name];
}

const SUPABASE_URL =
  readEnv("NEXOSIGNAL_SUPABASE_URL") ?? "https://gqnvienuqsrzdhpjeiyl.supabase.co";
const SUPABASE_ANON_KEY =
  readEnv("NEXOSIGNAL_SUPABASE_ANON_KEY") ??
  "sb_publishable_Wpao1fOWuLUgarryL7KNDA_YVxfjzA-";

const PAGE_SIZE = 500;
const FETCH_TIMEOUT_MS = 25_000;

export interface NexosignalRawRecord {
  id: number;
  nombre: string | null;
  edad: number | null;
  hospital: string | null;
  estado_salud: string | null;
  encontrado_en: string | null;
  dice_de_si: string | null;
  quien_reporta: string | null;
  telefono_contacto: string | null;
  foto_url: string | null;
  created_at: string;
}

async function fetchPage(offset: number): Promise<NexosignalRawRecord[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/ninos_encontrados`);
  url.searchParams.set("select", "*");
  url.searchParams.set("order", "created_at.desc");
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NexoSignal Supabase ${res.status}: ${body.slice(0, 200)}`);
  }

  return (await res.json()) as NexosignalRawRecord[];
}

export async function fetchNexosignalRecords(): Promise<NexosignalRawRecord[]> {
  const byId = new Map<number, NexosignalRawRecord>();
  let offset = 0;

  while (true) {
    const page = await fetchPage(offset);
    for (const row of page) {
      byId.set(row.id, row);
    }
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export const NEXOSIGNAL_SOURCE = {
  name: NINOS_DE_PIE.organization,
  url: NINOS_DE_PIE.url,
} as const;
