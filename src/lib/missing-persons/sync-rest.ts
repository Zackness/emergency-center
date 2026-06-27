import { SEED_EXTERNAL_SOURCES } from "@/data/external-sources";
import { getAdapter } from "@/lib/missing-persons/adapters";
import { resolveMissingPersonSyncSlugsAsync } from "@/lib/missing-persons/sync-source-registry";
import {
  findImportedMatch,
  registerImportedRecord,
  type PersonIndex,
} from "@/lib/missing-persons/dedup";
import type {
  ImportedMissingRecord,
  SyncOptions,
  SyncResult,
} from "@/lib/missing-persons/types";
import {
  getSupabaseRestAdmin,
  restPatch,
  restPost,
  restSelectAll,
  type SupabaseRestAdmin,
} from "@/lib/supabase/rest-admin";

interface ExternalSourceRow {
  id: string;
  slug: string;
  name: string;
  approximate_count: number | null;
}

interface MissingPersonRow {
  id: string;
  full_name: string;
  age: number | null;
  contact_phone: string;
  national_id: string | null;
}

interface ExternalRecordRow {
  id: string;
  missing_person_id: string | null;
  source_id: string;
  external_reference: string | null;
  external_url: string | null;
  source: { slug: string } | null;
}

function verificationFromStatus(status: ImportedMissingRecord["status"]) {
  if (status === "found") return "found" as const;
  if (status === "deceased") return "deceased" as const;
  return "unverified" as const;
}

function encodeEq(value: string): string {
  return encodeURIComponent(value);
}

async function restPostReturning<T>(
  admin: SupabaseRestAdmin,
  table: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${admin.baseUrl}/${table}`, {
    method: "POST",
    headers: {
      ...admin.headers,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`REST POST ${table} (${res.status}): ${await res.text()}`);
  }

  const rows = (await res.json()) as T[];
  const row = rows[0];
  if (!row) throw new Error(`REST POST ${table}: respuesta vacía`);
  return row;
}

async function restSelectFirst<T>(
  admin: SupabaseRestAdmin,
  table: string,
  select: string,
  filterQuery: string
): Promise<T | null> {
  const res = await fetch(
    `${admin.baseUrl}/${table}?select=${encodeURIComponent(select)}&${filterQuery}`,
    {
      headers: {
        ...admin.headers,
        Range: "0-0",
        "Range-Unit": "items",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`REST SELECT ${table} (${res.status}): ${await res.text()}`);
  }

  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

async function ensureExternalSourcesRest(admin: SupabaseRestAdmin) {
  for (const source of SEED_EXTERNAL_SOURCES) {
    await restPost(
      admin,
      "external_sources",
      {
        slug: source.slug,
        name: source.name,
        description: source.description,
        url: source.url,
        registration_type: source.registration_type,
        approximate_count: source.approximate_count,
        count_pending: source.count_pending,
        count_located: source.count_located,
        last_updated_at: source.last_updated_at,
        status: source.status,
        is_verified: source.is_verified,
        is_active: source.is_active,
        sort_order: source.sort_order,
      },
      { onConflict: "slug", merge: true }
    );
  }
}

async function buildPersonIndexRest(admin: SupabaseRestAdmin): Promise<PersonIndex> {
  const index: PersonIndex = new Map();

  const persons = await restSelectAll<MissingPersonRow>(
    admin,
    "missing_persons",
    "id,full_name,age,contact_phone,national_id",
    1000,
    "is_active=eq.true"
  );

  for (const person of persons) {
    registerImportedRecord(index, person.id, {
      sourceSlug: "",
      externalId: "",
      externalUrl: "",
      fullName: person.full_name,
      age: person.age,
      gender: null,
      nationalId: person.national_id,
      state: "",
      city: "",
      lastSeenLocation: null,
      lastSeenAt: null,
      description: null,
      photoUrl: null,
      contactName: "",
      contactPhone: person.contact_phone,
      contactEmail: null,
      status: "missing",
    });
  }

  const records = await restSelectAll<ExternalRecordRow>(
    admin,
    "external_records",
    "missing_person_id,external_reference,external_url,source:external_sources(slug)",
    1000,
    "is_active=eq.true"
  );

  for (const record of records) {
    if (!record.missing_person_id) continue;
    const slug = record.source?.slug;
    if (slug && record.external_reference) {
      index.set(`ext:${slug}:${record.external_reference}`, record.missing_person_id);
    }
    if (record.external_url) {
      try {
        const parsed = new URL(record.external_url.trim());
        parsed.hash = "";
        index.set(`url:${parsed.toString().toLowerCase()}`, record.missing_person_id);
      } catch {
        index.set(`url:${record.external_url.trim().toLowerCase()}`, record.missing_person_id);
      }
    }
  }

  return index;
}

async function isExternalRecordImportedRest(
  admin: SupabaseRestAdmin,
  sourceId: string,
  externalId: string
): Promise<boolean> {
  const row = await restSelectFirst<{ id: string }>(
    admin,
    "external_records",
    "id",
    `source_id=eq.${sourceId}&external_reference=eq.${encodeEq(externalId)}&is_active=eq.true&missing_person_id=not.is.null`
  );
  return Boolean(row);
}

async function upsertRecordRest(
  admin: SupabaseRestAdmin,
  record: ImportedMissingRecord,
  sourceId: string,
  personId: string
): Promise<"created" | "linked" | "updated"> {
  const existing = await restSelectFirst<{
    id: string;
    missing_person_id: string | null;
  }>(
    admin,
    "external_records",
    "id,missing_person_id",
    `source_id=eq.${sourceId}&external_reference=eq.${encodeEq(record.externalId)}`
  );

  const now = new Date().toISOString();

  if (existing) {
    await restPatch(
      admin,
      "external_records",
      `id=eq.${existing.id}`,
      {
        missing_person_id: personId,
        display_name: record.fullName,
        external_url: record.externalUrl,
        is_active: record.status === "missing",
        last_verified_at: now,
      }
    );
    return existing.missing_person_id === personId ? "updated" : "linked";
  }

  await restPost(admin, "external_records", {
    missing_person_id: personId,
    source_id: sourceId,
    external_reference: record.externalId,
    external_url: record.externalUrl,
    display_name: record.fullName,
    notes: `Importado desde ${record.sourceSlug}`,
    last_verified_at: now,
    is_active: record.status === "missing",
  });
  return "created";
}

async function processRecordRest(
  admin: SupabaseRestAdmin,
  record: ImportedMissingRecord,
  sourceId: string,
  index: PersonIndex
): Promise<"created" | "linked" | "updated" | "skipped"> {
  if (record.status !== "missing") {
    const existing = await restSelectFirst<{ id: string; missing_person_id: string | null }>(
      admin,
      "external_records",
      "id,missing_person_id",
      `source_id=eq.${sourceId}&external_reference=eq.${encodeEq(record.externalId)}`
    );
    if (!existing?.missing_person_id) return "skipped";
    await restPatch(admin, "missing_persons", `id=eq.${existing.missing_person_id}`, {
      verification_status: verificationFromStatus(record.status),
      is_active: false,
    });
    return "updated";
  }

  if (await isExternalRecordImportedRest(admin, sourceId, record.externalId)) {
    const existing = await restSelectFirst<{ missing_person_id: string | null }>(
      admin,
      "external_records",
      "missing_person_id",
      `source_id=eq.${sourceId}&external_reference=eq.${encodeEq(record.externalId)}`
    );
    if (existing?.missing_person_id) {
      await restPatch(admin, "missing_persons", `id=eq.${existing.missing_person_id}`, {
        ...(record.photoUrl ? { photo_url: record.photoUrl } : {}),
        ...(record.description ? { description: record.description } : {}),
        ...(record.lastSeenLocation ? { last_seen_location: record.lastSeenLocation } : {}),
        ...(record.nationalId ? { national_id: record.nationalId } : {}),
      });
      await upsertRecordRest(admin, record, sourceId, existing.missing_person_id);
      return "updated";
    }
    return "skipped";
  }

  let personId = findImportedMatch(index, record);

  if (!personId) {
    const person = await restPostReturning<{ id: string }>(admin, "missing_persons", {
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
      verification_status: "unverified",
    });
    personId = person.id;
    registerImportedRecord(index, personId, record);
    await upsertRecordRest(admin, record, sourceId, personId);
    return "created";
  }

  await restPatch(admin, "missing_persons", `id=eq.${personId}`, {
    ...(record.photoUrl ? { photo_url: record.photoUrl } : {}),
    ...(record.description ? { description: record.description } : {}),
    ...(record.lastSeenLocation ? { last_seen_location: record.lastSeenLocation } : {}),
    ...(record.nationalId ? { national_id: record.nationalId } : {}),
  });

  const result = await upsertRecordRest(admin, record, sourceId, personId);
  registerImportedRecord(index, personId, record);
  return result === "created" ? "linked" : result;
}

async function syncSourceRest(
  admin: SupabaseRestAdmin,
  adapterSlug: string,
  options: SyncOptions,
  index: PersonIndex
): Promise<SyncResult> {
  const adapter = getAdapter(adapterSlug);
  const result: SyncResult = {
    source: adapterSlug,
    fetched: 0,
    created: 0,
    linked: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (!adapter) {
    result.errors.push(`Adaptador no encontrado: ${adapterSlug}`);
    return result;
  }

  const source = await restSelectFirst<ExternalSourceRow>(
    admin,
    "external_sources",
    "id,slug,name,approximate_count",
    `slug=eq.${encodeEq(adapterSlug)}`
  );

  if (!source) {
    result.errors.push(`Fuente no registrada en BD: ${adapterSlug}`);
    return result;
  }

  const batchSize = options.batchSize ?? 200;
  const fetchAll = Boolean(options.fetchAll || options.all);
  const maxRecords = fetchAll
    ? (options.limit ?? Number.POSITIVE_INFINITY)
    : (options.limit ?? 500);
  let offset = options.offset ?? 0;
  let fetched = 0;

  while (fetched < maxRecords) {
    const take = Math.min(batchSize, maxRecords - fetched);
    let batch: ImportedMissingRecord[];

    try {
      batch = await adapter.fetchBatch(offset, take);
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : String(err));
      break;
    }

    if (!batch.length) break;

    for (const record of batch) {
      try {
        const action = await processRecordRest(admin, record, source.id, index);
        result.fetched += 1;
        if (action === "created") result.created += 1;
        else if (action === "linked") result.linked += 1;
        else if (action === "updated") result.updated += 1;
        else result.skipped += 1;
      } catch (err) {
        result.errors.push(
          `${record.externalId}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    offset += batch.length;
    fetched += batch.length;

    if (batch.length < take) break;
  }

  await restPatch(admin, "external_sources", `id=eq.${source.id}`, {
    last_updated_at: new Date().toISOString(),
  });

  return result;
}

export async function syncMissingPersonsRest(
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  const admin = getSupabaseRestAdmin();
  await ensureExternalSourcesRest(admin);

  const slugs = await resolveMissingPersonSyncSlugsAsync(options.sourceSlugs);

  const index = await buildPersonIndexRest(admin);
  const results: SyncResult[] = [];

  for (const slug of slugs) {
    results.push(await syncSourceRest(admin, slug, options, index));
  }

  return results;
}

export async function getMissingPersonsStatsRest() {
  const admin = getSupabaseRestAdmin();

  const [activePersons, externalRecords, sources] = await Promise.all([
    restSelectAll<{ id: string }>(
      admin,
      "missing_persons",
      "id",
      1000,
      "is_active=eq.true&verification_status=not.in.(found,deceased)"
    ),
    restSelectAll<{ id: string; source_id: string }>(
      admin,
      "external_records",
      "id,source_id",
      1000,
      "is_active=eq.true"
    ),
    restSelectAll<ExternalSourceRow>(
      admin,
      "external_sources",
      "id,slug,name,approximate_count",
      100,
      "slug=neq.startupven"
    ),
  ]);

  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const bySource = new Map<string, number>();
  for (const row of externalRecords) {
    bySource.set(row.source_id, (bySource.get(row.source_id) ?? 0) + 1);
  }

  return {
    unique_active: activePersons.length,
    total_external_records: externalRecords.length,
    sources: [...bySource.entries()].map(([sourceId, count]) => {
      const src = sourceMap.get(sourceId);
      return {
        slug: src?.slug ?? "unknown",
        name: src?.name ?? "Desconocido",
        records: count,
        platform_count: src?.approximate_count ?? null,
      };
    }),
  };
}
