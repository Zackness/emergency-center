import { writeFile } from "node:fs/promises";
import { DATA_CACHE_SLUGS } from "@/lib/data-cache";
import { fetchExternalBuildings } from "@/lib/damage-map/adapter";
import { syncDamageBuildingsRest } from "@/lib/damage-map/sync-rest";
import { fetchDonarSeguroSnapshot } from "@/lib/donarseguro/fetch";
import { fetchCentroacopioSnapshot } from "@/lib/help-centers/centroacopio";
import { fetchAllChildrenEmergencyCasesForSnapshot } from "@/lib/children-emergency/feed";
import { fetchMissingPetsSnapshot } from "@/lib/missing-pets/snapshot";
import { fetchRedAyudaSnapshot } from "@/lib/redayuda/fetch";
import { fetchYummySosSnapshot } from "@/lib/yummyrides-sos/fetch";
import { yummyReportsToBuildings } from "@/lib/yummyrides-sos/normalize";
import { syncYummyDamageReportsRest } from "@/lib/yummyrides-sos/sync-damage-rest";
import { syncYummyHelpCentersRest } from "@/lib/yummyrides-sos/sync-help-centers-rest";
import type { YummySosSnapshot } from "@/lib/yummyrides-sos/types";
import { fetchVzlaAyudaSnapshot } from "@/lib/vzlayuda/fetch";
import type { AlliedScraperAdapter } from "./types";

async function writeJson(relativePath: string, payload: unknown) {
  const url = new URL(`../../${relativePath}`, import.meta.url);
  await writeFile(url, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export const ALLIED_SCRAPER_ADAPTERS: AlliedScraperAdapter[] = [
  {
    id: "redayuda",
    domains: ["redayudavenezuela.com"],
    label: "Red Ayuda Venezuela",
    cacheSlug: DATA_CACHE_SLUGS.REDAYUDA,
    jsonFile: "src/data/redayuda.json",
    fetch: fetchRedAyudaSnapshot,
    countItems: (p) => {
      const s = p as { quakes?: unknown[]; stats?: unknown };
      return (s.quakes?.length ?? 0) + (s.stats ? 1 : 0);
    },
  },
  {
    id: "vzlayuda",
    domains: ["vzlayuda.com"],
    label: "Vzla Ayuda",
    cacheSlug: DATA_CACHE_SLUGS.VZLAYUDA_AVISOS,
    jsonFile: "src/data/vzlayuda-avisos.json",
    fetch: fetchVzlaAyudaSnapshot,
    countItems: (p) => (p as { avisos?: unknown[] }).avisos?.length ?? 0,
  },
  {
    id: "missing-pets",
    domains: ["huellascan.com"],
    label: "HuellasCAN — mascotas",
    cacheSlug: DATA_CACHE_SLUGS.MISSING_PETS,
    jsonFile: "src/data/missing-pets.json",
    fetch: fetchMissingPetsSnapshot,
    countItems: (p) => (p as { items?: unknown[] }).items?.length ?? 0,
  },
  {
    id: "children-emergency",
    domains: ["busca.nexosignal.co"],
    label: "Niños de Pie / NexoSignal",
    cacheSlug: DATA_CACHE_SLUGS.CHILDREN_EMERGENCY,
    jsonFile: "src/data/children-emergency-records.json",
    async fetch() {
      const items = await fetchAllChildrenEmergencyCasesForSnapshot();
      return {
        fetched_at: new Date().toISOString(),
        count: items.length,
        items,
      };
    },
    countItems: (p) => (p as { items?: unknown[] }).items?.length ?? 0,
  },
  {
    id: "centroacopio",
    domains: ["centroacopio.site", "ayudavenezuela.app"],
    label: "Centroacopio / Ayuda Venezuela",
    cacheSlug: DATA_CACHE_SLUGS.CENTROACOPIO,
    jsonFile: "src/data/centroacopio.json",
    fetch: fetchCentroacopioSnapshot,
    countItems: (p) => (p as { centers?: unknown[] }).centers?.length ?? 0,
  },
  {
    id: "damage-terremoto",
    domains: ["terremotovenezuela.com"],
    label: "Terremoto Venezuela — mapa de daños",
    cacheSlug: "allied-terremotovenezuela-com",
    jsonFile: "src/data/damage-buildings.json",
    async fetch() {
      const items = await fetchExternalBuildings();
      return {
        source: "https://terremotovenezuela.com",
        fetched_at: new Date().toISOString(),
        count: items.length,
        items,
      };
    },
    async sync(payload) {
      const items = (payload as { items?: import("@/lib/damage-map/types").ImportedBuilding[] })
        .items ?? [];
      const result = await syncDamageBuildingsRest(items);
      return { created: result.created, updated: result.updated };
    },
    countItems: (p) => (p as { items?: unknown[] }).items?.length ?? 0,
  },
  {
    id: "donarseguro",
    domains: ["donarseguro.com"],
    label: "DonarSeguro",
    cacheSlug: DATA_CACHE_SLUGS.DONARSEGURO,
    jsonFile: "src/data/donarseguro.json",
    fetch: fetchDonarSeguroSnapshot,
    countItems: (p) => (p as { organizations?: unknown[] }).organizations?.length ?? 0,
  },
  {
    id: "yummyrides-sos",
    domains: ["sos.yummyrides.com"],
    label: "Yummy SOS",
    cacheSlug: DATA_CACHE_SLUGS.YUMMYRIDES_SOS,
    jsonFile: "src/data/yummyrides-sos.json",
    fetch: fetchYummySosSnapshot,
    async sync(payload) {
      const snapshot = payload as YummySosSnapshot;
      const buildings = yummyReportsToBuildings(
        snapshot.damage_reports ?? [],
        snapshot.fetched_at
      );
      const damage = await syncYummyDamageReportsRest(buildings);
      const centers = await syncYummyHelpCentersRest(snapshot.help_centers ?? []);
      return {
        created: damage.created + centers.created,
        updated: damage.updated + centers.updated,
      };
    },
    countItems: (p) => {
      const s = p as YummySosSnapshot;
      return (s.damage_reports?.length ?? 0) + (s.help_centers?.length ?? 0);
    },
  },
];

export function normalizeAlliedDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^www\./, "");
}

export function findScraperAdapterForDomain(domain: string): AlliedScraperAdapter | null {
  const normalized = normalizeAlliedDomain(domain);
  return (
    ALLIED_SCRAPER_ADAPTERS.find((adapter) =>
      adapter.domains.some(
        (d) => normalized === d || normalized.endsWith(`.${d}`)
      )
    ) ?? null
  );
}

export async function persistAdapterJson(adapter: AlliedScraperAdapter, payload: unknown) {
  if (!adapter.jsonFile) return;
  await writeJson(adapter.jsonFile, payload);
}
