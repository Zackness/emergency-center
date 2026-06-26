#!/usr/bin/env npx tsx
/**
 * Genera src/data/hospitals-venezuela.json desde OpenStreetMap (HDX / Overpass).
 * Incluye hospitales y clínicas con dirección cuando está disponible en OSM.
 *
 * Uso: npm run fetch:hospitals
 */
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

const HDX_GEOJSON_ZIP =
  "https://production-raw-data-api.s3.amazonaws.com/ISO3/VEN/health_facilities/hotosm_ven_health_facilities_osm_geojson.zip";

const OVERPASS_URLS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const OVERPASS_QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="VE"]->.ve;
(
  node["amenity"="hospital"](area.ve);
  way["amenity"="hospital"](area.ve);
  node["amenity"="clinic"](area.ve);
  way["amenity"="clinic"](area.ve);
  node["healthcare"="hospital"](area.ve);
  way["healthcare"="hospital"](area.ve);
  node["healthcare"="clinic"](area.ve);
  way["healthcare"="clinic"](area.ve);
);
out center tags;
`;

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

const VENEZUELA_STATES = [...new Set(Object.values(STATE_ALIASES))];

const HOSPITAL_AMENITIES = new Set(["hospital"]);
const CLINIC_AMENITIES = new Set(["clinic", "doctors", "health_centre", "health_center"]);
const HOSPITAL_HEALTHCARE = new Set(["hospital"]);
const CLINIC_HEALTHCARE = new Set(["clinic", "centre", "center", "doctor", "physician"]);

export interface HospitalOsmRecord {
  osm_id: string;
  name: string;
  facility_type: "hospital" | "clinic";
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
}

interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface GeoJsonFeature {
  type: string;
  geometry?: { type: string; coordinates: number[] };
  properties?: Record<string, string>;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function inferFacilityType(tags: Record<string, string>): "hospital" | "clinic" | null {
  const amenity = tags.amenity?.toLowerCase();
  const healthcare = tags.healthcare?.toLowerCase();
  if (amenity && HOSPITAL_AMENITIES.has(amenity)) return "hospital";
  if (healthcare && HOSPITAL_HEALTHCARE.has(healthcare)) return "hospital";
  if (amenity && CLINIC_AMENITIES.has(amenity)) return "clinic";
  if (healthcare && CLINIC_HEALTHCARE.has(healthcare)) return "clinic";
  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (amenity === "clinic" || healthcare === "clinic") return "clinic";
  return null;
}

function isRelevantFacility(tags: Record<string, string>): boolean {
  return inferFacilityType(tags) !== null;
}

function inferState(tags: Record<string, string>, city: string): string {
  const candidates = [
    tags["addr:state"],
    tags.state,
    tags["addr:province"],
    tags["is_in:state"],
  ].filter(Boolean);

  for (const raw of candidates) {
    const key = normalizeKey(raw);
    if (STATE_ALIASES[key]) return STATE_ALIASES[key];
    for (const state of VENEZUELA_STATES) {
      if (normalizeKey(state) === key) return state;
    }
  }

  const haystack = normalizeKey(
    [city, tags["addr:city"], tags.city, tags["addr:full"], tags["addr:street"]]
      .filter(Boolean)
      .join(" ")
  );
  for (const [alias, state] of Object.entries(STATE_ALIASES)) {
    if (haystack.includes(normalizeKey(alias))) return state;
  }
  return "Por confirmar";
}

function buildAddress(tags: Record<string, string>, city: string): string {
  if (tags["addr:full"]) return tags["addr:full"];
  if (tags.addr_full) return tags.addr_full;
  const parts = [
    tags["addr:street"] || tags.addr_street || tags.addr_stree,
    tags["addr:housenumber"] || tags.addr_house,
    tags["addr:suburb"],
    tags["addr:neighbourhood"],
    city && city !== "Por confirmar" ? city : null,
  ].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (tags["addr:place"]) return tags["addr:place"];
  return city !== "Por confirmar" ? city : "Dirección por confirmar";
}

function mapTagsToRecord(
  tags: Record<string, string>,
  lat: number,
  lon: number,
  osmId: string
): HospitalOsmRecord | null {
  const facilityType = inferFacilityType(tags);
  if (!facilityType) return null;

  const name = tags.name?.trim() || tags["name:es"]?.trim();
  if (!name) return null;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const city =
    tags["addr:city"]?.trim() ||
    tags.city?.trim() ||
    tags["addr:municipality"]?.trim() ||
    tags["addr:town"]?.trim() ||
    "Por confirmar";

  const phone =
    tags.phone?.trim() ||
    tags["contact:phone"]?.trim() ||
    tags["contact:mobile"]?.trim() ||
    null;

  return {
    osm_id: osmId,
    name,
    facility_type: facilityType,
    state: inferState(tags, city),
    city,
    address: buildAddress(tags, city),
    latitude: lat,
    longitude: lon,
    phone,
  };
}

function dedupeAndSort(records: HospitalOsmRecord[]): HospitalOsmRecord[] {
  const seen = new Set<string>();
  const out: HospitalOsmRecord[] = [];
  for (const record of records) {
    const key = `${normalizeKey(record.name)}|${record.latitude.toFixed(4)}|${record.longitude.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(record);
  }
  return out.sort((a, b) => {
    const byState = a.state.localeCompare(b.state, "es");
    if (byState !== 0) return byState;
    const byType = a.facility_type.localeCompare(b.facility_type);
    if (byType !== 0) return byType;
    return a.name.localeCompare(b.name, "es");
  });
}

function parseHdxGeoJson(path: string): HospitalOsmRecord[] {
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    features: GeoJsonFeature[];
  };
  const records: HospitalOsmRecord[] = [];

  for (const feature of raw.features ?? []) {
    const props = feature.properties ?? {};
    if (!isRelevantFacility(props)) continue;
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lon, lat] = coords;
    const osmId = props["@id"] || props.osm_id || props.id || `hdx/${records.length}`;
    const record = mapTagsToRecord(props, Number(lat), Number(lon), String(osmId));
    if (record) records.push(record);
  }
  return records;
}

async function fetchFromHdx(): Promise<HospitalOsmRecord[]> {
  const workDir = join(tmpdir(), "ven-health-hdx");
  const zipPath = join(workDir, "health.zip");
  mkdirSync(workDir, { recursive: true });
  console.log("Descargando HDX GeoJSON…");
  execSync(`curl -fsSL "${HDX_GEOJSON_ZIP}" -o "${zipPath}"`, { stdio: "inherit" });
  execSync(`unzip -o "${zipPath}" -d "${workDir}"`, { stdio: "pipe" });
  const geojsonFile = readdirSync(workDir).find((f) => f.endsWith(".geojson"));
  if (!geojsonFile) throw new Error("No se encontró .geojson en el ZIP de HDX");
  const records = parseHdxGeoJson(join(workDir, geojsonFile));
  rmSync(workDir, { recursive: true, force: true });
  return records;
}

async function fetchFromOverpass(): Promise<HospitalOsmRecord[]> {
  let lastError = "";
  for (const url of OVERPASS_URLS) {
    console.log(`Intentando Overpass ${url}…`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
    });
    if (!response.ok) {
      lastError = `${response.status}`;
      continue;
    }
    const payload = (await response.json()) as { elements: OsmElement[] };
    const records: HospitalOsmRecord[] = [];
    for (const element of payload.elements) {
      const tags = element.tags ?? {};
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (typeof lat !== "number" || typeof lon !== "number") continue;
      const record = mapTagsToRecord(tags, lat, lon, `${element.type}/${element.id}`);
      if (record) records.push(record);
    }
    return records;
  }
  throw new Error(`Overpass falló (${lastError})`);
}

async function main() {
  let facilities: HospitalOsmRecord[] = [];
  let source = "";

  try {
    facilities = await fetchFromHdx();
    source = "HDX / OpenStreetMap (Humanitarian Data Exchange)";
  } catch (hdxErr) {
    console.warn("HDX falló, intentando Overpass…", hdxErr);
    facilities = await fetchFromOverpass();
    source = "OpenStreetMap via Overpass API";
  }

  facilities = dedupeAndSort(facilities);
  const hospitalsCount = facilities.filter((h) => h.facility_type === "hospital").length;
  const clinicsCount = facilities.filter((h) => h.facility_type === "clinic").length;

  const outputPath = resolve(process.cwd(), "src/data/hospitals-venezuela.json");
  writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        source,
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
    `Guardados ${facilities.length} centros (${hospitalsCount} hospitales, ${clinicsCount} clínicas) en ${outputPath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
