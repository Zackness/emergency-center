import type { ImportedBuilding } from "@/lib/damage-map/types";
import { inferState, mapExternalDamageLevel } from "@/lib/damage-map/normalize";
import type { YummyDamageReport, YummyHelpCenter } from "./types";
import { YUMMY_SOS_SOURCE_URL } from "./types";

export function mapYummySeverity(severity: string | null | undefined): import("@/types").DamageSeverity {
  const normalized = (severity ?? "moderado").trim().toLowerCase();
  if (normalized === "colapso" || normalized === "collapsed") return "collapsed";
  if (normalized === "severo" || normalized === "severe") return "damaged";
  if (normalized === "moderado" || normalized === "moderate") return "damaged";
  return mapExternalDamageLevel(normalized);
}

export function yummyReportToBuilding(
  report: YummyDamageReport,
  syncedAt: string
): ImportedBuilding {
  const city = report.city?.trim() || "Sin ciudad";
  const address = report.address?.trim() || null;
  const state = report.state?.trim() || inferState(city, address, null);
  const title =
    report.ticket?.trim() ||
    [address, city].filter(Boolean).join(", ") ||
    `Reporte Yummy ${report.id.slice(0, 8)}`;

  return {
    externalId: report.id,
    title,
    address,
    city,
    zone: null,
    state,
    latitude: report.lat,
    longitude: report.lng,
    severity: mapYummySeverity(report.severity),
    imageUrls: [],
    isVerified: report.status === "engineering_assessed",
    sourceSyncedAt: syncedAt,
    sourceUrl: `${YUMMY_SOS_SOURCE_URL}/reportes`,
  };
}

export function yummyCenterToHelpCenterPayload(center: YummyHelpCenter) {
  const descriptionParts = [
    `[[help-source:yummyrides-sos:${center.id}]]`,
    center.additionalInfo?.trim(),
    center.status ? `Estado: ${center.status}` : null,
  ].filter(Boolean);

  return {
    name: center.name.trim(),
    description: descriptionParts.join("\n"),
    type: "community" as const,
    state: center.state?.trim() || inferState(center.city ?? "", center.address, null),
    city: center.city?.trim() || "Sin ciudad",
    address: center.address.trim(),
    latitude: center.lat,
    longitude: center.lng,
    phone: center.phone?.trim() || null,
    schedule: null,
    accepts: ["alimentos", "agua", "medicinas", "ropa", "higiene"],
    is_verified: center.status === "approved",
    is_active: true,
  };
}

export function yummyReportsToBuildings(
  reports: YummyDamageReport[],
  syncedAt: string
): ImportedBuilding[] {
  return reports.map((report) => yummyReportToBuilding(report, syncedAt));
}
