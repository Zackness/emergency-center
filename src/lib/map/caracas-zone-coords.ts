/** Coordenadas aproximadas por zona de Caracas (Red Ayuda / directorios locales). */
export const CARACAS_ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Los Magallanes": { lat: 10.4892, lng: -66.8764 },
  "Bella Vista": { lat: 10.4971, lng: -66.8912 },
  "San Martín": { lat: 10.5083, lng: -66.9015 },
  Catia: { lat: 10.5072, lng: -66.9581 },
  Coche: { lat: 10.4521, lng: -66.9354 },
  "Santa Rosalía": { lat: 10.5142, lng: -66.9183 },
  "San Bernardino": { lat: 10.5078, lng: -66.9112 },
  "Las Mercedes": { lat: 10.4734, lng: -66.8571 },
  "Sabana Grande": { lat: 10.4931, lng: -66.8768 },
};

export function coordsForCaracasZone(zone: string): { lat: number; lng: number } {
  return CARACAS_ZONE_COORDS[zone] ?? { lat: 10.4806, lng: -66.9036 };
}
