import type { LinkCategory, Prisma } from "@prisma/client";
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
import { normalizeNationalId } from "@/lib/missing-persons/normalize";
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
  if (!isDatabaseConfigured()) {
    const { mergeHelpCenters } = await import("@/lib/help-centers/feed");
    const { LOCAL_CENTROACOPIO_CENTERS } = await import("@/data/centroacopio-local");
    return mergeHelpCenters(SEED_HELP_CENTERS, LOCAL_CENTROACOPIO_CENTERS);
  }
  try {
    const rows = await prisma.helpCenter.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    const mapped = rows.length ? rows.map(mapHelpCenter) : SEED_HELP_CENTERS;
    const { mergeHelpCenters } = await import("@/lib/help-centers/feed");
    const { LOCAL_CENTROACOPIO_CENTERS } = await import("@/data/centroacopio-local");
    return mergeHelpCenters(mapped, LOCAL_CENTROACOPIO_CENTERS);
  } catch {
    const { mergeHelpCenters } = await import("@/lib/help-centers/feed");
    const { LOCAL_CENTROACOPIO_CENTERS } = await import("@/data/centroacopio-local");
    return mergeHelpCenters(SEED_HELP_CENTERS, LOCAL_CENTROACOPIO_CENTERS);
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
        imageUrl: data.image_url ?? null,
        imageUrls: data.image_url ? [data.image_url] : [],
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

/** Fuentes externas con cifras en vivo desde las APIs de cada plataforma (cuando existen). */
export async function fetchExternalSourcesWithLiveStats() {
  const sources = await fetchExternalSources();
  const { fetchLivePlatformStats } = await import("@/lib/missing-persons/platform-stats");
  const live = await fetchLivePlatformStats();

  return sources.map((source) => {
    const platformStats = live.get(source.slug);
    if (!platformStats) return source;

    return {
      ...source,
      approximate_count: platformStats.approximate_count ?? source.approximate_count,
      count_pending: platformStats.count_pending ?? source.count_pending,
      count_located: platformStats.count_located ?? source.count_located,
      last_updated_at: new Date().toISOString(),
    };
  });
}

export interface MissingPersonsQuery {
  q?: string;
  state?: string;
  status?: "all" | "missing" | "found";
  page?: number;
  limit?: number;
}

function buildMissingPersonStatusWhere(
  status: MissingPersonsQuery["status"] = "all"
): Prisma.MissingPersonWhereInput {
  if (status === "missing") {
    return {
      isActive: true,
      verificationStatus: { notIn: ["found", "deceased"] },
    };
  }
  if (status === "found") {
    return { verificationStatus: "found" };
  }
  return {};
}

function buildMissingPersonSearchOr(q: string): Prisma.MissingPersonWhereInput[] {
  const clauses: Prisma.MissingPersonWhereInput[] = [
    { fullName: { contains: q, mode: "insensitive" } },
    { city: { contains: q, mode: "insensitive" } },
    { lastSeenLocation: { contains: q, mode: "insensitive" } },
  ];
  const cedula = normalizeNationalId(q);
  if (cedula) {
    clauses.push({ nationalId: { contains: cedula } });
  }
  return clauses;
}

export async function fetchMissingPersons(query: MissingPersonsQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 24));
  const status = query.status ?? "all";

  try {
    const { fetchMissingPersonsPaginated } = await import("@/lib/missing-persons/paginated-feed");
    const result = await fetchMissingPersonsPaginated({ ...query, status, page, limit });
    return result.items;
  } catch (err) {
    console.error("[missing-persons] paginated list failed, trying database:", err);
  }

  if (!isDatabaseConfigured()) return [];

  try {
    const skip = (page - 1) * limit;
    const where: Prisma.MissingPersonWhereInput = {
      ...buildMissingPersonStatusWhere(status),
      ...(query.state ? { state: query.state } : {}),
      ...(query.q
        ? {
            OR: buildMissingPersonSearchOr(query.q),
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

    return rows.map(mapMissingPersonWithSources);
  } catch {
    return [];
  }
}

export async function countMissingPersons(
  query: Pick<MissingPersonsQuery, "q" | "state" | "status"> = {}
) {
  const status = query.status ?? "all";

  try {
    const { fetchMissingPersonsPaginated } = await import("@/lib/missing-persons/paginated-feed");
    const result = await fetchMissingPersonsPaginated({ ...query, status, page: 1, limit: 1 });
    return result.total;
  } catch (err) {
    console.error("[missing-persons] paginated count failed, trying database:", err);
  }

  if (!isDatabaseConfigured()) return 0;

  try {
    return await prisma.missingPerson.count({
      where: {
        ...buildMissingPersonStatusWhere(status),
        ...(query.state ? { state: query.state } : {}),
        ...(query.q
          ? {
              OR: buildMissingPersonSearchOr(query.q),
            }
          : {}),
      },
    });
  } catch {
    return 0;
  }
}

export async function fetchMissingPersonsStats() {
  const { fetchAggregatedPlatformStats } = await import(
    "@/lib/missing-persons/aggregate-platform-stats"
  );

  try {
    return await fetchAggregatedPlatformStats();
  } catch (err) {
    console.error("[missing-persons] aggregated platform stats failed:", err);
  }

  const { normalizeHubStats } = await import("@/lib/missing-persons/hub-stats");
  return normalizeHubStats({ total_reports: 0, missing: 0, found: 0, sources: [] });
}

export async function createMissingPerson(
  data: MissingPersonRegistration
): Promise<CreateMissingPersonResult> {
  if (!isDatabaseConfigured()) {
    return { ok: true, id: "seed", linked: false };
  }

  const { findDuplicatePerson } = await import("@/lib/missing-persons/dedup");

  const nationalId = normalizeNationalId(data.national_id);

  const existingId = await findDuplicatePerson(
    prisma,
    {
      fullName: data.full_name,
      age: data.age,
      contactPhone: data.contact_phone,
      nationalId,
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
        nationalId,
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

/** Datos iniciales del hub /danos (SSR). Si la DB tarda, usa el snapshot local. */
export async function fetchDamageReportsForPage() {
  const { LOCAL_DAMAGE_BUILDINGS } = await import("@/data/damage-buildings");
  const { computeDamageStats } = await import("@/lib/damage-map/feed");
  const { mergePriorityRescueSites } = await import("@/lib/damage-map/merge-priority");

  const localSnapshot = () => {
    const all = mergePriorityRescueSites(LOCAL_DAMAGE_BUILDINGS);
    return {
      items: all,
      total: all.length,
      stats: computeDamageStats(all),
    };
  };

  const timeoutMs = import.meta.env.DEV ? 2500 : 20000;

  try {
    return await Promise.race([
      queryDamageReportsFromDb({ limit: 10000, offset: 0 }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("damage-map page fetch timeout")), timeoutMs);
      }),
    ]);
  } catch (err) {
    if (err instanceof Error && err.message !== "damage-map page fetch timeout") {
      console.error("[damage-map] page fetch failed, using local snapshot:", err);
    }
    return localSnapshot();
  }
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
