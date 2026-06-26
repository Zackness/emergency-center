#!/usr/bin/env npx tsx
/**
 * Genera src/data/hospitals-venezuela.json desde Google Maps (Places API).
 *
 * Requiere en .env:
 *   GOOGLE_MAPS_API_KEY=tu-api-key
 *
 * En Google Cloud habilita "Places API (New)" y facturación.
 *
 * Uso:
 *   npm run fetch:hospitals:google
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUTPUT_PATH = resolve(process.cwd(), "src/data/hospitals-venezuela.json");
const PLACES_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.nationalPhoneNumber",
  "places.types",
  "places.googleMapsUri",
  "places.addressComponents",
  "nextPageToken",
].join(",");

const STATE_ALIASES: Record<string, string> = {
  amazonas: "Amazonas",
  anzoategui: "Anzoátegui",
  anzoátegui: "Anzoátegui",
  apure: "Apure",
  aragua: "Aragua",
  barinas: "Barinas",
  bolivar: "Bolívar",
  bolívar: "Bolívar",
  carabobo: "Carabobo",
  cojedes: "Cojedes",
  "delta amacuro": "Delta Amacuro",
  "distrito capital": "Distrito Capital",
  falcon: "Falcón",
  falcón: "Falcón",
  guarico: "Guárico",
  guárico: "Guárico",
  lara: "Lara",
  merida: "Mérida",
  mérida: "Mérida",
  miranda: "Miranda",
  monagas: "Monagas",
  "nueva esparta": "Nueva Esparta",
  portuguesa: "Portuguesa",
  sucre: "Sucre",
  tachira: "Táchira",
  táchira: "Táchira",
  trujillo: "Trujillo",
  vargas: "La Guaira",
  "la guaira": "La Guaira",
  yaracuy: "Yaracuy",
  zulia: "Zulia",
};

/** Capitales y ciudades principales para cubrir todo el país */
const SEARCH_POINTS: { state: string; city: string; lat: number; lng: number }[] = [
  { state: "Distrito Capital", city: "Caracas", lat: 10.4806, lng: -66.9036 },
  { state: "Miranda", city: "Los Teques", lat: 10.3444, lng: -67.0433 },
  { state: "Miranda", city: "Guarenas", lat: 10.467, lng: -66.542 },
  { state: "La Guaira", city: "La Guaira", lat: 10.6, lng: -66.933 },
  { state: "Aragua", city: "Maracay", lat: 10.2469, lng: -67.5958 },
  { state: "Carabobo", city: "Valencia", lat: 10.162, lng: -68.0077 },
  { state: "Zulia", city: "Maracaibo", lat: 10.6666, lng: -71.6124 },
  { state: "Lara", city: "Barquisimeto", lat: 10.0647, lng: -69.357 },
  { state: "Bolívar", city: "Ciudad Bolívar", lat: 8.1222, lng: -63.5497 },
  { state: "Bolívar", city: "Ciudad Guayana", lat: 8.353, lng: -62.641 },
  { state: "Mérida", city: "Mérida", lat: 8.5897, lng: -71.1561 },
  { state: "Táchira", city: "San Cristóbal", lat: 7.7669, lng: -72.225 },
  { state: "Anzoátegui", city: "Barcelona", lat: 10.1362, lng: -64.6862 },
  { state: "Monagas", city: "Maturín", lat: 9.7457, lng: -63.1832 },
  { state: "Sucre", city: "Cumaná", lat: 10.453, lng: -64.1826 },
  { state: "Falcón", city: "Coro", lat: 11.4045, lng: -69.6734 },
  { state: "Portuguesa", city: "Guanare", lat: 9.0438, lng: -69.7449 },
  { state: "Barinas", city: "Barinas", lat: 8.6226, lng: -70.2075 },
  { state: "Apure", city: "San Fernando de Apure", lat: 7.894, lng: -67.473 },
  { state: "Guárico", city: "San Juan de los Morros", lat: 9.911, lng: -67.353 },
  { state: "Cojedes", city: "San Carlos", lat: 9.658, lng: -68.59 },
  { state: "Yaracuy", city: "San Felipe", lat: 10.34, lng: -68.736 },
  { state: "Trujillo", city: "Trujillo", lat: 9.366, lng: -70.436 },
  { state: "Nueva Esparta", city: "La Asunción", lat: 11.033, lng: -63.862 },
  { state: "Nueva Esparta", city: "Porlamar", lat: 10.957, lng: -63.85 },
  { state: "Amazonas", city: "Puerto Ayacucho", lat: 5.663, lng: -67.623 },
  { state: "Delta Amacuro", city: "Tucupita", lat: 9.057, lng: -62.052 },
];

export interface HospitalFacilityRecord {
  external_id: string;
  source: "google_maps";
  name: string;
  facility_type: "hospital" | "clinic";
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  google_maps_url: string | null;
}

interface AddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface GooglePlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  nationalPhoneNumber?: string;
  types?: string[];
  googleMapsUri?: string;
  addressComponents?: AddressComponent[];
}

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env opcional si la variable ya está en el entorno
  }
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function inferStateFromComponents(components: AddressComponent[], fallback: string): string {
  for (const component of components) {
    if (!component.types?.includes("administrative_area_level_1")) continue;
    const raw = component.longText ?? component.shortText ?? "";
    const key = normalizeKey(raw);
    if (STATE_ALIASES[key]) return STATE_ALIASES[key];
    for (const state of Object.values(STATE_ALIASES)) {
      if (normalizeKey(state) === key) return state;
    }
  }
  return fallback;
}

function inferCityFromComponents(components: AddressComponent[], fallback: string): string {
  for (const type of ["locality", "administrative_area_level_2", "sublocality"] as const) {
    const match = components.find((c) => c.types?.includes(type));
    if (match?.longText) return match.longText;
  }
  return fallback;
}

function inferFacilityType(types: string[] = []): "hospital" | "clinic" {
  const normalized = types.map((t) => t.toLowerCase());
  if (normalized.includes("hospital")) return "hospital";
  return "clinic";
}

function isHealthFacility(types: string[] = []): boolean {
  const healthTypes = new Set([
    "hospital",
    "doctor",
    "health",
    "pharmacy",
    "dentist",
    "physiotherapist",
  ]);
  return types.some((t) => healthTypes.has(t.toLowerCase()));
}

function mapPlace(
  place: GooglePlace,
  fallbackState: string,
  fallbackCity: string
): HospitalFacilityRecord | null {
  if (!place.id || !place.displayName?.text) return null;
  if (!place.location?.latitude || !place.location?.longitude) return null;
  if (!isHealthFacility(place.types)) return null;

  const components = place.addressComponents ?? [];
  const state = inferStateFromComponents(components, fallbackState);
  const city = inferCityFromComponents(components, fallbackCity);

  return {
    external_id: place.id,
    source: "google_maps",
    name: place.displayName.text.trim(),
    facility_type: inferFacilityType(place.types),
    state,
    city,
    address: place.formattedAddress?.trim() || `${city}, ${state}`,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    phone: place.nationalPhoneNumber?.trim() ?? null,
    google_maps_url: place.googleMapsUri ?? null,
  };
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function googlePost(
  apiKey: string,
  url: string,
  body: Record<string, unknown>
): Promise<{ places?: GooglePlace[]; nextPageToken?: string }> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places ${response.status}: ${text}`);
  }

  return response.json() as Promise<{ places?: GooglePlace[]; nextPageToken?: string }>;
}

async function fetchNearby(
  apiKey: string,
  point: (typeof SEARCH_POINTS)[number],
  collected: Map<string, HospitalFacilityRecord>
) {
  let pageToken: string | undefined;

  do {
    const body: Record<string, unknown> = pageToken
      ? { pageToken }
      : {
          includedPrimaryTypes: ["hospital"],
          maxResultCount: 20,
          languageCode: "es",
          regionCode: "VE",
          locationRestriction: {
            circle: {
              center: { latitude: point.lat, longitude: point.lng },
              radius: 45000,
            },
          },
        };

    const data = await googlePost(apiKey, PLACES_NEARBY_URL, body);
    for (const place of data.places ?? []) {
      const record = mapPlace(place, point.state, point.city);
      if (record) collected.set(record.external_id, record);
    }

    pageToken = data.nextPageToken;
    if (pageToken) await sleep(2200);
    else await sleep(250);
  } while (pageToken);
}

async function fetchText(
  apiKey: string,
  query: string,
  point: (typeof SEARCH_POINTS)[number],
  collected: Map<string, HospitalFacilityRecord>
) {
  let pageToken: string | undefined;

  do {
    const body: Record<string, unknown> = pageToken
      ? { pageToken, languageCode: "es", regionCode: "VE" }
      : {
          textQuery: query,
          languageCode: "es",
          regionCode: "VE",
          locationBias: {
            circle: {
              center: { latitude: point.lat, longitude: point.lng },
              radius: 50000,
            },
          },
        };

    const data = await googlePost(apiKey, PLACES_TEXT_URL, body);
    for (const place of data.places ?? []) {
      const record = mapPlace(place, point.state, point.city);
      if (record) collected.set(record.external_id, record);
    }

    pageToken = data.nextPageToken;
    if (pageToken) await sleep(2200);
    else await sleep(250);
  } while (pageToken);
}

function dedupeAndSort(records: HospitalFacilityRecord[]): HospitalFacilityRecord[] {
  return records.sort((a, b) => {
    const byState = a.state.localeCompare(b.state, "es");
    if (byState !== 0) return byState;
    const byType = a.facility_type.localeCompare(b.facility_type);
    if (byType !== 0) return byType;
    return a.name.localeCompare(b.name, "es");
  });
}

async function main() {
  loadEnvFile();
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "Falta GOOGLE_MAPS_API_KEY en .env\n" +
        "1. Crea una API key en Google Cloud Console\n" +
        '2. Habilita "Places API (New)"\n' +
        "3. Agrega GOOGLE_MAPS_API_KEY=... a tu .env"
    );
    process.exit(1);
  }

  const collected = new Map<string, HospitalFacilityRecord>();
  const total = SEARCH_POINTS.length;

  for (let i = 0; i < SEARCH_POINTS.length; i++) {
    const point = SEARCH_POINTS[i];
    console.log(`[${i + 1}/${total}] ${point.city}, ${point.state}…`);

    await fetchNearby(apiKey, point, collected);
    await fetchText(apiKey, `hospitales en ${point.city}`, point, collected);
    await fetchText(apiKey, `clínicas hospital ${point.city} Venezuela`, point, collected);
  }

  const facilities = dedupeAndSort([...collected.values()]);
  const hospitalsCount = facilities.filter((h) => h.facility_type === "hospital").length;
  const clinicsCount = facilities.filter((h) => h.facility_type === "clinic").length;

  writeFileSync(
    OUTPUT_PATH,
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        source: "Google Maps (Places API)",
        attribution: "Datos de ubicación © Google",
        count: facilities.length,
        hospitals_count: hospitalsCount,
        clinics_count: clinicsCount,
        facilities,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(
    `\nGuardados ${facilities.length} centros desde Google Maps (${hospitalsCount} hospitales, ${clinicsCount} clínicas)`
  );
  console.log(`Archivo: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
