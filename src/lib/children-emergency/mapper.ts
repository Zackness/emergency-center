import type { ChildCustodyStatus, ChildEmergencyCase, ChildHealthStatus } from "./types";
import type { NexosignalRawRecord } from "./nexosignal";
import { NEXOSIGNAL_SOURCE } from "./nexosignal";
import type { RedAyudaNinoCaso } from "./redayuda";
import { REDAYUDA_NINOS_SOURCE } from "./redayuda";

function mapNexosignalHealth(raw: string | null): ChildHealthStatus {
  const value = raw?.trim().toLowerCase() ?? "";
  if (value === "estable") return "stable";
  if (value === "crítico" || value === "critico") return "critical";
  if (value === "sin identificar") return "unidentified";
  return "unknown";
}

function mapRedAyudaCustody(raw: string | null): ChildCustodyStatus | null {
  if (raw === "bajo_resguardo") return "under_care";
  return raw ? "unknown" : null;
}

function formatAge(value: number | string | null | undefined): string | null {
  if (value == null || value === "") return null;
  return String(value).trim() || null;
}

export function nexosignalToCase(record: NexosignalRawRecord, syncedAt: string): ChildEmergencyCase {
  const reportedAt = record.created_at;
  return {
    id: `nexosignal:${record.id}`,
    source: "nexosignal",
    external_id: String(record.id),
    name: record.nombre?.trim() || "Sin identificar",
    age: formatAge(record.edad),
    health_status: mapNexosignalHealth(record.estado_salud),
    custody_status: "under_care",
    hospital: record.hospital?.trim() || null,
    found_location: record.encontrado_en?.trim() || null,
    child_statement: record.dice_de_si?.trim() || null,
    contact_phone: record.telefono_contacto?.trim() || null,
    photo_url: record.foto_url?.trim() || null,
    reported_at: reportedAt,
    source_name: NEXOSIGNAL_SOURCE.name,
    source_url: NEXOSIGNAL_SOURCE.url,
    is_active: true,
    updated_at: syncedAt,
  };
}

export function redayudaToCase(record: RedAyudaNinoCaso, syncedAt: string): ChildEmergencyCase {
  return {
    id: `redayuda:${record.id}`,
    source: "redayuda",
    external_id: record.id,
    name: record.title?.trim() || "Sin identificar",
    age: formatAge(record.edad),
    health_status: "unknown",
    custody_status: mapRedAyudaCustody(record.estado_custodia),
    hospital: null,
    found_location: null,
    child_statement: null,
    contact_phone: null,
    photo_url: record.photo_url?.trim() || null,
    reported_at: record.created_at,
    source_name: REDAYUDA_NINOS_SOURCE.name,
    source_url: REDAYUDA_NINOS_SOURCE.url,
    is_active: true,
    updated_at: syncedAt,
  };
}

export type ImportedChildRecord =
  | { source: "nexosignal"; item: NexosignalRawRecord }
  | { source: "redayuda"; item: RedAyudaNinoCaso };

export function importedToChildCase(entry: ImportedChildRecord, syncedAt: string): ChildEmergencyCase {
  return entry.source === "nexosignal"
    ? nexosignalToCase(entry.item, syncedAt)
    : redayudaToCase(entry.item, syncedAt);
}
