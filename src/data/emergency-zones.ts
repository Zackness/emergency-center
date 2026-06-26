export interface EmergencyZone {
  id: string;
  label: { es: string; en: string };
  keywords: string[];
}

/** Zonas de emergencia reportadas (alineadas con centroacopio.site). */
export const EMERGENCY_ZONES: EmergencyZone[] = [
  { id: "caracas", label: { es: "Caracas", en: "Caracas" }, keywords: ["caracas", "distrito capital"] },
  {
    id: "barquisimeto",
    label: { es: "Barquisimeto / Cabudare", en: "Barquisimeto / Cabudare" },
    keywords: ["barquisimeto", "cabudare", "lara"],
  },
  { id: "valencia", label: { es: "Valencia", en: "Valencia" }, keywords: ["valencia", "carabobo"] },
  { id: "maracay", label: { es: "Maracay", en: "Maracay" }, keywords: ["maracay", "aragua"] },
  {
    id: "maracaibo",
    label: { es: "Maracaibo / San Francisco", en: "Maracaibo / San Francisco" },
    keywords: ["maracaibo", "san francisco", "zulia"],
  },
  {
    id: "san-cristobal",
    label: { es: "San Cristóbal", en: "San Cristóbal" },
    keywords: ["san cristóbal", "san cristobal", "táchira", "tachira"],
  },
  { id: "merida", label: { es: "Mérida", en: "Mérida" }, keywords: ["mérida", "merida"] },
  {
    id: "puerto-cabello",
    label: { es: "Puerto Cabello", en: "Puerto Cabello" },
    keywords: ["puerto cabello", "carabobo"],
  },
  {
    id: "la-guaira",
    label: { es: "La Guaira / Vargas", en: "La Guaira / Vargas" },
    keywords: ["la guaira", "vargas", "catia la mar", "macuto"],
  },
  {
    id: "barcelona",
    label: { es: "Barcelona / Puerto La Cruz", en: "Barcelona / Puerto La Cruz" },
    keywords: ["barcelona", "puerto la cruz", "anzoátegui", "anzoategui"],
  },
  { id: "cumana", label: { es: "Cumaná", en: "Cumaná" }, keywords: ["cumaná", "cumana", "sucre"] },
  {
    id: "ciudad-guayana",
    label: { es: "Ciudad Guayana / Ciudad Bolívar", en: "Ciudad Guayana / Ciudad Bolívar" },
    keywords: ["ciudad guayana", "ciudad bolívar", "ciudad bolivar", "bolívar", "bolivar"],
  },
  { id: "maturn", label: { es: "Maturín", en: "Maturín" }, keywords: ["maturín", "maturin", "monagas"] },
  { id: "barinas", label: { es: "Barinas", en: "Barinas" }, keywords: ["barinas"] },
  { id: "san-felipe", label: { es: "San Felipe", en: "San Felipe" }, keywords: ["san felipe", "yaracuy"] },
  {
    id: "san-fernando-apure",
    label: { es: "San Fernando de Apure", en: "San Fernando de Apure" },
    keywords: ["san fernando", "apure"],
  },
  {
    id: "coro",
    label: { es: "Coro / Punto Fijo", en: "Coro / Punto Fijo" },
    keywords: ["coro", "punto fijo", "falcón", "falcon"],
  },
  {
    id: "guanare",
    label: { es: "Guanare / Acarigua", en: "Guanare / Acarigua" },
    keywords: ["guanare", "acarigua", "portuguesa"],
  },
  {
    id: "valera",
    label: { es: "Valera / Trujillo", en: "Valera / Trujillo" },
    keywords: ["valera", "trujillo"],
  },
  { id: "san-carlos", label: { es: "San Carlos", en: "San Carlos" }, keywords: ["san carlos", "cojedes"] },
  { id: "tucupita", label: { es: "Tucupita", en: "Tucupita" }, keywords: ["tucupita", "delta amacuro"] },
  {
    id: "puerto-ayacucho",
    label: { es: "Puerto Ayacucho", en: "Puerto Ayacucho" },
    keywords: ["puerto ayacucho", "amazonas"],
  },
  {
    id: "margarita",
    label: { es: "Margarita (Porlamar / Pampatar)", en: "Margarita (Porlamar / Pampatar)" },
    keywords: ["margarita", "porlamar", "pampatar", "nueva esparta"],
  },
  {
    id: "los-teques",
    label: { es: "Los Teques / Altos Mirandinos", en: "Los Teques / Altos Mirandinos" },
    keywords: ["los teques", "altos mirandinos", "miranda"],
  },
];

export function centerMatchesZone(
  center: { city: string; state: string },
  zoneId: string,
): boolean {
  if (!zoneId) return true;
  const zone = EMERGENCY_ZONES.find((z) => z.id === zoneId);
  if (!zone) return true;
  const haystack = `${center.city} ${center.state}`.toLowerCase();
  return zone.keywords.some((keyword) => haystack.includes(keyword));
}
