import type { MissingPet, MissingPetsQuery, MissingPetsStats } from "./types";
import { LOCAL_MISSING_PETS } from "@/data/missing-pets";
import { DATA_CACHE_SLUGS, getDataCache } from "@/lib/data-cache";
import { extractMaxPage, fetchHuellascanHtml, parseHuellascanPage } from "./huellascan";
import { importedToMissingPet } from "./mapper";

const MEMORY_TTL_MS = 5 * 60 * 1000;
const PAGE_BATCH_SIZE = 8;

let memoryCache: { at: number; pets: MissingPet[] } | null = null;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesQuery(pet: MissingPet, query: MissingPetsQuery): boolean {
  if (query.status && query.status !== "all" && pet.status !== query.status) {
    return false;
  }
  if (query.species && query.species !== "all" && pet.species !== query.species) {
    return false;
  }
  if (query.state && query.state !== "all" && pet.state !== query.state) {
    return false;
  }
  if (query.q?.trim()) {
    const needle = normalizeSearchText(query.q.trim());
    const haystack = normalizeSearchText(
      [pet.name, pet.location, pet.city, pet.state, pet.distinctive_marks, pet.contact_phone]
        .filter(Boolean)
        .join(" ")
    );
    if (!haystack.includes(needle)) return false;
  }
  return pet.is_active;
}

export function computeMissingPetsStats(pets: MissingPet[]): MissingPetsStats {
  const lastSynced = pets.reduce<string | null>((latest, pet) => {
    const candidate = pet.updated_at;
    if (!latest || candidate > latest) return candidate;
    return latest;
  }, null);

  return {
    total: pets.length,
    lost: pets.filter((p) => p.status === "lost").length,
    found: pets.filter((p) => p.status === "found").length,
    last_synced_at: lastSynced,
  };
}

async function loadMissingPetsFromCache(): Promise<MissingPet[] | null> {
  const cached = await getDataCache<{
    fetched_at?: string;
    items?: Array<{
      externalId: string;
      name: string;
      status: "lost" | "found";
      location: string;
      distinctive_marks: string | null;
      contact_phone: string | null;
      photo_url: string | null;
      breed?: string | null;
      pet_type?: "dog" | "cat" | "other" | null;
    }>;
  }>(DATA_CACHE_SLUGS.MISSING_PETS);
  if (!cached?.payload?.items?.length) return null;
  const syncedAt = cached.payload.fetched_at ?? cached.fetched_at;
  return cached.payload.items.map((item) => importedToMissingPet({ ...item, syncedAt }));
}

async function fetchLiveMissingPets(): Promise<MissingPet[]> {
  const fromDb = await loadMissingPetsFromCache();
  if (fromDb?.length) {
    memoryCache = { at: Date.now(), pets: fromDb };
    return fromDb;
  }

  const now = Date.now();
  if (memoryCache && now - memoryCache.at < MEMORY_TTL_MS) {
    return memoryCache.pets;
  }

  try {
    const syncedAt = new Date().toISOString();
    const firstHtml = await fetchHuellascanHtml(1);
    const maxPage = extractMaxPage(firstHtml);
    const byId = new Map<string, MissingPet>();

    const ingest = (html: string) => {
      for (const item of parseHuellascanPage(html)) {
        byId.set(item.externalId, importedToMissingPet({ ...item, syncedAt }));
      }
    };

    ingest(firstHtml);

    const remainingPages = Array.from({ length: Math.max(0, maxPage - 1) }, (_, index) => index + 2);
    for (let offset = 0; offset < remainingPages.length; offset += PAGE_BATCH_SIZE) {
      const batch = remainingPages.slice(offset, offset + PAGE_BATCH_SIZE);
      const pages = await Promise.all(batch.map((page) => fetchHuellascanHtml(page)));
      for (const html of pages) ingest(html);
    }

    const pets = [...byId.values()].sort((a, b) => Number(b.external_id) - Number(a.external_id));
    memoryCache = { at: now, pets };
    return pets;
  } catch (err) {
    console.error("[missing-pets] live fetch failed, using local snapshot:", err);
    if (LOCAL_MISSING_PETS.length > 0) return LOCAL_MISSING_PETS;
    throw err;
  }
}

export async function fetchMissingPetsStats(): Promise<MissingPetsStats> {
  const pets = await fetchLiveMissingPets();
  return computeMissingPetsStats(pets);
}

export async function queryMissingPets(
  query: MissingPetsQuery
): Promise<{ items: MissingPet[]; total: number; stats: MissingPetsStats }> {
  const all = await fetchLiveMissingPets();
  const filtered = all.filter((pet) => matchesQuery(pet, query));
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 24));
  const start = (page - 1) * limit;

  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    stats: computeMissingPetsStats(all),
  };
}
