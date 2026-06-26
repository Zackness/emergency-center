import { SOURCE_ADAPTERS } from "@/lib/missing-persons/adapters";
import {
  findMatchingPersonId,
  registerImportedRecord,
  type PersonIndex,
} from "@/lib/missing-persons/dedup";
import { dedupeSourcesByPlatform } from "@/lib/missing-persons/sources";
import type { ImportedMissingRecord } from "@/lib/missing-persons/types";
import type { MissingPersonSourceLink, MissingPersonWithSources } from "@/types";

export interface MissingPersonsLiveQuery {
  q?: string;
  state?: string;
  page?: number;
  limit?: number;
}

const SOURCE_LABELS: Record<string, string> = {
  "venezuela-te-busca": "Venezuela Te Busca",
  encuentralos: "Encuéntralos",
  "terremotovenezuela-app": "Terremoto Venezuela",
  "venezuela-reporta": "Venezuela Reporta",
  "desaparecidos-terremoto": "Desaparecidos Terremoto",
};

let memoryCache: { at: number; persons: MissingPersonWithSources[] } | null = null;
const MEMORY_TTL_MS = 5 * 60 * 1000;
const MAX_PER_SOURCE = 2_000;
const BATCH_SIZE = 200;

export function clearMissingPersonsLiveCache() {
  memoryCache = null;
}

function sourceLink(record: ImportedMissingRecord): MissingPersonSourceLink {
  return {
    id: `${record.sourceSlug}-${record.externalId}`,
    source_id: record.sourceSlug,
    source_name: SOURCE_LABELS[record.sourceSlug] ?? record.sourceSlug,
    source_slug: record.sourceSlug,
    external_url: record.externalUrl,
    display_name: record.fullName,
    is_external: true,
  };
}

function importedToPerson(
  record: ImportedMissingRecord,
  personId: string,
  sources: MissingPersonSourceLink[]
): MissingPersonWithSources {
  const now = new Date().toISOString();
  return {
    id: personId,
    full_name: record.fullName,
    age: record.age,
    gender: record.gender,
    state: record.state,
    city: record.city,
    last_seen_location: record.lastSeenLocation,
    last_seen_at: record.lastSeenAt?.toISOString() ?? null,
    description: record.description,
    photo_url: record.photoUrl,
    contact_name: record.contactName,
    contact_phone: record.contactPhone,
    contact_email: record.contactEmail,
    verification_status: "unverified",
    is_active: true,
    created_at: now,
    updated_at: now,
    sources,
  };
}

function mergeSource(
  person: MissingPersonWithSources,
  record: ImportedMissingRecord
): void {
  const link = sourceLink(record);
  if (person.sources.some((s) => s.source_slug === link.source_slug)) {
    return;
  }
  person.sources.push(link);
  if (!person.photo_url && record.photoUrl) person.photo_url = record.photoUrl;
  if (person.contact_phone === "Por confirmar" && record.contactPhone) {
    person.contact_phone = record.contactPhone;
  }
}

async function loadAllFromAdapters(): Promise<MissingPersonWithSources[]> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < MEMORY_TTL_MS) {
    return memoryCache.persons;
  }

  const index: PersonIndex = new Map();
  const persons = new Map<string, MissingPersonWithSources>();

  for (const adapter of SOURCE_ADAPTERS) {
    let offset = 0;
    while (offset < MAX_PER_SOURCE) {
      let batch: ImportedMissingRecord[];
      try {
        batch = await adapter.fetchBatch(offset, BATCH_SIZE);
      } catch (err) {
        console.error(`[missing-persons] live fetch ${adapter.slug} failed:`, err);
        break;
      }

      if (!batch.length) break;

      for (const record of batch) {
        if (record.status !== "missing") continue;

        const existingId = findMatchingPersonId(index, record, {
          sourceSlug: record.sourceSlug,
          externalId: record.externalId,
          externalUrl: record.externalUrl,
        });

        if (existingId) {
          const existing = persons.get(existingId);
          if (existing) mergeSource(existing, record);
          continue;
        }

        const personId = `live-${record.sourceSlug}-${record.externalId}`;
        const link = sourceLink(record);
        const person = importedToPerson(record, personId, [link]);
        persons.set(personId, person);
        registerImportedRecord(index, personId, record);
      }

      offset += batch.length;
      if (batch.length < BATCH_SIZE) break;
    }
  }

  const list = [...persons.values()]
    .map((person) => ({
      ...person,
      sources: dedupeSourcesByPlatform(person.sources),
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  memoryCache = { at: now, persons: list };
  return list;
}

function matchesQuery(person: MissingPersonWithSources, query: MissingPersonsLiveQuery): boolean {
  if (query.state && person.state !== query.state) return false;
  if (query.q?.trim()) {
    const needle = query.q.trim().toLowerCase();
    const haystack = [
      person.full_name,
      person.city,
      person.state,
      person.last_seen_location,
      person.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export async function fetchMissingPersonsLive(query: MissingPersonsLiveQuery = {}) {
  const all = await loadAllFromAdapters();
  const filtered = all.filter((person) => matchesQuery(person, query));
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 24));
  const start = (page - 1) * limit;

  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export async function fetchMissingPersonsLiveStats() {
  const all = await loadAllFromAdapters();
  const bySource = new Map<string, number>();

  for (const person of all) {
    for (const source of person.sources) {
      bySource.set(source.source_slug, (bySource.get(source.source_slug) ?? 0) + 1);
    }
  }

  const totalRecords = [...bySource.values()].reduce((sum, count) => sum + count, 0);

  return {
    unique_active: all.length,
    total_external_records: totalRecords,
    sources: [...bySource.entries()].map(([slug, records]) => ({
      slug,
      name: SOURCE_LABELS[slug] ?? slug,
      records,
      platform_count: null,
    })),
  };
}
