import type { DamageReport } from "@/types";
import { BLOOD_DONATION_CAMPAIGN } from "@/data/blood-donation";

/** Hora Venezuela (UTC-4): 30 jun 2026, 2:30 p. m. */
export const URGENT_ALERT_PUBLISHED_AT = "2026-06-30T18:30:00.000Z";

/** Hora Venezuela (UTC-4): 28 jun 2026, ~4:00 p. m. — difusión redes */
export const ISAAC_MISSING_PUBLISHED_AT = "2026-06-28T20:00:00.000Z";

export type UrgentAlertKind = "rescue" | "missing_person" | "blood_donation";

export interface UrgentRescueAlertCard {
  id: string;
  kind: UrgentAlertKind;
  damageReport: DamageReport;
  phone?: string;
  phoneTel?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  secondaryPhone?: string;
  secondaryPhoneTel?: string;
  secondaryWhatsappUrl?: string;
  publishedAt: string;
  mapAnchor: string;
}

/** Hora Venezuela (UTC-4): 28 jun 2026 — difusión @tugranitodearenahoy */
export const BLOOD_DONATION_URGENT_PUBLISHED_AT = BLOOD_DONATION_CAMPAIGN.source_published_at;

const BLOOD_DONATION_URGENT: UrgentRescueAlertCard = {
  id: "tu-granito-sangre-caracas",
  kind: "blood_donation",
  mapAnchor: "donacion-sangre",
  instagramUrl: BLOOD_DONATION_CAMPAIGN.instagram_url,
  publishedAt: BLOOD_DONATION_URGENT_PUBLISHED_AT,
  damageReport: {
    id: "urgent-blood-donation-caracas",
    title: `URGENTE — ${BLOOD_DONATION_CAMPAIGN.headline.es}`,
    severity: "damaged",
    state: "Distrito Capital",
    city: "Caracas",
    address: "8 centros: HUC, José Gregorio Hernández, Banco Municipal de Sangre, Pérez de León II, Domingo Luciani, Victorino Santaella, Miguel Pérez Carreño y Hospital Vargas",
    zone: "Caracas y alrededores",
    latitude: 10.5006,
    longitude: -66.9153,
    description: `${BLOOD_DONATION_CAMPAIGN.message.es} Difundido por ${BLOOD_DONATION_CAMPAIGN.handle} (${BLOOD_DONATION_CAMPAIGN.organization}).`,
    reporter_name: BLOOD_DONATION_CAMPAIGN.organization,
    reporter_contact: BLOOD_DONATION_CAMPAIGN.handle,
    source_name: "Difusión urgente — 28 jun 2026",
    source_url: BLOOD_DONATION_CAMPAIGN.instagram_url,
    image_urls: [],
    external_reference: "urgent-blood-donation-20260628",
    is_verified: false,
    is_active: true,
    created_at: BLOOD_DONATION_URGENT_PUBLISHED_AT,
    updated_at: BLOOD_DONATION_URGENT_PUBLISHED_AT,
    source_synced_at: BLOOD_DONATION_URGENT_PUBLISHED_AT,
  },
};

const ISAAC_FIGUEIRA_RIVAS: UrgentRescueAlertCard = {
  id: "isaac-figueira-rivas-golf-club",
  kind: "missing_person",
  mapAnchor: "urgent-isaac-figueira-rivas",
  phone: "0424-1581013",
  phoneTel: "tel:+584241581013",
  whatsappUrl:
    "https://wa.me/584241581013?text=" +
    encodeURIComponent(
      "Hola, tengo información sobre Isaac Martín Figueira Rivas (11 años), visto por última vez en el campo Golf Club, Caraballeda.",
    ),
  secondaryPhone: "0424-2710491",
  secondaryPhoneTel: "tel:+584242710491",
  secondaryWhatsappUrl:
    "https://wa.me/584242710491?text=" +
    encodeURIComponent(
      "Hola, tengo información sobre Isaac Martín Figueira Rivas (11 años), visto por última vez en el campo Golf Club, Caraballeda.",
    ),
  publishedAt: ISAAC_MISSING_PUBLISHED_AT,
  damageReport: {
    id: "urgent-isaac-figueira-rivas-golf-club",
    title: "URGENTE — Ubicar a Isaac Martín Figueira Rivas (11 años)",
    severity: "evacuated",
    state: "La Guaira",
    city: "Catia La Mar",
    address: "Última vez visto: campo Golf Club, Caraballeda (registrado en lista de damnificados)",
    zone: "Caraballeda",
    latitude: 10.6116044465814,
    longitude: -66.842441071404,
    description:
      "Menor de 11 años, de Catia La Mar (edificio Oasis Beach). Fue rescatado y trasladado al campo Golf Club, donde quedó registrado en la lista de damnificados y fue visto por última vez. Familiares piden difundir el caso. Contacto: Elías Aguilar (0424-1581013) y Vanessa Uzcategui (0424-2710491). Fuente: difusión en redes (@jeudyarango).",
    reporter_name: "Familiares",
    reporter_contact: "0424-1581013 / 0424-2710491",
    source_name: "Difusión urgente — 28 jun 2026",
    source_url: null,
    image_urls: [],
    external_reference: "urgent-isaac-figueira-rivas-20260628",
    is_verified: false,
    is_active: true,
    created_at: ISAAC_MISSING_PUBLISHED_AT,
    updated_at: ISAAC_MISSING_PUBLISHED_AT,
    source_synced_at: ISAAC_MISSING_PUBLISHED_AT,
  },
};

const OP33_TANAGUARENA: UrgentRescueAlertCard = {
  id: "op33-tanaguarena-bodegas",
  kind: "rescue",
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

const ACTIVE_ALERTS: UrgentRescueAlertCard[] = [
  BLOOD_DONATION_URGENT,
  ISAAC_FIGUEIRA_RIVAS,
  OP33_TANAGUARENA,
];

export function getUrgentRescueAlertCards(): UrgentRescueAlertCard[] {
  return ACTIVE_ALERTS.filter((alert) => alert.damageReport.is_active);
}

export function getUrgentRescueDamageReports(): DamageReport[] {
  return getUrgentRescueAlertCards()
    .filter((alert) => alert.kind !== "blood_donation")
    .map((alert) => alert.damageReport);
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
