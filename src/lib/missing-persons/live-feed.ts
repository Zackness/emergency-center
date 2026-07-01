import { SOURCE_ADAPTERS } from "@/lib/missing-persons/adapters";
import { defaultMissingPersonSyncSlugs } from "@/lib/missing-persons/sync-source-registry";
import {
  findMatchingPersonId,
  registerImportedRecord,
  type PersonIndex,
} from "@/lib/missing-persons/dedup";
import { normalizeHubStats, type MissingPersonsHubStats } from "@/lib/missing-persons/hub-stats";
import { dedupeSourcesByPlatform } from "@/lib/missing-persons/sources";
import type { ImportedMissingRecord, ImportedPersonStatus } from "@/lib/missing-persons/types";
import type { MissingPersonSourceLink, MissingPersonVerificationStatus, MissingPersonWithSources } from "@/types";

export interface MissingPersonsLiveQuery {
  q?: string;
  state?: string;
  status?: "all" | "missing" | "found";
  page?: number;
  limit?: number;
}

const SOURCE_LABELS: Record<string, string> = {
  "venezuela-te-busca": "Venezuela Te Busca",
  encuentralos: "Encuéntralos",
  "terremotovenezuela-app": "Terremoto Venezuela",
  "venezuela-reporta": "Venezuela Reporta",
  "desaparecidos-terremoto": "Desaparecidos Terremoto",
  "red-de-esperanza": "Red de Esperanza",
};

const FETCH_STATUSES: ImportedPersonStatus[] = ["missing", "found"];

let memoryCache: {
  at: number;
  persons: MissingPersonWithSources[];
  totalReports: number;
} | null = null;
const MEMORY_TTL_MS = 5 * 60 * 1000;
const MAX_PER_SOURCE = 5_000;
const BATCH_SIZE = 200;

export function clearMissingPersonsLiveCache() {
  memoryCache = null;
}

function verificationFromRecord(
  status: ImportedPersonStatus
): MissingPersonVerificationStatus {
  if (status === "found") return "found";
  if (status === "deceased") return "deceased";
  return "unverified";
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
  const verification = verificationFromRecord(record.status);
  return {
    id: personId,
    full_name: record.fullName,
    national_id: record.nationalId,
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
    verification_status: verification,
    is_active: record.status === "missing",
    created_at: now,
    updated_at: now,
    sources,
  };
}

function mergeRecord(person: MissingPersonWithSources, record: ImportedMissingRecord): void {
  const link = sourceLink(record);
  if (!person.sources.some((s) => s.source_slug === link.source_slug && s.id === link.id)) {
    person.sources.push(link);
  }

  if (record.status === "found") {
    person.verification_status = "found";
    person.is_active = false;
  } else if (record.status === "deceased") {
    person.verification_status = "deceased";
    person.is_active = false;
  } else if (person.verification_status !== "found" && person.verification_status !== "deceased") {
    person.verification_status = "unverified";
    person.is_active = true;
  }

  if (!person.photo_url && record.photoUrl) person.photo_url = record.photoUrl;
  if (!person.national_id && record.nationalId) person.national_id = record.nationalId;
  if (person.contact_phone === "Por confirmar" && record.contactPhone) {
    person.contact_phone = record.contactPhone;
  }
  if (!person.last_seen_location && record.lastSeenLocation) {
    person.last_seen_location = record.lastSeenLocation;
  }
}

async function fetchAdapterBatch(
  adapter: (typeof SOURCE_ADAPTERS)[number],
  offset: number,
  status: ImportedPersonStatus
): Promise<ImportedMissingRecord[]> {
  return Promise.race([
    adapter.fetchBatch(offset, BATCH_SIZE, status),
    new Promise<ImportedMissingRecord[]>((_, reject) => {
      setTimeout(() => reject(new Error("fetch timeout")), 20_000);
    }),
  ]);
}

async function loadAllFromAdapters(): Promise<{
  persons: MissingPersonWithSources[];
  totalReports: number;
}> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < MEMORY_TTL_MS) {
    return { persons: memoryCache.persons, totalReports: memoryCache.totalReports };
  }

  const index: PersonIndex = new Map();
  const persons = new Map<string, MissingPersonWithSources>();
  const seenSourceRecords = new Set<string>();
  let totalReports = 0;

  const syncSlugs = new Set(defaultMissingPersonSyncSlugs());
  const adapters = SOURCE_ADAPTERS.filter((adapter) => syncSlugs.has(adapter.slug));

  for (const adapter of adapters) {
    for (const status of FETCH_STATUSES) {
      if (adapter.slug === "terremotovenezuela-app" && status === "found") {
        continue;
      }

      let offset = 0;
      while (offset < MAX_PER_SOURCE) {
        let batch: ImportedMissingRecord[];
        try {
          batch = await fetchAdapterBatch(adapter, offset, status);
        } catch (err) {
          console.error(`[missing-persons] live fetch ${adapter.slug}/${status} failed:`, err);
          break;
        }

        if (!batch.length) break;

        for (const record of batch) {
          const sourceKey = `${record.sourceSlug}:${record.externalId}`;
          if (!seenSourceRecords.has(sourceKey)) {
            seenSourceRecords.add(sourceKey);
            totalReports += 1;
          }

          const existingId = findMatchingPersonId(index, record, {
            sourceSlug: record.sourceSlug,
            externalId: record.externalId,
            externalUrl: record.externalUrl,
          });

          if (existingId) {
            const existing = persons.get(existingId);
            if (existing) mergeRecord(existing, record);
            registerImportedRecord(index, existingId, record);
            continue;
          }

          const personId = `live-${record.sourceSlug}-${record.externalId}`;
          const person = importedToPerson(record, personId, [sourceLink(record)]);
          persons.set(personId, person);
          registerImportedRecord(index, personId, record);
        }

        offset += batch.length;
        if (batch.length < BATCH_SIZE) break;
      }
    }
  }

  const list = [...persons.values()]
    .map((person) => ({
      ...person,
      sources: dedupeSourcesByPlatform(person.sources),
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  memoryCache = { at: now, persons: list, totalReports };
  return { persons: list, totalReports };
}

function personMatchesStatus(
  person: MissingPersonWithSources,
  status: MissingPersonsLiveQuery["status"]
): boolean {
  if (!status || status === "all") return true;
  if (status === "found") return person.verification_status === "found";
  return person.verification_status !== "found" && person.verification_status !== "deceased";
}

function matchesQuery(person: MissingPersonWithSources, query: MissingPersonsLiveQuery): boolean {
  if (query.state && person.state !== query.state) return false;
  if (!personMatchesStatus(person, query.status)) return false;
  if (query.q?.trim()) {
    const needle = query.q.trim().toLowerCase();
    const haystack = [
      person.full_name,
      person.national_id,
      person.city,
      person.state,
      person.last_seen_location,
      person.description,
      person.contact_phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export async function fetchMissingPersonsLive(query: MissingPersonsLiveQuery = {}) {
  const { persons } = await loadAllFromAdapters();
  const filtered = persons.filter((person) => matchesQuery(person, query));
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

export async function fetchMissingPersonsLiveStats(): Promise<MissingPersonsHubStats> {
  const { persons, totalReports } = await loadAllFromAdapters();
  const bySource = new Map<string, number>();

  for (const person of persons) {
    for (const source of person.sources) {
      bySource.set(source.source_slug, (bySource.get(source.source_slug) ?? 0) + 1);
    }
  }

  const missing = persons.filter(
    (person) => person.verification_status !== "found" && person.verification_status !== "deceased"
  ).length;
  const found = persons.filter((person) => person.verification_status === "found").length;

  return normalizeHubStats({
    total_reports: totalReports,
    missing,
    found,
    sources: [...bySource.entries()].map(([slug, records]) => ({
      slug,
      name: SOURCE_LABELS[slug] ?? slug,
      records,
      platform_count: null,
    })),
  });
}
