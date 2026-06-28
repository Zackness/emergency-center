import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import UnifiedMapView from "@/components/map/UnifiedMapView";
import { LAYER_COLORS } from "@/lib/map/layer-colors";
import { EMERGENCY_ZONES } from "@/data/emergency-zones";
import type { Locale } from "@/i18n/config";
import type { LandingMapCatalog } from "@/lib/map/landing-catalog";
import type { UnifiedMapLayer, UnifiedMapMarker } from "@/types/map";

export interface LandingMapLabels {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  filterZone: string;
  allZones: string;
  allLayers: string;
  severity: string;
  allSeverities: string;
  severityCollapsed: string;
  severityDamaged: string;
  severityEvacuated: string;
  showing: string;
  of: string;
  loading: string;
  error: string;
  retry: string;
  directions: string;
  openDetail: string;
  externalLink: string;
  source: string;
  noLocations: string;
  legend: string;
  layers: Record<UnifiedMapLayer, string>;
  stats: {
    missing: string;
    safe: string;
    helpPoints: string;
    trapped: string;
    children: string;
    childrenMissing: string;
    childrenCritical: string;
  };
}

interface CatalogResponse {
  markers: UnifiedMapMarker[];
  total: number;
  totalAvailable?: number;
  truncated?: boolean;
  counts?: Partial<Record<UnifiedMapLayer, number>>;
  redAyudaStats?: {
    desaparecidos: number;
    salvo: number;
    puntos: number;
    atrapados: number;
    ninos?: number;
  } | null;
  childrenStats?: {
    total: number;
    missing: number;
    critical: number;
    nexosignal: number;
    redayuda: number;
  } | null;
}

const ALL_LAYERS: UnifiedMapLayer[] = [
  "help_center",
  "hospital",
  "shelter",
  "damage",
  "quake",
  "redayuda",
  "platform",
  "children",
];

interface LandingMapHubProps {
  locale: Locale;
  labels: LandingMapLabels;
  initialCatalog?: LandingMapCatalog;
}

export default function LandingMapHub({ locale, labels, initialCatalog }: LandingMapHubProps) {
  const [markers, setMarkers] = useState<UnifiedMapMarker[]>(initialCatalog?.markers ?? []);
  const [counts, setCounts] = useState<Partial<Record<UnifiedMapLayer, number>>>(
    initialCatalog?.counts ?? {},
  );
  const [stats, setStats] = useState<CatalogResponse["redAyudaStats"]>(
    initialCatalog?.redAyudaStats ?? null,
  );
  const [childrenStats, setChildrenStats] = useState<CatalogResponse["childrenStats"]>(
    initialCatalog?.childrenStats ?? null,
  );
  const [loading, setLoading] = useState(!initialCatalog?.markers.length);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [activeLayers, setActiveLayers] = useState<Set<UnifiedMapLayer>>(new Set(ALL_LAYERS));
  const [refreshKey, setRefreshKey] = useState(0);
  const skipInitialFetch = useRef(!!initialCatalog?.markers.length);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchCatalog = useCallback(async () => {
    setLoading(markers.length === 0);
    setError(null);
    try {
      const params = new URLSearchParams({ lang: locale, limit: "2000" });
      if (zone !== "all") params.set("zone", zone);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (severity !== "all") params.set("severity", severity);
      if (activeLayers.size < ALL_LAYERS.length) {
        params.set("layers", [...activeLayers].join(","));
      }

      const res = await fetch(`/api/map/catalog?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as CatalogResponse;
      setMarkers(data.markers);
      setCounts(data.counts ?? {});
      setStats(data.redAyudaStats ?? null);
      setChildrenStats(data.childrenStats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setLoading(false);
    }
  }, [locale, zone, debouncedSearch, severity, activeLayers, labels.error, markers.length]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void fetchCatalog();
  }, [fetchCatalog, refreshKey]);

  const toggleLayer = (layer: UnifiedMapLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        if (next.size === 1) return prev;
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  const fitKey = useMemo(
    () => `${zone}-${severity}-${debouncedSearch}-${[...activeLayers].sort().join(",")}-${markers.length}`,
    [zone, severity, debouncedSearch, activeLayers, markers.length]
  );

  const zoneOptions = EMERGENCY_ZONES;

  return (
    <section id="mapa-emergencia" className="scroll-mt-20">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{labels.title}</h2>
          <p className="mt-2 text-sm text-ink-secondary sm:text-base">{labels.subtitle}</p>
        </div>
        {stats && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge bg-emergency-muted text-emergency">
              {labels.stats.missing}: {stats.desaparecidos.toLocaleString()}
            </span>
            <span className="badge bg-success-muted text-success">
              {labels.stats.safe}: {stats.salvo.toLocaleString()}
            </span>
            <span className="badge bg-accent-muted text-accent">
              {labels.stats.helpPoints}: {stats.puntos}
            </span>
            {stats.atrapados > 0 && (
              <span className="badge bg-warning-muted text-warning">
                {labels.stats.trapped}: {stats.atrapados}
              </span>
            )}
            {(childrenStats?.total ?? stats?.ninos ?? 0) > 0 && (
              <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {labels.stats.children}: {(childrenStats?.total ?? stats?.ninos ?? 0).toLocaleString()}
              </span>
            )}
            {(childrenStats?.missing ?? 0) > 0 && (
              <span className="badge bg-red-900/10 text-red-900 dark:bg-red-950 dark:text-red-200">
                {labels.stats.childrenMissing}: {childrenStats!.missing}
              </span>
            )}
            {(childrenStats?.critical ?? 0) > 0 && (
              <span className="badge bg-emergency-muted text-emergency">
                {labels.stats.childrenCritical}: {childrenStats!.critical}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="input flex-1"
            aria-label={labels.searchPlaceholder}
          />
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="input lg:max-w-[220px]"
            aria-label={labels.filterZone}
          >
            <option value="all">{labels.allZones}</option>
            {zoneOptions.map((z) => (
              <option key={z.id} value={z.id}>
                {locale === "es" ? z.label.es : z.label.en}
              </option>
            ))}
          </select>
          {activeLayers.has("damage") && (
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="input lg:max-w-[180px]"
              aria-label={labels.severity}
            >
              <option value="all">{labels.allSeverities}</option>
              <option value="collapsed">{labels.severityCollapsed}</option>
              <option value="damaged">{labels.severityDamaged}</option>
              <option value="evacuated">{labels.severityEvacuated}</option>
            </select>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_LAYERS.map((layer) => {
            const active = activeLayers.has(layer);
            const count = counts[layer];
            return (
              <button
                key={layer}
                type="button"
                onClick={() => toggleLayer(layer)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-transparent text-white shadow-sm"
                    : "border-border bg-surface-muted text-ink-secondary hover:border-accent/40"
                }`}
                style={active ? { backgroundColor: LAYER_COLORS[layer] } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: active ? "#fff" : LAYER_COLORS[layer] }}
                />
                {labels.layers[layer]}
                {count != null && <span className="opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-secondary">
          <span>
            {labels.showing} <strong className="text-ink">{markers.length}</strong>
            {loading ? ` — ${labels.loading}` : ""}
          </span>
          <span className="font-medium text-ink-secondary">{labels.legend}</span>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface-muted p-12 text-center">
          <p className="text-sm text-ink-secondary">{error}</p>
          <button type="button" className="btn-secondary text-sm" onClick={() => setRefreshKey((k) => k + 1)}>
            {labels.retry}
          </button>
        </div>
      ) : loading && markers.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-2xl border border-border bg-surface-muted text-ink-secondary w-full h-[min(70vh,720px)] min-h-[320px]"
          aria-busy="true"
        >
          {labels.loading}
        </div>
      ) : (
        <UnifiedMapView
          markers={markers}
          locale={locale}
          loading={loading}
          labels={{
            directions: labels.directions,
            openDetail: labels.openDetail,
            externalLink: labels.externalLink,
            source: labels.source,
            noLocations: labels.noLocations,
            loading: labels.loading,
          }}
          fitKey={fitKey}
        />
      )}
    </section>
  );
}
