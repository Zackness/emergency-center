import type { PrismaClient } from "@prisma/client";
import { dedupKeys } from "@/lib/missing-persons/normalize";
import type { ImportedMissingRecord } from "@/lib/missing-persons/types";

export type PersonIndex = Map<string, string>;

export interface DedupInput {
  fullName: string;
  age: number | null;
  contactPhone: string;
  nationalId?: string | null;
  photoUrl?: string | null;
  lastSeenLocation?: string | null;
  state?: string | null;
  city?: string | null;
}

export async function buildPersonIndex(prisma: PrismaClient): Promise<PersonIndex> {
  const index: PersonIndex = new Map();
  const persons = await prisma.missingPerson.findMany({
    where: { isActive: true },
    select: {
      id: true,
      fullName: true,
      age: true,
      contactPhone: true,
      nationalId: true,
      photoUrl: true,
      lastSeenLocation: true,
      state: true,
      city: true,
    },
  });

  for (const person of persons) {
    registerDedupKeys(index, person.id, {
      fullName: person.fullName,
      age: person.age,
      contactPhone: person.contactPhone,
      nationalId: person.nationalId,
      photoUrl: person.photoUrl,
      lastSeenLocation: person.lastSeenLocation,
      state: person.state,
      city: person.city,
    });
  }

  const records = await prisma.externalRecord.findMany({
    where: { isActive: true },
    select: {
      missingPersonId: true,
      externalReference: true,
      externalUrl: true,
      source: { select: { slug: true } },
    },
  });

  for (const record of records) {
    if (!record.missingPersonId) continue;
    if (record.externalReference) {
      index.set(`ext:${record.source.slug}:${record.externalReference}`, record.missingPersonId);
    }
    if (record.externalUrl) {
      index.set(`url:${normalizeUrl(record.externalUrl)}`, record.missingPersonId);
    }
  }

  return index;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    return parsed.toString().toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

export function registerDedupKeys(index: PersonIndex, personId: string, input: DedupInput) {
  const keys = dedupKeys({
    fullName: input.fullName,
    age: input.age,
    contactPhone: input.contactPhone,
    nationalId: input.nationalId ?? null,
    photoUrl: input.photoUrl ?? null,
    lastSeenLocation: input.lastSeenLocation ?? null,
    state: input.state ?? null,
    city: input.city ?? null,
  });
  for (const key of keys) {
    if (!index.has(key)) index.set(key, personId);
  }
}

export function registerImportedRecord(index: PersonIndex, personId: string, record: ImportedMissingRecord) {
  registerDedupKeys(index, personId, record);
  index.set(`ext:${record.sourceSlug}:${record.externalId}`, personId);
  if (record.externalUrl) {
    index.set(`url:${normalizeUrl(record.externalUrl)}`, personId);
  }
}

export function findMatchingPersonId(
  index: PersonIndex,
  input: DedupInput,
  external?: { sourceSlug?: string; externalId?: string; externalUrl?: string | null }
): string | null {
  if (external?.sourceSlug && external.externalId) {
    const extKey = `ext:${external.sourceSlug}:${external.externalId}`;
    if (index.has(extKey)) return index.get(extKey)!;
  }

  if (external?.externalUrl) {
    const urlKey = `url:${normalizeUrl(external.externalUrl)}`;
    if (index.has(urlKey)) return index.get(urlKey)!;
  }

  const keys = dedupKeys({
    fullName: input.fullName,
    age: input.age,
    contactPhone: input.contactPhone,
    nationalId: input.nationalId ?? null,
    photoUrl: input.photoUrl ?? null,
    lastSeenLocation: input.lastSeenLocation ?? null,
    state: input.state ?? null,
    city: input.city ?? null,
  });
  for (const key of keys) {
    const id = index.get(key);
    if (id) return id;
  }

  return null;
}

export function findImportedMatch(index: PersonIndex, record: ImportedMissingRecord): string | null {
  return findMatchingPersonId(index, record, {
    sourceSlug: record.sourceSlug,
    externalId: record.externalId,
    externalUrl: record.externalUrl,
  });
}

/** Busca si ya existe una persona (formulario web o importación previa). */
export async function findDuplicatePerson(
  prisma: PrismaClient,
  input: DedupInput,
  external?: { sourceSlug?: string; externalId?: string; externalUrl?: string | null }
): Promise<string | null> {
  const index = await buildPersonIndex(prisma);
  return findMatchingPersonId(index, input, external);
}

/** True si el registro externo ya fue importado (re-ejecución del scraper). */
export async function isExternalRecordImported(
  prisma: PrismaClient,
  sourceId: string,
  externalId: string
): Promise<boolean> {
  const existing = await prisma.externalRecord.findFirst({
    where: {
      sourceId,
      externalReference: externalId,
      isActive: true,
      missingPersonId: { not: null },
    },
    select: { id: true },
  });
  return Boolean(existing);
}
