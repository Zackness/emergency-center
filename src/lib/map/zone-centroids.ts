import { EMERGENCY_ZONES } from "@/data/emergency-zones";

/** Centroides aproximados para marcadores de plataforma / enlaces por zona. */
export const ZONE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  caracas: { lat: 10.4806, lng: -66.9036 },
  barquisimeto: { lat: 10.0647, lng: -69.357 },
  valencia: { lat: 10.162, lng: -68.0077 },
  maracay: { lat: 10.2469, lng: -67.5958 },
  maracaibo: { lat: 10.6316, lng: -71.6416 },
  "san-cristobal": { lat: 7.7669, lng: -72.225 },
  merida: { lat: 8.5897, lng: -71.1561 },
  "puerto-cabello": { lat: 10.4667, lng: -68.0167 },
  "la-guaira": { lat: 10.5999, lng: -66.9346 },
  barcelona: { lat: 10.1362, lng: -64.6862 },
  cumana: { lat: 10.453, lng: -64.1826 },
  "ciudad-guayana": { lat: 8.3535, lng: -62.6413 },
  maturn: { lat: 9.7457, lng: -63.1832 },
  barinas: { lat: 8.6226, lng: -70.2075 },
  "san-felipe": { lat: 10.34, lng: -68.736 },
  "san-fernando-apure": { lat: 7.894, lng: -67.473 },
  coro: { lat: 11.4045, lng: -69.6734 },
  guanare: { lat: 9.0434, lng: -69.7489 },
  valera: { lat: 9.3178, lng: -70.6039 },
  "san-carlos": { lat: 9.6612, lng: -68.5827 },
  tucupita: { lat: 9.0575, lng: -62.05 },
  "puerto-ayacucho": { lat: 5.6639, lng: -67.6236 },
  margarita: { lat: 11.0206, lng: -63.8497 },
  "los-teques": { lat: 10.344, lng: -67.0433 },
};

export function centroidForZone(zoneId: string): { lat: number; lng: number } {
  return ZONE_CENTROIDS[zoneId] ?? ZONE_CENTROIDS.caracas;
}

export function allZoneCentroids(): { zoneId: string; label: { es: string; en: string }; lat: number; lng: number }[] {
  return EMERGENCY_ZONES.map((zone) => ({
    zoneId: zone.id,
    label: zone.label,
    ...centroidForZone(zone.id),
  }));
}
