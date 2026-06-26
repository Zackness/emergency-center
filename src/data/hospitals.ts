import type { Hospital, OperationalStatus } from "@/types";
import { SOCIAL_MIN_SALUD } from "@/data/official-social";
import hospitalsData from "@/data/hospitals-venezuela.json";

interface HospitalFacilityRecord {
  external_id?: string;
  osm_id?: string;
  source?: string;
  name: string;
  facility_type: "hospital" | "clinic";
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  google_maps_url?: string | null;
}

const TIMESTAMP = hospitalsData.generated_at;

const HOSPITAL_OVERRIDES: { match: string; data: Partial<Hospital> }[] = [
  {
    match: "Hospital Universitario de Caracas",
    data: {
      address: "Av. Panteón, San José, Caracas",
      phone: "0212-605-8811",
      status: "operational",
      services: ["emergencias", "trauma", "cirugía", "hospital"],
      notes: "Atendiendo emergencias sísmicas",
      is_verified: true,
    },
  },
  {
    match: "Hospital Vargas de Caracas",
    data: {
      address: "Av. Panteón, San José, Caracas",
      phone: "0212-861-1711",
      status: "limited",
      services: ["emergencias", "pediatría", "hospital"],
      notes: "Operación limitada por daños estructurales parciales",
      is_verified: true,
    },
  },
];

function facilityId(record: HospitalFacilityRecord): string {
  const raw = record.external_id ?? record.osm_id ?? record.name;
  return raw.replace(/\//g, "-").replace(/^places\//, "gmaps-");
}

function toHospital(record: HospitalFacilityRecord): Hospital {
  const override = HOSPITAL_OVERRIDES.find((item) => item.match === record.name)?.data;
  const facilityTag = record.facility_type === "hospital" ? "hospital" : "clínica";

  return {
    id: facilityId(record),
    name: record.name,
    state: record.state,
    city: record.city,
    address: record.address,
    latitude: record.latitude,
    longitude: record.longitude,
    phone: override?.phone ?? record.phone,
    status: (override?.status as OperationalStatus | undefined) ?? "unknown",
    services: override?.services ?? [facilityTag],
    notes: override?.notes ?? null,
    social_links: override?.is_verified ? SOCIAL_MIN_SALUD : [],
    is_verified: override?.is_verified ?? false,
    is_active: true,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  };
}

export const VENEZUELA_HOSPITALS: Hospital[] = (
  hospitalsData.facilities as HospitalFacilityRecord[]
).map(toHospital);

export function getHospitalsCatalog(): Hospital[] {
  return VENEZUELA_HOSPITALS;
}

export const HOSPITALS_DATA_SOURCE = hospitalsData.source;
export const HOSPITALS_DATA_ATTRIBUTION =
  "attribution" in hospitalsData
    ? (hospitalsData as { attribution?: string }).attribution
    : undefined;
export const HOSPITALS_DATA_GENERATED_AT = hospitalsData.generated_at;
export const HOSPITALS_TOTAL_COUNT = hospitalsData.count;
