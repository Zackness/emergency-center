import type { ImportedMissingRecord, ImportedPersonStatus, SourceAdapter } from "@/lib/missing-persons/types";
import { parseLocation } from "@/lib/missing-persons/location";

const BASE = "https://terremotovenezuela.app";

interface TvAppPerson {
  id: string;
  name: string;
  age: number | null;
  description: string | null;
  lastSeen: string | null;
  contact: string | null;
  photoUrl: string | null;
  status: string;
  resolvedAt?: string | number | null;
  createdAt: string;
}

function resolvePhotoUrl(photoUrl: string | null, personId: string): string | null {
  if (!photoUrl) return `${BASE}/api/missing/${personId}/photo`;
  if (photoUrl.startsWith("http")) return photoUrl;
  return `${BASE}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
}

function mapPerson(row: TvAppPerson): ImportedMissingRecord {
  const { state, city } = parseLocation(row.lastSeen);
  const contact = row.contact?.trim();
  const isMissing = row.status === "active" && !row.resolvedAt;

  return {
    sourceSlug: "terremotovenezuela-app",
    externalId: row.id,
    externalUrl: `${BASE}/?missing=${row.id}`,
    fullName: row.name.trim(),
    age: row.age,
    gender: null,
    nationalId: null,
    state,
    city,
    lastSeenLocation: row.lastSeen,
    lastSeenAt: row.createdAt ? new Date(row.createdAt) : null,
    description: row.description,
    photoUrl: resolvePhotoUrl(row.photoUrl, row.id),
    contactName: contact ? "Reporte ciudadano" : "Reporte ciudadano",
    contactPhone: contact || "Por confirmar",
    contactEmail: null,
    status: isMissing ? "missing" : "found",
  };
}

async function fetchTvPage(
  page: number,
  pageSize: number
): Promise<import("@/lib/missing-persons/types").SourcePageResult> {
  const url = `${BASE}/api/missing?page=${page}&pageSize=${pageSize}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    throw new Error(`Terremoto Venezuela App API ${res.status}`);
  }

  const data = (await res.json()) as { people?: TvAppPerson[]; total?: number };
  return {
    items: (data.people ?? []).map(mapPerson),
    total: data.total ?? null,
  };
}

export const terremotoVenezuelaAppAdapter: SourceAdapter = {
  slug: "terremotovenezuela-app",

  async fetchPage(offset, limit, status = "missing") {
    const page = Math.floor(offset / limit) + 1;
    const result = await fetchTvPage(page, limit);
    if (status === "missing") {
      return {
        items: result.items.filter((row) => row.status === "missing"),
        total: result.total,
      };
    }
    if (status === "found") {
      return {
        items: result.items.filter((row) => row.status === "found"),
        total: null,
      };
    }
    return result;
  },

  async fetchBatch(
    offset: number,
    limit: number,
    status: ImportedPersonStatus = "missing"
  ): Promise<ImportedMissingRecord[]> {
    const page = Math.floor(offset / limit) + 1;
    const result = await fetchTvPage(page, limit);
    if (status === "found") {
      return result.items.filter((row) => row.status === "found");
    }
    if (status === "missing") {
      return result.items.filter((row) => row.status === "missing");
    }
    return result.items;
  },
};
