import { getAdapter } from "@/lib/missing-persons/adapters";
import { fetchAggregatedPlatformStats } from "@/lib/missing-persons/aggregate-platform-stats";
import {
  findMatchingPersonId,
  registerImportedRecord,
  type PersonIndex,
} from "@/lib/missing-persons/dedup";
import { dedupeSourcesByPlatform } from "@/lib/missing-persons/sources";
import type { ImportedMissingRecord, ImportedPersonStatus } from "@/lib/missing-persons/types";
import type { MissingPersonSourceLink, MissingPersonVerificationStatus, MissingPersonWithSources } from "@/types";

export interface MissingPersonsPaginatedQuery {
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
};

const PAGE_SOURCES = [
  "encuentralos",
  "terremotovenezuela-app",
  "venezuela-te-busca",
] as const;

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

function recordToPerson(record: ImportedMissingRecord, personId: string): MissingPersonWithSources {
  const now = new Date().toISOString();
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
    verification_status: verificationFromRecord(record.status),
    is_active: record.status === "missing",
    created_at: now,
    updated_at: now,
    sources: [sourceLink(record)],
  };
}

function mergeRecord(person: MissingPersonWithSources, record: ImportedMissingRecord): void {
  const link = sourceLink(record);
  if (!person.sources.some((s) => s.id === link.id)) {
    person.sources.push(link);
  }
  if (record.status === "found") {
    person.verification_status = "found";
    person.is_active = false;
  } else if (record.status === "deceased") {
    person.verification_status = "deceased";
    person.is_active = false;
  }
  if (!person.photo_url && record.photoUrl) person.photo_url = record.photoUrl;
  if (!person.national_id && record.nationalId) person.national_id = record.nationalId;
}

function dedupeRecords(records: ImportedMissingRecord[]): MissingPersonWithSources[] {
  const index: PersonIndex = new Map();
  const persons = new Map<string, MissingPersonWithSources>();

  for (const record of records) {
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
    persons.set(personId, recordToPerson(record, personId));
    registerImportedRecord(index, personId, record);
  }

  return [...persons.values()].map((person) => ({
    ...person,
    sources: dedupeSourcesByPlatform(person.sources),
  }));
}

async function fetchSourceRecords(
  slug: string,
  offset: number,
  limit: number,
  status: ImportedPersonStatus
): Promise<ImportedMissingRecord[]> {
  const adapter = getAdapter(slug);
  if (!adapter) return [];

  try {
    if (adapter.fetchPage) {
      const page = await adapter.fetchPage(offset, limit, status);
      return page.items;
    }
    return await adapter.fetchBatch(offset, limit, status);
  } catch (err) {
    console.error(`[missing-persons] page fetch ${slug}/${status} failed:`, err);
    return [];
  }
}

async function searchVenezuelaReporta(query: string): Promise<ImportedMissingRecord[]> {
  if (query.trim().length < 3) return [];
  try {
    const { searchVenezuelaReportaRecords } = await import(
      "@/lib/missing-persons/adapters/venezuela-reporta"
    );
    return searchVenezuelaReportaRecords(query);
  } catch {
    return [];
  }
}

function filterPersons(
  persons: MissingPersonWithSources[],
  query: MissingPersonsPaginatedQuery
): MissingPersonWithSources[] {
  return persons.filter((person) => {
    if (query.state && person.state !== query.state) return false;
    if (query.status === "found" && person.verification_status !== "found") return false;
    if (
      query.status === "missing" &&
      (person.verification_status === "found" || person.verification_status === "deceased")
    ) {
      return false;
    }
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
  });
}

async function listTotal(query: MissingPersonsPaginatedQuery): Promise<number> {
  const stats = await fetchAggregatedPlatformStats();
  if (query.status === "found") return stats.found;
  if (query.status === "missing") return stats.missing;
  return stats.total_reports;
}

/** Consulta paginada directa a las APIs de cada plataforma (sin cargar todo en memoria). */
export async function fetchMissingPersonsPaginated(query: MissingPersonsPaginatedQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 24));
  const offset = (page - 1) * limit;
  const perSource = Math.max(8, Math.ceil(limit / PAGE_SOURCES.length) + 4);

  const statuses: ImportedPersonStatus[] =
    query.status === "found"
      ? ["found"]
      : query.status === "missing"
        ? ["missing"]
        : ["missing", "found"];

  const fetchJobs: Promise<ImportedMissingRecord[]>[] = [];

  for (const slug of PAGE_SOURCES) {
    for (const status of statuses) {
      fetchJobs.push(fetchSourceRecords(slug, offset, perSource, status));
    }
  }

  if (query.q?.trim()) {
    fetchJobs.push(searchVenezuelaReporta(query.q));
  }

  const batches = await Promise.all(fetchJobs);
  const merged = dedupeRecords(batches.flat());
  const filtered = filterPersons(merged, query);
  const total = query.q?.trim() ? filtered.length : await listTotal(query);

  return {
    items: filtered.slice(0, limit),
    total,
    page,
    limit,
  };
}

export async function fetchMissingPersonsPaginatedStats() {
  return fetchAggregatedPlatformStats();
}
