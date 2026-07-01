import type { DamageReport } from "@/types";

/** Hora Venezuela (UTC-4): 30 jun 2026, 2:30 p. m. */
export const URGENT_ALERT_PUBLISHED_AT = "2026-06-30T18:30:00.000Z";

export interface UrgentRescueAlertCard {
  id: string;
  damageReport: DamageReport;
  phone: string;
  phoneTel: string;
  whatsappUrl: string;
  publishedAt: string;
  mapAnchor: string;
}

const OP33_TANAGUARENA: UrgentRescueAlertCard = {
  id: "op33-tanaguarena-bodegas",
  mapAnchor: "urgent-op33-tanaguarena-bodegas",
  phone: "0412-9195340",
  phoneTel: "tel:+584129195340",
  whatsappUrl:
    "https://wa.me/584129195340?text=" +
    encodeURIComponent(
      "Hola, soy rescatista/voluntario y puedo apoyar en OP33 Tanaguarena (bodegas subterráneas entre torres B y C).",
    ),
  publishedAt: URGENT_ALERT_PUBLISHED_AT,
  damageReport: {
    id: "urgent-op33-tanaguarena-bodegas",
    title: "OP33 Tanaguarena — bodegas subterráneas (torres B y C)",
    severity: "collapsed",
    state: "La Guaira",
    city: "Tanaguarena",
    address: "Bodegas subterráneas entre torres B y C, OP33, Tanaguarena, Caraballeda",
    zone: "Tanaguarena",
    latitude: 10.609713401152,
    longitude: -66.8416977169781,
    description:
      "Situación urgente del 30 de junio de 2026, 2:30 p. m. (hora Venezuela). Se requieren rescatistas y voluntarios en bodegas subterráneas entre torres B y C. Contacto para coordinación: 0412-9195340.",
    reporter_name: null,
    reporter_contact: "0412-9195340",
    source_name: "Reporte urgente — 30 jun 2026",
    source_url: null,
    image_urls: [],
    external_reference: "urgent-op33-tanaguarena-20260630",
    is_verified: false,
    is_active: true,
    created_at: URGENT_ALERT_PUBLISHED_AT,
    updated_at: URGENT_ALERT_PUBLISHED_AT,
    source_synced_at: URGENT_ALERT_PUBLISHED_AT,
  },
};

const ACTIVE_ALERTS: UrgentRescueAlertCard[] = [OP33_TANAGUARENA];

export function getUrgentRescueAlertCards(): UrgentRescueAlertCard[] {
  return ACTIVE_ALERTS.filter((alert) => alert.damageReport.is_active);
}

export function getUrgentRescueDamageReports(): DamageReport[] {
  return getUrgentRescueAlertCards().map((alert) => alert.damageReport);
}

export function formatUrgentAlertPublishedAt(iso: string, locale: "es" | "en"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "es" ? "es-VE" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Caracas",
  }).format(date);
}
