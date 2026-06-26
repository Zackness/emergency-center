import type {
  Agency as AgencyRow,
  DamageReport as DamageReportRow,
  ExternalLink as ExternalLinkRow,
  ExternalRecord as ExternalRecordRow,
  ExternalSource as ExternalSourceRow,
  HelpCenter as HelpCenterRow,
  Hospital as HospitalRow,
  MissingPerson as MissingPersonRow,
  NewsItem as NewsItemRow,
  Shelter as ShelterRow,
} from "@prisma/client";
import type {
  Agency,
  DamageReport,
  ExternalLink,
  ExternalSource,
  HelpCenter,
  Hospital,
  MissingPersonWithSources,
  NewsItem,
  Shelter,
} from "@/types";
import { parseSocialLinks } from "@/types/social";

export function mapHelpCenter(row: HelpCenterRow): HelpCenter {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    state: row.state,
    city: row.city,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    email: row.email,
    schedule: row.schedule,
    accepts: row.accepts,
    image_url: row.imageUrl ?? null,
    image_urls: row.imageUrls?.length
      ? row.imageUrls
      : row.imageUrl
        ? [row.imageUrl]
        : [],
    is_verified: row.isVerified,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    city: row.city,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    status: row.status,
    services: row.services,
    notes: row.notes,
    social_links: parseSocialLinks(row.socialLinks),
    is_verified: row.isVerified,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapShelter(row: ShelterRow): Shelter {
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    city: row.city,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    capacity: row.capacity,
    current_occupancy: row.currentOccupancy,
    services: row.services,
    schedule: row.schedule,
    is_verified: row.isVerified,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapAgency(row: AgencyRow): Agency {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    state: row.state,
    description: row.description,
    phone: row.phone,
    email: row.email,
    website: row.website,
    social_links: parseSocialLinks(row.socialLinks),
    is_verified: row.isVerified,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapExternalLink(row: ExternalLinkRow): ExternalLink {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    category: row.category,
    locale: row.locale,
    is_verified: row.isVerified,
    is_active: row.isActive,
    sort_order: row.sortOrder,
    created_at: row.createdAt.toISOString(),
  };
}

export function mapNewsItem(row: NewsItemRow): NewsItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    source: row.source,
    source_url: row.sourceUrl,
    published_at: row.publishedAt.toISOString(),
    locale: row.locale,
    is_verified: row.isVerified,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
  };
}

export function mapExternalSource(row: ExternalSourceRow): ExternalSource {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    url: row.url,
    registration_type: row.registrationType,
    approximate_count: row.approximateCount,
    count_pending: row.countPending,
    count_located: row.countLocated,
    last_updated_at: row.lastUpdatedAt?.toISOString() ?? null,
    status: row.status,
    is_verified: row.isVerified,
    is_active: row.isActive,
    sort_order: row.sortOrder,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapDamageReport(row: DamageReportRow): DamageReport {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    state: row.state,
    city: row.city,
    address: row.address,
    zone: row.zone,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    reporter_name: row.reporterName,
    reporter_contact: row.reporterContact,
    source_name: row.sourceName,
    source_url: row.sourceUrl,
    image_urls: row.imageUrls,
    external_reference: row.externalReference,
    is_verified: row.isVerified,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    source_synced_at: row.sourceSyncedAt?.toISOString() ?? null,
  };
}

export function mapMissingPersonWithSources(
  row: MissingPersonRow & {
    externalRecords: (ExternalRecordRow & { source: ExternalSourceRow })[];
  }
): MissingPersonWithSources {
  const sources = row.externalRecords.map((record) => ({
    id: record.id,
    source_id: record.sourceId,
    source_name: record.source.name,
    source_slug: record.source.slug,
    external_url: record.externalUrl,
    display_name: record.displayName,
    is_external: record.source.slug !== "startupven",
  }));

  if (!sources.some((s) => s.source_slug === "startupven")) {
    sources.push({
      id: `startupven-${row.id}`,
      source_id: "startupven",
      source_name: "StartupVen Responde",
      source_slug: "startupven",
      external_url: null,
      display_name: "Registro de respaldo",
      is_external: false,
    });
  }

  return {
    id: row.id,
    full_name: row.fullName,
    age: row.age,
    gender: row.gender,
    state: row.state,
    city: row.city,
    last_seen_location: row.lastSeenLocation,
    last_seen_at: row.lastSeenAt?.toISOString() ?? null,
    description: row.description,
    photo_url: row.photoUrl,
    contact_name: row.contactName,
    contact_phone: row.contactPhone,
    contact_email: row.contactEmail,
    verification_status: row.verificationStatus,
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    sources,
  };
}
