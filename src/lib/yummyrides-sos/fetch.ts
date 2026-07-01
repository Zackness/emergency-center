import { fetchYummyHtml, parseHomeStats, parseRscObjects } from "./rsc-parser";
import type {
  YummyDamageReport,
  YummyHelpCenter,
  YummySosSnapshot,
} from "./types";
import { YUMMY_SOS_SOURCE_URL } from "./types";

const REPORT_FIELDS = [
  "lat",
  "lng",
  "address",
  "city",
  "state",
  "severity",
  "status",
  "description",
  "ticket",
  "photoCount",
  "createdAt",
  "peopleAtRisk",
];

const CENTER_FIELDS = [
  "lat",
  "lng",
  "address",
  "city",
  "state",
  "name",
  "phone",
  "additionalInfo",
  "status",
  "createdAt",
];

function isDamageReport(item: Record<string, unknown>): item is YummyDamageReport {
  return (
    typeof item.id === "string" &&
    Number.isFinite(item.lat) &&
    Number.isFinite(item.lng)
  );
}

function isHelpCenter(item: Record<string, unknown>): item is YummyHelpCenter {
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    item.name.length > 2 &&
    !item.name.startsWith("Next.") &&
    typeof item.address === "string" &&
    item.address.length > 3 &&
    Number.isFinite(item.lat) &&
    Number.isFinite(item.lng)
  );
}

export async function fetchYummySosSnapshot(): Promise<YummySosSnapshot> {
  const [homeHtml, reportesHtml, directorioHtml] = await Promise.all([
    fetchYummyHtml("/"),
    fetchYummyHtml("/reportes"),
    fetchYummyHtml("/directorio"),
  ]);

  const stats = parseHomeStats(homeHtml);
  const damage_reports = parseRscObjects<YummyDamageReport>(
    reportesHtml,
    REPORT_FIELDS,
    isDamageReport
  );
  const help_centers = parseRscObjects<YummyHelpCenter>(
    directorioHtml,
    CENTER_FIELDS,
    isHelpCenter
  );

  return {
    source: YUMMY_SOS_SOURCE_URL,
    fetched_at: new Date().toISOString(),
    stats: {
      report_count: stats.reportCount,
      acopio_count: stats.acopioCount,
      reports_in_snapshot: damage_reports.length,
      centers_in_snapshot: help_centers.length,
    },
    damage_reports,
    help_centers,
  };
}
