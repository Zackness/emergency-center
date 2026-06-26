import type { Prisma } from "@prisma/client";
import { LinkCategory } from "@prisma/client";
import { SEED_EXTERNAL_SOURCES } from "@/data/external-sources";
import { SEED_DAMAGE_REPORTS } from "@/data/damage-reports";
import { getHospitalsCatalog, HOSPITALS_TOTAL_COUNT } from "@/data/hospitals";
import { SEED_MISSING_PERSONS } from "@/data/missing-persons";
import {
  SEED_AGENCIES,
  SEED_EXTERNAL_LINKS,
  SEED_HELP_CENTERS,
  SEED_NEWS,
  SEED_SHELTERS,
} from "@/data/seed";
import {
  mapAgency,
  mapDamageReport,
  mapExternalLink,
  mapExternalSource,
  mapHelpCenter,
  mapHospital,
  mapMissingPersonWithSources,
  mapNewsItem,
  mapShelter,
} from "@/lib/mappers";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type {
  CreateMissingPersonResult,
  DamageReport,
  DamageReportRegistration,
  HelpCenterRegistration,
  MissingPersonRegistration,
} from "@/types";

function isDamageReportDbReady(): boolean {
  return (
    isDatabaseConfigured() &&
    typeof (prisma as { damageReport?: { findMany?: unknown } }).damageReport?.findMany ===
      "function"
  );
}

async function loadDamageReportsLiveFallback(seedOnError = false): Promise<DamageReport[]> {
  const { fetchDamageReportsLive } = await import("@/lib/damage-map/feed");
  return fetchDamageReportsLive(async () => (seedOnError ? SEED_DAMAGE_REPORTS : []));
}

export async function fetchHelpCenters() {
  if (!isDatabaseConfigured()) return SEED_HELP_CENTERS;
  try {
    const rows = await prisma.helpCenter.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    if (!rows.length) return SEED_HELP_CENTERS;
    return rows.map(mapHelpCenter);
  } catch {
    return SEED_HELP_CENTERS;
  }
}

export async function fetchHospitals() {
  const catalog = getHospitalsCatalog();
  if (!isDatabaseConfigured()) return catalog;
  try {
    const rows = await prisma.hospital.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    if (rows.length >= Math.min(200, Math.floor(HOSPITALS_TOTAL_COUNT * 0.25))) {
      return rows.map(mapHospital);
    }
    return catalog;
  } catch {
    return catalog;
  }
}

export async function fetchShelters() {
  if (!isDatabaseConfigured()) return SEED_SHELTERS;
  try {
    const rows = await prisma.shelter.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    if (!rows.length) return SEED_SHELTERS;
    return rows.map(mapShelter);
  } catch {
    return SEED_SHELTERS;
  }
}

export async function fetchAgencies() {
  if (!isDatabaseConfigured()) return SEED_AGENCIES;
  try {
    const rows = await prisma.agency.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    if (!rows.length) return SEED_AGENCIES;
    return rows.map(mapAgency);
  } catch {
    return SEED_AGENCIES;
  }
}

export async function fetchExternalLinks(category: string) {
  const seed = SEED_EXTERNAL_LINKS.filter((l) => l.category === category);
  if (!isDatabaseConfigured()) return seed;
  try {
    const rows = await prisma.externalLink.findMany({
      where: {
        category: category as LinkCategory,
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
    });
    if (!rows.length) return seed;
    return rows.map(mapExternalLink);
  } catch {
    return seed;
  }
}

export async function fetchNews() {
  if (!isDatabaseConfigured()) return SEED_NEWS;
  try {
    const rows = await prisma.newsItem.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: "desc" },
    });
    const dbItems = rows.map(mapNewsItem);
    const seen = new Set<string>();
    return [...dbItems, ...SEED_NEWS]
      .filter((item) => {
        const key = item.source_url.trim().replace(/\/$/, "").toLowerCase();
        if (seen.has(item.id) || seen.has(key)) return false;
        seen.add(item.id);
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  } catch {
    return SEED_NEWS;
  }
}

export async function createVolunteerRegistration(data: {
  name: string;
  city: string;
  state: string;
  profession: string;
  specialty: string | null;
  vehicle: string | null;
  availability: string;
  phone: string;
  email: string;
  location: string | null;
  notes: string | null;
  help_center_id?: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return { id: "seed", ...data };
  }
  return prisma.volunteerRegistration.create({
    data: {
      name: data.name,
      city: data.city,
      state: data.state,
      profession: data.profession,
      specialty: data.specialty,
      vehicle: data.vehicle,
      availability: data.availability,
      phone: data.phone,
      email: data.email,
      location: data.location,
      notes: data.notes,
      helpCenterId: data.help_center_id ?? null,
      status: data.help_center_id ? "pending" : "active",
    },
  });
}

export async function createCompanyRegistration(data: {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  resources: string[];
  description: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return { id: "seed", ...data };
  }
  return prisma.companyRegistration.create({ data });
}

function appendThirdPartyReporterNote(
  description: string | null,
  reporterName: string,
  reporterPhone: string | null
): string {
  const base = description?.trim() ?? "";
  const reporter = `Reportado por ${reporterName}${reporterPhone ? ` (${reporterPhone})` : ""}.`;
  return base ? `${base}\n\n${reporter}` : reporter;
}

export async function createHelpCenterRegistration(
  data: HelpCenterRegistration,
  ownerUserId?: string | null
) {
  if (!isDatabaseConfigured()) {
    return { id: "seed", name: data.name };
  }

  const description =
    data.registration_type === "third_party" && data.reporter_name
      ? appendThirdPartyReporterNote(
          data.description,
          data.reporter_name,
          data.reporter_phone ?? null
        )
      : data.description;

  return prisma.$transaction(async (tx) => {
    const center = await tx.helpCenter.create({
      data: {
        name: data.name,
        description,
        type: data.type,
        state: data.state,
        city: data.city,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        schedule: data.schedule,
        accepts: data.accepts,
        isVerified: false,
        isActive: true,
        createdById: ownerUserId ?? null,
      },
    });

    if (ownerUserId) {
      await tx.helpCenterCoordinator.upsert({
        where: {
          profileId_helpCenterId: {
            profileId: ownerUserId,
            helpCenterId: center.id,
          },
        },
        create: {
          profileId: ownerUserId,
          helpCenterId: center.id,
        },
        update: {},
      });
    }

    return center;
  });
}

export async function createFeatureSuggestion(data: {
  title: string;
  description: string;
  category: string | null;
  contact_name: string | null;
  contact_email: string | null;
}) {
  if (!isDatabaseConfigured()) {
    return { id: "seed", ...data };
  }
  return prisma.featureSuggestion.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      contactName: data.contact_name,
      contactEmail: data.contact_email,
    },
  });
}

export async function getProfileRole(userId: string) {
  if (!isDatabaseConfigured()) return null;
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return profile?.role ?? null;
  } catch {
    return null;
  }
}

export async function fetchExternalSources() {
  const seed = SEED_EXTERNAL_SOURCES.filter((s) => s.slug !== "startupven");
  if (!isDatabaseConfigured()) return seed;
  try {
    const rows = await prisma.externalSource.findMany({
      where: { isActive: true, slug: { not: "startupven" } },
      orderBy: { sortOrder: "asc" },
    });
    if (!rows.length) return seed;
    return rows.map(mapExternalSource);
  } catch {
    return seed;
  }
}

export interface MissingPersonsQuery {
  q?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export async function fetchMissingPersons(query: MissingPersonsQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 24));
  const skip = (page - 1) * limit;

  const fetchLive = async () => {
    const { fetchMissingPersonsLive } = await import("@/lib/missing-persons/live-feed");
    return (await fetchMissingPersonsLive({ ...query, page, limit })).items;
  };

  if (!isDatabaseConfigured()) return fetchLive();

  try {
    const where = {
      isActive: true,
      verificationStatus: { notIn: ["found", "deceased"] as ("found" | "deceased")[] },
      ...(query.state ? { state: query.state } : {}),
      ...(query.q
        ? {
            OR: [
              { fullName: { contains: query.q, mode: "insensitive" as const } },
              { city: { contains: query.q, mode: "insensitive" as const } },
              { lastSeenLocation: { contains: query.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const rows = await prisma.missingPerson.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        externalRecords: {
          where: { isActive: true },
          include: { source: true },
        },
      },
    });

    if (!rows.length && !query.q && !query.state && page === 1) {
      return fetchLive();
    }

    return rows.map(mapMissingPersonWithSources);
  } catch {
    return fetchLive();
  }
}

export async function countMissingPersons(query: Pick<MissingPersonsQuery, "q" | "state"> = {}) {
  const countLive = async () => {
    const { fetchMissingPersonsLive } = await import("@/lib/missing-persons/live-feed");
    return (await fetchMissingPersonsLive({ ...query, page: 1, limit: 1 })).total;
  };

  if (!isDatabaseConfigured()) return countLive();

  try {
    const count = await prisma.missingPerson.count({
      where: {
        isActive: true,
        verificationStatus: { notIn: ["found", "deceased"] },
        ...(query.state ? { state: query.state } : {}),
        ...(query.q
          ? {
              OR: [
                { fullName: { contains: query.q, mode: "insensitive" } },
                { city: { contains: query.q, mode: "insensitive" } },
                { lastSeenLocation: { contains: query.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    });

    if (count === 0 && !query.q && !query.state) {
      return countLive();
    }

    return count;
  } catch {
    return countLive();
  }
}

export async function fetchMissingPersonsStats() {
  const fetchLiveStats = async () => {
    const { fetchMissingPersonsLiveStats } = await import("@/lib/missing-persons/live-feed");
    return fetchMissingPersonsLiveStats();
  };

  if (!isDatabaseConfigured()) return fetchLiveStats();

  try {
    const { getMissingPersonsStats } = await import("@/lib/missing-persons/sync");
    const stats = await getMissingPersonsStats(prisma);
    if (stats.unique_active > 0) return stats;
    return fetchLiveStats();
  } catch {
    return fetchLiveStats();
  }
}

export async function createMissingPerson(
  data: MissingPersonRegistration
): Promise<CreateMissingPersonResult> {
  if (!isDatabaseConfigured()) {
    return { ok: true, id: "seed", linked: false };
  }

  const { findDuplicatePerson } = await import("@/lib/missing-persons/dedup");

  const existingId = await findDuplicatePerson(
    prisma,
    {
      fullName: data.full_name,
      age: data.age,
      contactPhone: data.contact_phone,
    },
    {
      sourceSlug: data.external_source_slug ?? undefined,
      externalUrl: data.external_url,
    }
  );

  if (existingId) {
    const existing = await prisma.missingPerson.findUnique({
      where: { id: existingId },
      select: { id: true, fullName: true },
    });
    if (existing) {
      await linkBackupRecords(existing.id, data);
      return {
        ok: false,
        duplicate: true,
        existing_id: existing.id,
        full_name: existing.fullName,
      };
    }
  }

  const person = await prisma.$transaction(async (tx) => {
    const created = await tx.missingPerson.create({
      data: {
        fullName: data.full_name,
        age: data.age,
        gender: data.gender,
        state: data.state,
        city: data.city,
        lastSeenLocation: data.last_seen_location,
        lastSeenAt: data.last_seen_at ? new Date(data.last_seen_at) : null,
        description: data.description,
        photoUrl: data.photo_url,
        contactName: data.contact_name,
        contactPhone: data.contact_phone,
        contactEmail: data.contact_email,
      },
    });

    await createBackupExternalRecords(tx, created.id, data);
    return created;
  });

  return { ok: true, id: person.id, linked: false };
}

async function createBackupExternalRecords(
  tx: Prisma.TransactionClient,
  personId: string,
  data: MissingPersonRegistration
) {
  const startupvenSource = await tx.externalSource.findUnique({
    where: { slug: "startupven" },
  });

  if (startupvenSource) {
    const existingBackup = await tx.externalRecord.findFirst({
      where: { missingPersonId: personId, sourceId: startupvenSource.id },
    });
    if (!existingBackup) {
      await tx.externalRecord.create({
        data: {
          missingPersonId: personId,
          sourceId: startupvenSource.id,
          displayName: data.full_name,
          notes: "Registro de respaldo en StartupVen Responde",
        },
      });
    }
  }

  if (data.external_source_slug && data.external_url) {
    const externalSource = await tx.externalSource.findUnique({
      where: { slug: data.external_source_slug },
    });
    if (externalSource) {
      const existingLink = await tx.externalRecord.findFirst({
        where: {
          missingPersonId: personId,
          sourceId: externalSource.id,
          externalUrl: data.external_url,
        },
      });
      if (!existingLink) {
        await tx.externalRecord.create({
          data: {
            missingPersonId: personId,
            sourceId: externalSource.id,
            externalUrl: data.external_url,
            displayName: data.full_name,
            notes: "Enlace a registro en plataforma externa",
          },
        });
      }
    }
  }
}

async function linkBackupRecords(personId: string, data: MissingPersonRegistration) {
  try {
    await prisma.$transaction(async (tx) => {
      await createBackupExternalRecords(tx, personId, data);
    });
  } catch {
    // No bloquear la respuesta de duplicado si el enlace falla.
  }
}

export async function fetchDamageReports() {
  if (!isDamageReportDbReady()) {
    return loadDamageReportsLiveFallback(true);
  }
  try {
    const rows = await prisma.damageReport.findMany({
      where: { isActive: true },
      orderBy: [{ sourceSyncedAt: "desc" }, { updatedAt: "desc" }],
    });
    if (rows.length === 0) {
      return loadDamageReportsLiveFallback(false);
    }
    return rows.map(mapDamageReport);
  } catch {
    return loadDamageReportsLiveFallback(true);
  }
}

export async function queryDamageReportsFromDb(query: {
  search?: string;
  severity?: string;
  state?: string;
  limit?: number;
  offset?: number;
}) {
  const { queryDamageReports } = await import("@/lib/damage-map/feed");
  const fetchFromDb = async () => {
    if (!isDamageReportDbReady()) {
      return loadDamageReportsLiveFallback(true);
    }
    try {
      const rows = await prisma.damageReport.findMany({
        where: { isActive: true },
        orderBy: [{ sourceSyncedAt: "desc" }, { updatedAt: "desc" }],
      });
      if (rows.length === 0) {
        return loadDamageReportsLiveFallback(false);
      }
      return rows.map(mapDamageReport);
    } catch (err) {
      console.error("[damage-map] db query failed, falling back to live:", err);
      return loadDamageReportsLiveFallback(true);
    }
  };

  return queryDamageReports(
    {
      search: query.search,
      severity: query.severity as import("@/types").DamageSeverity | "all" | undefined,
      state: query.state,
      limit: query.limit,
      offset: query.offset,
    },
    fetchFromDb
  );
}

export async function createDamageReport(data: DamageReportRegistration) {
  if (!isDatabaseConfigured()) {
    return { id: "seed", ...data };
  }
  return prisma.damageReport.create({
    data: {
      title: data.title,
      severity: data.severity,
      state: data.state,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      reporterName: data.reporter_name,
      reporterContact: data.reporter_contact,
      sourceName: data.source_name,
      sourceUrl: data.source_url,
    },
  });
}
