import { fetchVzlaAyudaSnapshotFeed } from "./snapshot-feed";
import { VZLAYUDA_PLATFORM_URL } from "@/data/vzlayuda-resources";
import type { VzlaAyudaAviso, VzlaAyudaTipo } from "@/lib/vzlayuda/types";

export interface HelpListingItem {
  id: string;
  kind: "offer" | "request";
  title: string;
  description: string | null;
  category: string | null;
  state: string | null;
  city: string | null;
  zone: string | null;
  contactName: string | null;
  contactPhone: string | null;
  source: string;
  sourceUrl: string;
  createdAt: string | null;
  external: boolean;
}

export interface HelpListingQuery {
  kind?: "offer" | "request" | "all";
  state?: string;
  category?: string;
  search?: string;
  source?: "all" | "vzlayuda" | "local";
  limit?: number;
  offset?: number;
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function mapVzlaAviso(aviso: VzlaAyudaAviso): HelpListingItem {
  const path = aviso.tipo === "oferta" ? "/necesito" : "/ayudar";
  return {
    id: `vzla-${aviso.id}`,
    kind: aviso.tipo === "oferta" ? "offer" : "request",
    title: aviso.titulo,
    description: aviso.descripcion,
    category: aviso.categoria,
    state: aviso.estado,
    city: aviso.ciudad,
    zone: aviso.zona,
    contactName: aviso.nombre,
    contactPhone: null,
    source: "VZLA Ayuda",
    sourceUrl: `${VZLAYUDA_PLATFORM_URL}${path}`,
    createdAt: aviso.creado_en,
    external: true,
  };
}

function mapLocalPost(row: {
  id: string;
  kind: "offer" | "request";
  title: string;
  description: string | null;
  category: string | null;
  state: string;
  city: string;
  zone: string | null;
  contactName: string;
  contactPhone: string;
  source: string;
  createdAt: Date;
}): HelpListingItem {
  return {
    id: `local-${row.id}`,
    kind: row.kind,
    title: row.title,
    description: row.description,
    category: row.category,
    state: row.state,
    city: row.city,
    zone: row.zone,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    source: row.source,
    sourceUrl: `${VZLAYUDA_PLATFORM_URL}/publicar`,
    createdAt: row.createdAt.toISOString(),
    external: false,
  };
}

function matchesQuery(item: HelpListingItem, query: HelpListingQuery): boolean {
  if (query.kind && query.kind !== "all" && item.kind !== query.kind) return false;
  if (query.state && query.state !== "all" && item.state !== query.state) return false;
  if (query.category && query.category !== "all" && item.category !== query.category) return false;
  if (query.source === "vzlayuda" && !item.external) return false;
  if (query.source === "local" && item.external) return false;

  if (query.search?.trim()) {
    const needle = normalizeSearch(query.search.trim());
    const haystack = normalizeSearch(
      [item.title, item.description, item.city, item.state, item.zone, item.contactName, item.category]
        .filter(Boolean)
        .join(" ")
    );
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

export async function fetchHelpListings(query: HelpListingQuery = {}): Promise<{
  items: HelpListingItem[];
  total: number;
  counts: { offer: number; request: number; vzlayuda: number; local: number };
}> {
  const snapshot = await fetchVzlaAyudaSnapshotFeed();
  const vzlaItems = (snapshot.avisos ?? []).map(mapVzlaAviso);
  let localItems: HelpListingItem[] = [];

  try {
    const { isDatabaseConfigured, prisma } = await import("@/lib/prisma");
    if (isDatabaseConfigured()) {
      const rows = await prisma.communityHelpPost.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      });
      localItems = rows.map(mapLocalPost);
    }
  } catch {
    /* seed-only / sin BD */
  }

  const merged = [...localItems, ...vzlaItems].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tb - ta;
  });

  const filtered = merged.filter((item) => matchesQuery(item, query));
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 100;

  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    counts: {
      offer: merged.filter((i) => i.kind === "offer").length,
      request: merged.filter((i) => i.kind === "request").length,
      vzlayuda: merged.filter((i) => i.external).length,
      local: merged.filter((i) => !i.external).length,
    },
  };
}

export function vzlaTipoFromKind(kind: "offer" | "request"): VzlaAyudaTipo {
  return kind === "offer" ? "oferta" : "solicitud";
}
