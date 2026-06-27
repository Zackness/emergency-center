import { EMERGENCY_ZONES, centerMatchesZone } from "@/data/emergency-zones";
import type { CentroacopioDeliveryView } from "@/lib/help-centers/types";

const BASE_URL = "https://centroacopio.site";
const SCRAPE_DELAY_MS = 80;

export interface CentroacopioCenter {
  id: string;
  createdAt: string;
  source?: string;
  kind?: string;
  centerName: string;
  city: string;
  sector: string;
  address: string;
  description: string;
  attentionStart: string;
  attentionEnd: string;
  requiredSupplies: string[];
}

export interface CentroacopioDelivery {
  id: string;
  createdAt: string;
  name: string;
  city: string;
  sector: string;
  nearbyAddress: string;
  transportType: string;
  phone: string;
}

export interface CentroacopioSnapshot {
  source: string;
  fetched_at: string;
  centers: CentroacopioCenter[];
  deliveries: CentroacopioDelivery[];
}

interface AyudaVenezuelaAcopioRow {
  id: string;
  ambito: string | null;
  estado: string | null;
  pais: string | null;
  ciudad: string | null;
  direccion: string | null;
  organizacion: string | null;
  tipo: string | null;
  necesita: string[] | null;
  contacto: string | null;
  horario: string | null;
  updated_at: string | null;
}

const ZONE_COORDS: Record<string, { lat: number; lng: number; state: string }> = {
  caracas: { lat: 10.4806, lng: -66.9036, state: "Distrito Capital" },
  barquisimeto: { lat: 10.0647, lng: -69.357, state: "Lara" },
  valencia: { lat: 10.162, lng: -68.0077, state: "Carabobo" },
  maracay: { lat: 10.2469, lng: -67.5958, state: "Aragua" },
  maracaibo: { lat: 10.6316, lng: -71.6416, state: "Zulia" },
  "san-cristobal": { lat: 7.7669, lng: -72.225, state: "Táchira" },
  merida: { lat: 8.5897, lng: -71.1561, state: "Mérida" },
  "puerto-cabello": { lat: 10.4667, lng: -68.0167, state: "Carabobo" },
  "la-guaira": { lat: 10.5999, lng: -66.9346, state: "La Guaira" },
  barcelona: { lat: 10.1362, lng: -64.6862, state: "Anzoátegui" },
  cumana: { lat: 10.453, lng: -64.1826, state: "Sucre" },
  "ciudad-guayana": { lat: 8.3535, lng: -62.6413, state: "Bolívar" },
  maturn: { lat: 9.7457, lng: -63.1832, state: "Monagas" },
  barinas: { lat: 8.6226, lng: -70.2075, state: "Barinas" },
  "san-felipe": { lat: 10.34, lng: -68.736, state: "Yaracuy" },
  "san-fernando-apure": { lat: 7.894, lng: -67.473, state: "Apure" },
  coro: { lat: 11.4045, lng: -69.6734, state: "Falcón" },
  guanare: { lat: 9.0434, lng: -69.7489, state: "Portuguesa" },
  valera: { lat: 9.3178, lng: -70.6039, state: "Trujillo" },
  "san-carlos": { lat: 9.6612, lng: -68.5827, state: "Cojedes" },
  tucupita: { lat: 9.0575, lng: -62.05, state: "Delta Amacuro" },
  "puerto-ayacucho": { lat: 5.6639, lng: -67.6236, state: "Amazonas" },
  margarita: { lat: 11.0206, lng: -63.8497, state: "Nueva Esparta" },
  "los-teques": { lat: 10.344, lng: -67.0433, state: "Miranda" },
};

export const CENTROACOPIO_SOURCE_TAG = "centroacopio.site";
export const CENTROACOPIO_ID_PREFIX = "[[centroacopio:";
export const CENTROACOPIO_DELIVERY_PREFIX = "[[centroacopio-delivery:";
export const HELP_CENTER_SOURCE_PREFIX = "[[help-source:";

/** Etiquetas de ciudad usadas por centroacopio.site (filtros del directorio). */
export const CENTROACOPIO_CITY_QUERIES: string[] = [
  ...EMERGENCY_ZONES.map((zone) => zone.label.es),
  "Barquisimeto",
  "Cabudare",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&Aacute;/g, "Á")
    .replace(/&Eacute;/g, "É")
    .replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uacute;/g, "Ú");
}

function htmlToLines(html: string): string[] {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeImportId(source: string, name: string, address: string): string {
  const raw = `${source}-${name}-${address}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return raw.slice(0, 120) || `${source}-center`;
}

function normalizeStateLabel(state: string): string {
  return state
    .replace(/^Estado\s+/i, "")
    .replace(/\bTachira\b/g, "Táchira")
    .replace(/\bFalcon\b/g, "Falcón")
    .replace(/\bMerida\b/g, "Mérida")
    .replace(/\bBolivar\b/g, "Bolívar")
    .trim();
}

function inferCityFromAddress(address: string, fallback: string): string {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2];
  return fallback;
}

function mapSourceType(type: string | null | undefined) {
  const value = (type ?? "").toLowerCase();
  if (value.includes("igles")) return "church" as const;
  if (value.includes("univers")) return "university" as const;
  if (value.includes("gob") || value.includes("alcald") || value.includes("minister")) {
    return "government" as const;
  }
  if (value.includes("ong") || value.includes("fundaci")) return "ngo" as const;
  return "community" as const;
}

function sourceTag(row: CentroacopioCenter): string {
  return row.source?.trim() || CENTROACOPIO_SOURCE_TAG;
}

function inferSupplyLinesFromText(text: string): string[] {
  const labels: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("agua")) labels.push("Agua");
  if (/(alimento|comida|enlatado|perecedero)/.test(lower)) labels.push("Alimentos no perecederos");
  if (/(medicina|médic|insumo médico)/.test(lower)) labels.push("Insumos médicos");
  if (/(ropa|abrigo|zapato)/.test(lower)) labels.push("Ropa");
  if (/(higiene|aseo|pañal|bebe|bebé)/.test(lower)) labels.push("Higiene");
  if (/(manta|frazada)/.test(lower)) labels.push("Mantas");
  return labels.length ? labels : ["Alimentos no perecederos"];
}

function sourceMarker(source: string, id: string): string {
  return `${HELP_CENTER_SOURCE_PREFIX}${source}:${id}]]`;
}

function ayudaVenezuelaSupplyLabels(items: string[] | null | undefined): string[] {
  const labels: Record<string, string> = {
    agua: "Agua",
    alimentos: "Alimentos no perecederos",
    insumos_medicos: "Insumos médicos",
    ropa: "Ropa",
    mantas: "Mantas",
    higiene: "Higiene",
    bebe: "Bebé",
    otro: "Otro",
  };
  return (items ?? []).map((item) => labels[item] ?? item);
}

export function extractHelpCenterMarker(description: string | null | undefined) {
  if (!description) return null;

  const modern = description.match(/\[\[help-source:([^:\]]+):([^\]]+)\]\]/);
  if (modern) {
    return { source: modern[1], id: modern[2] };
  }

  const legacy = description.match(/\[\[centroacopio:([^\]]+)\]\]/);
  if (legacy) {
    return { source: CENTROACOPIO_SOURCE_TAG, id: legacy[1] };
  }

  return null;
}

async function fetchHtml(path: string): Promise<string> {
  const url = new URL(path);
  const res = await fetch(url.toString(), {
    headers: { Accept: "text/html,application/xhtml+xml" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`html ${url.hostname}${url.pathname} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.text();
}

async function fetchAyudaVenezuelaCenters(): Promise<CentroacopioCenter[]> {
  const url = new URL("https://tthturshkovywsluoqtv.supabase.co/rest/v1/acopio");
  url.searchParams.set(
    "select",
    "id,ambito,estado,pais,ciudad,direccion,organizacion,tipo,necesita,contacto,horario,updated_at"
  );
  url.searchParams.set("ambito", "eq.venezuela");
  url.searchParams.set("order", "updated_at.desc");
  url.searchParams.set("limit", "2000");

  const apiKey = "sb_publishable_amRzqevs9UFKz9ttOcyfrQ_m8dhYjGV";
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ayudavenezuela acopio → ${res.status}: ${body.slice(0, 200)}`);
  }

  const rows = (await res.json()) as AyudaVenezuelaAcopioRow[];
  return rows
    .filter((row) => row.organizacion && row.direccion)
    .map((row) => ({
      id: row.id,
      source: "ayudavenezuela.app",
      createdAt: row.updated_at || new Date().toISOString(),
      kind: row.tipo || "community",
      centerName: row.organizacion!.trim(),
      city: row.ciudad?.trim() || normalizeStateLabel(row.estado || "Venezuela"),
      sector: normalizeStateLabel(row.estado || "Venezuela"),
      address: row.direccion!.trim(),
      description: row.contacto?.trim() ? `Contacto: ${row.contacto.trim()}` : "",
      attentionStart: row.horario?.trim() || "",
      attentionEnd: "",
      requiredSupplies: ayudaVenezuelaSupplyLabels(row.necesita),
    }));
}

function parseTerremotoVenezuelaAcopioCenters(html: string): CentroacopioCenter[] {
  const lines = htmlToLines(html);
  const start = lines.findIndex((line) => line.includes("Centros de acopio") && line.includes("puntos"));
  const end = lines.findIndex((line) => line.includes("Si conoces otro punto de acopio activo"));
  if (start === -1 || end === -1 || end <= start) return [];

  const section = lines.slice(start + 1, end);
  const centers: CentroacopioCenter[] = [];
  let i = 0;

  while (i < section.length) {
    const scope = section[i]?.trim();
    if (!scope) {
      i += 1;
      continue;
    }

    const name = section[i + 1]?.trim();
    const addressLine = section[i + 2]?.trim();
    if (!name || !addressLine?.startsWith("📍")) {
      i += 1;
      continue;
    }

    i += 3;
    let schedule = "";
    if (section[i]?.startsWith("🕐")) {
      schedule = section[i].replace(/^🕐\s*/, "").trim();
      i += 1;
    }

    if (section[i] === "Reciben") i += 1;
    const supplies: string[] = [];
    while (i < section.length && !section[i].startsWith("Fuente:")) {
      const current = section[i].trim();
      if (current) supplies.push(current);
      i += 1;
    }

    const sourceLine = section[i] ?? "";
    const state = scope === "Nacional" ? "Venezuela" : scope.split("·")[0]?.trim() || "Venezuela";
    const city = scope === "Nacional" ? "Venezuela" : scope.split("·")[1]?.trim() || state;
    const address = addressLine.replace(/^📍\s*/, "").trim();
    const sourceName = sourceLine.replace(/^Fuente:\s*/i, "").trim() || "terremotovenezuela.app";

    centers.push({
      id: normalizeImportId("terremotovenezuela.app", name, address),
      source: "terremotovenezuela.app",
      createdAt: new Date().toISOString(),
      kind: "community",
      centerName: name,
      city,
      sector: normalizeStateLabel(state),
      address,
      description: `Fuente original: ${sourceName}`,
      attentionStart: schedule,
      attentionEnd: "",
      requiredSupplies: supplies.length ? supplies : ["Alimentos no perecederos"],
    });

    while (i < section.length && section[i] && !section[i].includes("·") && section[i] !== "Nacional") {
      i += 1;
    }
  }

  return centers;
}

async function fetchAlliedHelpCenterCenters(): Promise<CentroacopioCenter[]> {
  const allied: CentroacopioCenter[] = [];

  try {
    allied.push(...(await fetchAyudaVenezuelaCenters()));
  } catch (err) {
    console.error("[help-centers] ayudavenezuela scrape failed:", err);
  }

  try {
    allied.push(
      ...parseTerremotoVenezuelaAcopioCenters(await fetchHtml("https://terremotovenezuela.app/acopio"))
    );
  } catch (err) {
    console.error("[help-centers] terremotovenezuela.app scrape failed:", err);
  }

  return allied;
}

export function centroacopioMarker(id: string): string {
  return `${CENTROACOPIO_ID_PREFIX}${id}]]`;
}

export function centroacopioDeliveryMarker(id: string): string {
  return `${CENTROACOPIO_DELIVERY_PREFIX}${id}]]`;
}

async function fetchJson<T>(path: string, query?: Record<string, string>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`centroacopio ${url.pathname} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function fetchCentersWithQuery(query?: Record<string, string>): Promise<CentroacopioCenter[]> {
  const data = await fetchJson<{ items: CentroacopioCenter[] }>("/api/centers", query);
  return data.items ?? [];
}

async function fetchDeliveriesWithQuery(
  query?: Record<string, string>
): Promise<CentroacopioDelivery[]> {
  const data = await fetchJson<{ items: CentroacopioDelivery[] }>("/api/deliveries", query);
  return data.items ?? [];
}

function dedupeCenters(items: CentroacopioCenter[]): CentroacopioCenter[] {
  const byId = new Map<string, CentroacopioCenter>();
  for (const item of items) byId.set(`${sourceTag(item)}:${item.id}`, item);
  return [...byId.values()];
}

function dedupeDeliveries(items: CentroacopioDelivery[]): CentroacopioDelivery[] {
  const byId = new Map<string, CentroacopioDelivery>();
  for (const item of items) byId.set(item.id, item);
  return [...byId.values()];
}

/** Barrido por ciudad/sector para capturar todos los registros publicados. */
export async function fetchAllCentroacopioCenters(): Promise<CentroacopioCenter[]> {
  const collected: CentroacopioCenter[] = [];

  const ingest = (batch: CentroacopioCenter[]) => {
    collected.push(...batch);
  };

  ingest(await fetchCentersWithQuery());

  const queries = new Set<string>();
  for (const city of CENTROACOPIO_CITY_QUERIES) queries.add(city);

  for (const city of queries) {
    await sleep(SCRAPE_DELAY_MS);
    ingest(await fetchCentersWithQuery({ city }));
  }

  for (const zone of EMERGENCY_ZONES) {
    for (const keyword of zone.keywords.slice(0, 2)) {
      if (keyword.length < 4) continue;
      await sleep(SCRAPE_DELAY_MS);
      ingest(await fetchCentersWithQuery({ sector: keyword }));
    }
  }

  collected.push(...(await fetchAlliedHelpCenterCenters()));

  return dedupeCenters(collected);
}

export async function fetchAllCentroacopioDeliveries(): Promise<CentroacopioDelivery[]> {
  const collected: CentroacopioDelivery[] = [];
  const ingest = (batch: CentroacopioDelivery[]) => collected.push(...batch);

  ingest(await fetchDeliveriesWithQuery());

  for (const city of new Set(CENTROACOPIO_CITY_QUERIES)) {
    await sleep(SCRAPE_DELAY_MS);
    ingest(await fetchDeliveriesWithQuery({ city }));
  }

  return dedupeDeliveries(collected);
}

export async function fetchCentroacopioCenters(): Promise<CentroacopioCenter[]> {
  return fetchAllCentroacopioCenters();
}

export async function fetchCentroacopioDeliveries(): Promise<CentroacopioDelivery[]> {
  return fetchAllCentroacopioDeliveries();
}

export async function fetchCentroacopioSnapshot(): Promise<CentroacopioSnapshot> {
  console.log("Scraping acopios aliados (centroacopio + ayudavenezuela + terremotovenezuela)…");
  const [centers, deliveries] = await Promise.all([
    fetchAllCentroacopioCenters(),
    fetchAllCentroacopioDeliveries(),
  ]);
  return {
    source: BASE_URL,
    fetched_at: new Date().toISOString(),
    centers,
    deliveries,
  };
}

export function extractPhone(text: string): string | null {
  const match = text.match(/\b0(?:412|414|416|424|426|2\d{2})[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b/);
  return match ? match[0].replace(/[\s-]/g, "") : null;
}

export function mapSuppliesToAccepts(supplies: string[]): string[] {
  const accepts = new Set<string>();
  const haystack = supplies.join(" ").toLowerCase();
  if (/agua/.test(haystack)) accepts.add("water");
  if (/alimento|enlatado|comida|perecedero/.test(haystack)) accepts.add("food");
  if (/medicina|médic/.test(haystack)) accepts.add("medicine");
  if (/ropa|vestimenta/.test(haystack)) accepts.add("clothing");
  if (/papel\s*higi|aseo.*baño|baño|sanitario|cloro|papel\s*toalla/.test(haystack)) {
    accepts.add("bathroom_supplies");
  }
  if (/aseo|higiene|pañal/.test(haystack)) accepts.add("hygiene");
  if (/manta|frazada/.test(haystack)) accepts.add("blankets");
  if (!accepts.size) accepts.add("food");
  return [...accepts];
}

export function inferLocation(city: string, sector: string) {
  const probe = { city, state: sector };
  for (const zone of EMERGENCY_ZONES) {
    if (centerMatchesZone(probe, zone.id)) {
      const coords = ZONE_COORDS[zone.id];
      if (coords) {
        return {
          state: coords.state,
          city: city.split("/")[0]?.trim() || city,
          latitude: coords.lat,
          longitude: coords.lng,
        };
      }
    }
  }
  const primaryCity = city.split("/")[0]?.trim() || city;
  return {
    state: "Venezuela",
    city: primaryCity,
    latitude: 10.4806,
    longitude: -66.9036,
  };
}

export function mapCenterToHelpCenter(row: CentroacopioCenter) {
  const location = inferLocation(row.city, row.sector);
  const phone = extractPhone(row.description) ?? extractPhone(row.address);
  const source = sourceTag(row);
  const schedule =
    row.attentionStart && row.attentionEnd
      ? `${row.attentionStart}–${row.attentionEnd}`
      : row.attentionStart || row.attentionEnd || null;

  const descriptionParts = [
    source === CENTROACOPIO_SOURCE_TAG ? centroacopioMarker(row.id) : sourceMarker(source, row.id),
    row.description?.trim(),
    row.sector ? `Sector: ${row.sector}` : null,
    row.requiredSupplies.length
      ? `Reciben: ${row.requiredSupplies.join(", ")}`
      : null,
    `Fuente: ${source}`,
  ].filter(Boolean);

  return {
    externalId: row.id,
    name: row.centerName.trim(),
    description: descriptionParts.join("\n"),
    type: mapSourceType(row.kind),
    state: location.state,
    city: location.city,
    address: row.address.trim() || row.sector || row.city,
    latitude: location.latitude,
    longitude: location.longitude,
    phone,
    schedule,
    accepts: mapSuppliesToAccepts(row.requiredSupplies),
    isVerified: false,
    isActive: true,
    sourceCreatedAt: row.createdAt,
  };
}

const TRANSPORT_LABELS: Record<string, { es: string; en: string }> = {
  carro: { es: "Carro / camioneta", en: "Car / van" },
  moto: { es: "Moto", en: "Motorcycle" },
  camioneta: { es: "Camioneta", en: "Van" },
  camión: { es: "Camión", en: "Truck" },
  camion: { es: "Camión", en: "Truck" },
};

export function mapDeliveryToView(row: CentroacopioDelivery): CentroacopioDeliveryView {
  const location = inferLocation(row.city, row.sector);
  const transport = row.transportType?.trim().toLowerCase() || "vehiculo";
  const label = TRANSPORT_LABELS[transport] ?? { es: row.transportType, en: row.transportType };

  return {
    id: `centroacopio-delivery-${row.id}`,
    external_id: row.id,
    name: row.name.trim(),
    city: row.city,
    sector: row.sector,
    nearby_address: row.nearbyAddress,
    transport_type: transport,
    transport_label: label.es,
    phone: row.phone?.replace(/[\s-]/g, "") ?? "",
    state: location.state,
    source: CENTROACOPIO_SOURCE_TAG,
    created_at: row.createdAt,
  };
}

export function mapDeliveryToVolunteerNotes(row: CentroacopioDelivery): string {
  const view = mapDeliveryToView(row);
  return [
    centroacopioDeliveryMarker(row.id),
    `Transporte solidario importado desde ${CENTROACOPIO_SOURCE_TAG}`,
    `Vehículo: ${view.transport_label}`,
    view.sector ? `Sector: ${view.sector}` : null,
    view.nearby_address ? `Cobertura: ${view.nearby_address}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Oculta marcadores internos de importación en la UI. */
export function formatHelpCenterDescription(description: string | null): string | null {
  if (!description) return null;
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith(HELP_CENTER_SOURCE_PREFIX) &&
        !line.startsWith(CENTROACOPIO_ID_PREFIX) &&
        !line.startsWith(CENTROACOPIO_DELIVERY_PREFIX) &&
        !line.startsWith("Fuente:")
    );
  return lines.length ? lines.join("\n") : null;
}
