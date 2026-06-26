import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Clock,
  Construction,
  Filter,
  HelpCircle,
  Megaphone,
  Search,
} from "lucide-react";
import MapView from "@/components/map/MapView";
import DamageReportForm from "@/components/forms/DamageReportForm";
import DamageReportGallery from "@/components/damage/DamageReportGallery";
import CommunityFeedback from "@/components/community/CommunityFeedback";
import type { DamageReport, DamageSeverity, MapLocation } from "@/types";
import type { CommunityConfidenceLevel } from "@/types/community-feedback";
import type { DamageMapStats } from "@/lib/damage-map/types";

interface DamageMapHubProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  severityLabels: Record<DamageSeverity, string>;
  formLabels: Record<string, string>;
  states: string[];
  feedbackLabels: Record<string, string>;
  confidenceLabels: Record<CommunityConfidenceLevel, string>;
}

const SEVERITY_COLORS: Record<DamageSeverity, string> = {
  collapsed: "#dc2626",
  damaged: "#f59e0b",
  evacuated: "#eab308",
};

const SEVERITY_STYLES: Record<DamageSeverity, string> = {
  collapsed: "bg-emergency-muted text-emergency",
  damaged: "bg-warning-muted text-warning",
  evacuated: "bg-yellow-100 text-yellow-800",
};

function formatRelativeTime(iso: string | null, locale: "es" | "en"): string {
  if (!iso) return locale === "es" ? "Sin datos" : "No data";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) {
    return locale === "es" ? `hace ${minutes} min` : `${minutes} min ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return locale === "es" ? `hace ${hours} h` : `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return locale === "es" ? `hace ${days} d` : `${days}d ago`;
}

export default function DamageMapHub({
  locale,
  labels,
  severityLabels,
  formLabels,
  states,
  feedbackLabels,
  confidenceLabels,
}: DamageMapHubProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [severity, setSeverity] = useState<DamageSeverity | "all">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState<DamageReport[]>([]);
  const [stats, setStats] = useState<DamageMapStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams({ limit: "10000", offset: "0" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (severity !== "all") params.set("severity", severity);
    if (stateFilter !== "all") params.set("state", stateFilter);

    const response = await fetch(`/api/damage-reports?${params.toString()}`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "Error loading damage reports");
    }
    const data = await response.json();
    setStats(data.stats);
    setTotal(data.total);
    setItems(data.items);
  }, [debouncedSearch, severity, stateFilter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelectedId(null);
    fetchReports()
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchReports, refreshKey]);

  const mapLocations: MapLocation[] = useMemo(
    () =>
      items.map((report) => ({
        id: report.id,
        name: report.title,
        latitude: report.latitude,
        longitude: report.longitude,
        type: "damage" as const,
        address: report.address ?? `${report.city}, ${report.state}`,
        severity: report.severity,
        image_urls: report.image_urls,
      })),
    [items]
  );

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-ink shadow-soft">
        <img
          src="/images/headers/emergencia-sismica.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/10" />
        <div className="relative flex min-h-[260px] flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{labels.hubTitle}</h1>
            <p className="mt-3 text-sm font-medium uppercase tracking-widest text-white/75">
              {labels.hubRegion}
            </p>
          </div>
          <a
            href="#ayuda-danos"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/25"
          >
            <HelpCircle className="h-4 w-4" />
            {labels.help}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-ink shadow-soft outline-none ring-accent/30 focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
            >
              <Filter className="h-4 w-4" />
              {labels.advancedFilters}
              <ChevronDown className={`h-4 w-4 transition ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <span className="text-sm text-ink-secondary">
              <strong className="text-ink">{total}</strong> {labels.buildingCount}
            </span>
          </div>
          {showFilters && (
            <div className="grid gap-3 rounded-2xl border border-border bg-surface-muted p-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">{labels.filterSeverity}</span>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as DamageSeverity | "all")}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2"
                >
                  <option value="all">{labels.filterAll}</option>
                  <option value="collapsed">{severityLabels.collapsed}</option>
                  <option value="damaged">{severityLabels.damaged}</option>
                  <option value="evacuated">{severityLabels.evacuated}</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-ink">{labels.filterState}</span>
                <select
                  value={stateFilter}
                  onChange={(event) => setStateFilter(event.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2"
                >
                  <option value="all">{labels.filterAll}</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
        <a href="#reportar" className="btn-emergency inline-flex items-center gap-2 self-start lg:self-auto">
          <Megaphone className="h-4 w-4" />
          {labels.reportBuilding}
        </a>
      </div>

      <div
        id="ayuda-danos"
        className="rounded-2xl border border-warning/30 bg-warning-muted/50 px-5 py-4 text-sm text-ink-secondary"
      >
        {labels.progressBanner}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emergency-muted text-emergency">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums text-ink">{stats?.collapsed ?? "—"}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              {severityLabels.collapsed}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-muted text-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums text-ink">{stats?.damaged ?? "—"}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              {severityLabels.damaged}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
            <Construction className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl font-bold tabular-nums text-ink">{stats?.evacuated ?? "—"}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              {severityLabels.evacuated}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink">
              {formatRelativeTime(stats?.last_synced_at ?? null, locale)}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              {labels.lastUpdate}
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-ink">{labels.legend}:</span>
            {(Object.keys(SEVERITY_COLORS) as DamageSeverity[]).map((key) => (
              <span key={key} className="inline-flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ background: SEVERITY_COLORS[key] }}
                />
                {severityLabels[key]}
              </span>
            ))}
          </div>
          {!loading && total > 0 && (
            <span className="text-sm text-ink-secondary">
              {locale === "es"
                ? `${items.length} marcadores en el mapa`
                : `${items.length} markers on map`}
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex h-[520px] items-center justify-center rounded-2xl border border-border bg-surface-muted text-sm text-ink-secondary">
            {labels.loading}
          </div>
        ) : (
          <MapView
            locations={mapLocations}
            locale={locale}
            height="520px"
            zoom={7}
            defaultCenter={[10.2, -67]}
          />
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">{labels.listTitle}</h2>
          {!loading && total > 0 && (
            <span className="text-sm text-ink-secondary">
              {locale === "es"
                ? `Mostrando ${items.length} de ${total}`
                : `Showing ${items.length} of ${total}`}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-3 rounded-2xl border border-emergency/30 bg-emergency-muted/40 p-4 text-sm text-emergency">
            {error}
          </p>
        )}
        {loading && (
          <p className="mt-3 rounded-2xl border border-border bg-surface-muted p-6 text-sm text-ink-secondary">
            {labels.loading}
          </p>
        )}
        {!loading && items.length === 0 && !error && (
          <p className="mt-3 rounded-2xl border border-border bg-surface-muted p-6 text-sm text-ink-secondary">
            {labels.empty}
          </p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((report) => (
            <article
              key={report.id}
              id={report.id}
              className={`card flex cursor-pointer flex-col overflow-hidden p-0 transition ${
                selectedId === report.id ? "ring-2 ring-accent" : "hover:border-accent/40"
              }`}
              onClick={() => setSelectedId((current) => (current === report.id ? null : report.id))}
            >
              <DamageReportGallery
                imageUrls={report.image_urls}
                title={report.title}
                locale={locale}
                expanded={selectedId === report.id}
                photosLabel={labels.photosCount}
                variant="grid"
              />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="line-clamp-2 font-semibold text-ink">{report.title}</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`badge text-xs ${SEVERITY_STYLES[report.severity]}`}>
                    {severityLabels[report.severity]}
                  </span>
                  {report.is_verified && (
                    <span className="badge-verified text-xs">{labels.verified}</span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-secondary">
                  {report.city}, {report.state}
                  {report.address ? ` — ${report.address}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {labels.directions}
                  </a>
                  {report.source_url && (
                    <a
                      href={report.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-secondary hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {labels.source}
                    </a>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4" onClick={(event) => event.stopPropagation()}>
                <CommunityFeedback
                  contentType="damage_report"
                  contentId={report.id}
                  locale={locale}
                  labels={feedbackLabels}
                  confidenceLabels={confidenceLabels}
                  compact
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="reportar">
        <h2 className="text-xl font-semibold text-ink">{labels.reportTitle}</h2>
        <p className="mt-2 mb-5 max-w-2xl text-sm text-ink-secondary">{labels.reportSubtitle}</p>
        <DamageReportForm
          locale={locale}
          labels={formLabels}
          states={states}
          onSubmitted={() => setRefreshKey((value) => value + 1)}
        />
      </section>
    </div>
  );
}
