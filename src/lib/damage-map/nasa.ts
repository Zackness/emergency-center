import type { DamageSeverity } from "@/types";
import type { ImportedBuilding } from "@/lib/damage-map/types";
import {
  NASA_DAMAGE_ATTRIBUTION,
  NASA_DAMAGE_WEBMAP,
} from "@/lib/damage-map/nasa-config";

export interface NasaDamageFeature {
  overture_id: string;
  label: string | null;
  damage: number;
  damage_probability: number;
  coverage_fraction: number | null;
  class: string | null;
  subtype: string | null;
  latitude: number;
  longitude: number;
}

export interface NasaDamageSnapshot {
  source: string;
  webmap: string;
  attribution: string;
  fetched_at: string;
  filter: string;
  estimate_total: number;
  count: number;
  items: NasaDamageFeature[];
}

export function severityFromNasaProbability(probability: number): DamageSeverity {
  if (probability >= 0.75) return "collapsed";
  if (probability >= 0.25) return "damaged";
  return "evacuated";
}

export function polygonCentroid(rings: number[][][]): [number, number] | null {
  const ring = rings[0];
  if (!ring?.length) return null;
  let lngSum = 0;
  let latSum = 0;
  for (const [lng, lat] of ring) {
    lngSum += lng;
    latSum += lat;
  }
  return [latSum / ring.length, lngSum / ring.length];
}

export function nasaFeatureToImportedBuilding(feature: NasaDamageFeature): ImportedBuilding {
  const probability = feature.damage_probability ?? 0;
  const pct = Math.round(probability * 100);
  return {
    externalId: feature.overture_id,
    title: `Edificio sat�lite (${pct}% prob. da�o)`,
    address: null,
    city: "Venezuela",
    zone: feature.class,
    state: inferNasaState(feature.latitude, feature.longitude),
    latitude: feature.latitude,
    longitude: feature.longitude,
    severity: severityFromNasaProbability(probability),
    imageUrls: [],
    isVerified: false,
    sourceSyncedAt: new Date().toISOString(),
    sourceUrl: NASA_DAMAGE_WEBMAP,
  };
}

/** Aproximaci�n por lat/lng para filtrar en UI (sin geocodificaci�n inversa). */
function inferNasaState(lat: number, lng: number): string {
  if (lat >= 10.35 && lat <= 10.75 && lng >= -67.1 && lng <= -66.7) {
    return "Distrito Capital";
  }
  if (lat >= 10.55 && lat <= 11.1 && lng >= -67.2 && lng <= -66.5) {
    return "La Guaira";
  }
  if (lat >= 10.1 && lat <= 10.55 && lng >= -67.5 && lng <= -66.3) {
    return "Miranda";
  }
  if (lat >= 10.0 && lat <= 10.5 && lng >= -68.2 && lng <= -67.3) {
    return "Aragua";
  }
  if (lat >= 9.5 && lat <= 10.3 && lng >= -68.8 && lng <= -67.8) {
    return "Carabobo";
  }
  return "Venezuela";
}

export const NASA_DAMAGE_SOURCE_NAME = "NASA Sentinel-1 (experimental)";

export const NASA_DAMAGE_DISCLAIMER_ES =
  "Evaluaci�n preliminar por radar satelital. No sustituye inspecci�n en campo ni el censo edificio por edificio.";

export const NASA_DAMAGE_DISCLAIMER_EN =
  "Preliminary satellite radar assessment. Not a substitute for field inspection or a building-by-building census.";

export function nasaAttributionText(locale: "es" | "en"): string {
  return locale === "es"
    ? `${NASA_DAMAGE_ATTRIBUTION} ${NASA_DAMAGE_DISCLAIMER_ES}`
    : `${NASA_DAMAGE_ATTRIBUTION} ${NASA_DAMAGE_DISCLAIMER_EN}`;
}
