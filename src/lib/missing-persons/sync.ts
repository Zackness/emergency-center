import type { PrismaClient } from "@prisma/client";
import { SEED_EXTERNAL_SOURCES } from "@/data/external-sources";
import { normalizeHubStats } from "@/lib/missing-persons/hub-stats";
import { getAdapter } from "@/lib/missing-persons/adapters";
import { resolveMissingPersonSyncSlugsAsync } from "@/lib/missing-persons/sync-source-registry";
import {
  buildPersonIndex,
  findImportedMatch,
  isExternalRecordImported,
  registerImportedRecord,
  type PersonIndex,
} from "@/lib/missing-persons/dedup";
import type {
  ImportedMissingRecord,
  SyncOptions,
  SyncResult,
} from "@/lib/missing-persons/types";

function verificationFromStatus(status: ImportedMissingRecord["status"]) {
  if (status === "found") return "found" as const;
  if (status === "deceased") return "deceased" as const;
  return "unverified" as const;
}

async function ensureExternalSources(prisma: PrismaClient) {
  for (const source of SEED_EXTERNAL_SOURCES) {
    await prisma.externalSource.upsert({
      where: { slug: source.slug },
      create: {
        slug: source.slug,
        name: source.name,
        description: source.description,
        url: source.url,
        registrationType: source.registration_type,
        approximateCount: source.approximate_count,
        countPending: source.count_pending,
        countLocated: source.count_located,
        lastUpdatedAt: source.last_updated_at ? new Date(source.last_updated_at) : null,
        status: source.status,
        isVerified: source.is_verified,
        isActive: source.is_active,
        sortOrder: source.sort_order,
      },
      update: {
        name: source.name,
        description: source.description,
        url: source.url,
        approximateCount: source.approximate_count,
        countPending: source.count_pending,
        countLocated: source.count_located,
      },
    });
  }
}

async function upsertRecord(
  prisma: PrismaClient,
  record: ImportedMissingRecord,
  sourceId: string,
  personId: string
): Promise<"created" | "linked" | "updated"> {
  const existing = await prisma.externalRecord.findFirst({
    where: {
      sourceId,
      externalReference: record.externalId,
    },
  });

  if (existing) {
    await prisma.externalRecord.update({
      where: { id: existing.id },
      data: {
        missingPersonId: personId,
        displayName: record.fullName,
        externalUrl: record.externalUrl,
        isActive: record.status === "missing",
        lastVerifiedAt: new Date(),
      },
    });
    return existing.missingPersonId === personId ? "updated" : "linked";
  }

  await prisma.externalRecord.create({
    data: {
      missingPersonId: personId,
      sourceId,
      externalReference: record.externalId,
      externalUrl: record.externalUrl,
      displayName: record.fullName,
      notes: `Importado desde ${record.sourceSlug}`,
      lastVerifiedAt: new Date(),
      isActive: record.status === "missing",
    },
  });
  return "created";
}

async function processRecord(
  prisma: PrismaClient,
  record: ImportedMissingRecord,
  sourceId: string,
  index: PersonIndex
): Promise<"created" | "linked" | "updated" | "skipped"> {
  if (record.status !== "missing") {
    const existing = await prisma.externalRecord.findFirst({
      where: { sourceId, externalReference: record.externalId },
    });
    if (!existing?.missingPersonId) return "skipped";
    await prisma.missingPerson.update({
      where: { id: existing.missingPersonId },
      data: {
        verificationStatus: verificationFromStatus(record.status),
        isActive: false,
      },
    });
    return "updated";
  }

  if (await isExternalRecordImported(prisma, sourceId, record.externalId)) {
    const existing = await prisma.externalRecord.findFirst({
      where: { sourceId, externalReference: record.externalId },
      select: { missingPersonId: true },
    });
    if (existing?.missingPersonId) {
      await prisma.missingPerson.update({
        where: { id: existing.missingPersonId },
        data: {
          photoUrl: record.photoUrl ?? undefined,
          description: record.description ?? undefined,
          lastSeenLocation: record.lastSeenLocation ?? undefined,
          nationalId: record.nationalId ?? undefined,
        },
      });
      await upsertRecord(prisma, record, sourceId, existing.missingPersonId);
      return "updated";
    }
    return "skipped";
  }

  let personId = findImportedMatch(index, record);

  if (!personId) {
    const person = await prisma.missingPerson.create({
      data: {
        fullName: record.fullName,
        nationalId: record.nationalId,
        age: record.age,
        gender: record.gender,
        state: record.state,
        city: record.city,
        lastSeenLocation: record.lastSeenLocation,
        lastSeenAt: record.lastSeenAt,
        description: record.description,
        photoUrl: record.photoUrl,
        contactName: record.contactName,
        contactPhone: record.contactPhone,
        contactEmail: record.contactEmail,
        verificationStatus: "unverified",
      },
    });
    personId = person.id;
    registerImportedRecord(index, personId, record);
    await upsertRecord(prisma, record, sourceId, personId);
    return "created";
  }

  await prisma.missingPerson.update({
    where: { id: personId },
    data: {
      photoUrl: record.photoUrl ?? undefined,
      description: record.description ?? undefined,
      lastSeenLocation: record.lastSeenLocation ?? undefined,
      nationalId: record.nationalId ?? undefined,
    },
  });

  const result = await upsertRecord(prisma, record, sourceId, personId);
  registerImportedRecord(index, personId, record);
  return result === "created" ? "linked" : result;
}

async function syncSource(
  prisma: PrismaClient,
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

  const source = await prisma.externalSource.findUnique({
    where: { slug: adapterSlug },
  });

  if (!source) {
    result.errors.push(`Fuente no registrada en BD: ${adapterSlug}`);
    return result;
  }

  const batchSize = options.batchSize ?? 200;
  const fetchAll = Boolean(options.fetchAll || options.all);
  const maxRecords = fetchAll
    ? options.limit ?? Number.POSITIVE_INFINITY
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
        const action = await processRecord(prisma, record, source.id, index);
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

  await prisma.externalSource.update({
    where: { id: source.id },
    data: {
      lastUpdatedAt: new Date(),
    },
  });

  return result;
}

export async function syncMissingPersons(
  prisma: PrismaClient,
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  await ensureExternalSources(prisma);

  const slugs = await resolveMissingPersonSyncSlugsAsync(options.sourceSlugs);

  const index = await buildPersonIndex(prisma);
  const results: SyncResult[] = [];

  for (const slug of slugs) {
    results.push(await syncSource(prisma, slug, options, index));
  }

  return results;
}

export async function getMissingPersonsStats(prisma: PrismaClient) {
  const [missing, found, totalRecords, bySource] = await Promise.all([
    prisma.missingPerson.count({
      where: {
        isActive: true,
        verificationStatus: { notIn: ["found", "deceased"] },
      },
    }),
    prisma.missingPerson.count({
      where: { verificationStatus: "found" },
    }),
    prisma.externalRecord.count(),
    prisma.externalRecord.groupBy({
      by: ["sourceId"],
      _count: { id: true },
    }),
  ]);

  const sources = await prisma.externalSource.findMany({
    where: { slug: { not: "startupven" } },
    select: { id: true, slug: true, name: true, approximateCount: true },
  });

  const sourceMap = new Map(sources.map((s) => [s.id, s]));

  return normalizeHubStats({
    total_reports: totalRecords,
    missing,
    found,
    sources: bySource.map((row) => {
      const src = sourceMap.get(row.sourceId);
      return {
        slug: src?.slug ?? "unknown",
        name: src?.name ?? "Desconocido",
        records: row._count.id,
        platform_count: src?.approximateCount ?? null,
      };
    }),
  });
}
