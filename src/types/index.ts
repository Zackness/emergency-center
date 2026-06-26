import type { SocialLink } from "@/types/social";

export type UserRole = "admin" | "editor" | "volunteer";

export type OperationalStatus = "operational" | "limited" | "closed" | "unknown";

export type HelpCenterType =
  | "church"
  | "community"
  | "university"
  | "government"
  | "ngo";

export type AgencyCategory =
  | "civil_protection"
  | "firefighters"
  | "red_cross"
  | "police"
  | "government"
  | "mayor";

export interface HelpCenter {
  id: string;
  name: string;
  description: string | null;
  type: HelpCenterType;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  schedule: string | null;
  accepts: string[];
  image_url?: string | null;
  image_urls?: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type HelpCenterRegistrationType = "own" | "third_party";

export interface HelpCenterRegistration {
  registration_type: HelpCenterRegistrationType;
  name: string;
  description: string | null;
  type: HelpCenterType;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  schedule: string | null;
  accepts: string[];
  reporter_name?: string | null;
  reporter_phone?: string | null;
}

export interface Hospital {
  id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  status: OperationalStatus;
  services: string[];
  notes: string | null;
  social_links: SocialLink[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  capacity: number | null;
  current_occupancy: number | null;
  services: string[];
  schedule: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  category: AgencyCategory;
  state: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  social_links: SocialLink[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExternalLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: "missing" | "pets" | "news" | "official" | "tools";
  locale: "es" | "en" | "both";
  is_verified: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  published_at: string;
  locale: "es" | "en" | "both";
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface EmergencyNumber {
  id: string;
  label_es: string;
  label_en: string;
  number: string;
  sort_order: number;
}

export interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "help_center" | "hospital" | "shelter" | "damage";
  status?: OperationalStatus;
  address?: string;
  severity?: DamageSeverity;
}

export type DamageSeverity = "collapsed" | "damaged" | "evacuated";

export interface DamageReport {
  id: string;
  title: string;
  severity: DamageSeverity;
  state: string;
  city: string;
  address: string | null;
  zone?: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  reporter_name: string | null;
  reporter_contact: string | null;
  source_name: string | null;
  source_url: string | null;
  image_urls?: string[];
  external_reference?: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  source_synced_at?: string | null;
}

export interface DamageReportRegistration {
  title: string;
  severity: DamageSeverity;
  state: string;
  city: string;
  address: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  reporter_name: string | null;
  reporter_contact: string | null;
  source_name: string | null;
  source_url: string | null;
}

export interface VolunteerRegistration {
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
}

export interface CompanyRegistration {
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  resources: string[];
  description: string | null;
}

export type SourceRegistrationType =
  | "official"
  | "community"
  | "ngo"
  | "social_media"
  | "form";

export type ExternalSourceStatus = "active" | "down" | "unverified";

export type MissingPersonVerificationStatus =
  | "unverified"
  | "family_verified"
  | "org_verified"
  | "found"
  | "deceased";

export interface ExternalSource {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  url: string;
  registration_type: SourceRegistrationType;
  approximate_count: number | null;
  count_pending: number | null;
  count_located: number | null;
  last_updated_at: string | null;
  status: ExternalSourceStatus;
  is_verified: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MissingPersonSourceLink {
  id: string;
  source_id: string;
  source_name: string;
  source_slug: string;
  external_url: string | null;
  display_name: string;
  is_external: boolean;
}

export interface MissingPerson {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  state: string;
  city: string;
  last_seen_location: string | null;
  last_seen_at: string | null;
  description: string | null;
  photo_url: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  verification_status: MissingPersonVerificationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MissingPersonWithSources extends MissingPerson {
  sources: MissingPersonSourceLink[];
}

export interface MissingPersonRegistration {
  full_name: string;
  age: number | null;
  gender: string | null;
  state: string;
  city: string;
  last_seen_location: string | null;
  last_seen_at: string | null;
  description: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  photo_url: string | null;
  external_source_slug: string | null;
  external_url: string | null;
}

export type CreateMissingPersonResult =
  | { ok: true; id: string; linked: boolean }
  | { ok: false; duplicate: true; existing_id: string; full_name: string };
