import { useCallback, useEffect, useState } from "react";
import type {
  ChildEmergencyCase,
  ChildEmergencySource,
  ChildHealthStatus,
} from "@/lib/children-emergency/types";

interface RegistryLabels {
  searchPlaceholder: string;
  sourceFilter: string;
  allSources: string;
  sources: Record<ChildEmergencySource, string>;
  healthFilter: string;
  allHealth: string;
  health: Record<ChildHealthStatus, string>;
  hospitalFilter: string;
  allHospitals: string;
  showing: string;
  of: string;
  noResults: string;
  loadMore: string;
  loading: string;
  age: string;
  hospital: string;
  location: string;
  statement: string;
  contact: string;
  source: string;
  custody: string;
  custodyStatus: Record<string, string>;
}

interface ChildrenEmergencyRegistryProps {
  locale: "es" | "en";
  hospitals: string[];
  labels: RegistryLabels;
  initialStats?: {
    total: number;
    nexosignal: number;
    redayuda: number;
  };
}

interface ApiResponse {
  items: ChildEmergencyCase[];
  total: number;
}

const SOURCE_OPTIONS: Array<{ value: ChildEmergencySource | "all"; icon: string }> = [
  { value: "all", icon: "??" },
  { value: "nexosignal", icon: "??" },
  { value: "redayuda", icon: "??" },
];

const HEALTH_OPTIONS: Array<{ value: ChildHealthStatus | "all" }> = [
  { value: "all" },
  { value: "stable" },
  { value: "critical" },
  { value: "unidentified" },
  { value: "unknown" },
];

const HEALTH_STYLES: Record<ChildHealthStatus, string> = {
  stable: "bg-success-muted text-success",
  critical: "bg-emergency-muted text-emergency",
  unidentified: "bg-warning-muted text-warning",
  unknown: "bg-surface-muted text-ink-muted",
};

const SOURCE_STYLES: Record<ChildEmergencySource, string> = {
  nexosignal: "bg-emergency-muted text-emergency",
  redayuda: "bg-accent-muted text-accent",
};

function filterChipClass(active: boolean): string {
  return active
    ? "border-accent bg-accent text-white shadow-sm"
    : "border-border bg-surface-elevated text-ink-secondary hover:border-accent/40 hover:text-ink";
}

function ChildCard({
  item,
  labels,
  locale,
}: {
  item: ChildEmergencyCase;
  labels: RegistryLabels;
  locale: "es" | "en";
}) {
  const reportedLabel = new Date(item.reported_at).toLocaleDateString(
    locale === "es" ? "es-VE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" }
  );

  const whatsappUrl = item.contact_phone
    ? `https://wa.me/${item.contact_phone.replace(/\D/g, "")}`
    : null;

  return (
    <article className="card overflow-hidden">
      <div className="aspect-[4/3] bg-surface-muted">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.name}
            className="h-full w-full object-contain bg-surface-muted"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl" aria-hidden="true">
            ??
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold text-ink leading-snug">{item.name}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SOURCE_STYLES[item.source]}`}
          >
            {labels.sources[item.source]}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.age && (
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-ink-secondary">
              {labels.age}: {item.age}
            </span>
          )}
          {item.health_status !== "unknown" && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${HEALTH_STYLES[item.health_status]}`}
            >
              {labels.health[item.health_status]}
            </span>
          )}
        </div>

        {item.hospital && (
          <p className="text-sm text-ink-secondary">
            <span className="font-medium text-ink">{labels.hospital}:</span> {item.hospital}
          </p>
        )}
        {item.found_location && (
          <p className="text-sm text-ink-secondary">
            <span className="font-medium text-ink">{labels.location}:</span> {item.found_location}
          </p>
        )}
        {item.child_statement && (
          <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm italic text-ink-secondary">
            &ldquo;{item.child_statement}&rdquo;
          </p>
        )}
        {item.custody_status && (
          <p className="text-xs text-ink-muted">
            {labels.custody}: {labels.custodyStatus[item.custody_status] ?? item.custody_status}
          </p>
        )}
        <p className="text-xs text-ink-muted">{reportedLabel}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs"
            >
              WhatsApp
            </a>
          )}
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            {labels.source} ?
          </a>
        </div>
      </div>
    </article>
  );
}

export default function ChildrenEmergencyRegistry({
  hospitals,
  labels,
  locale,
  initialStats,
}: ChildrenEmergencyRegistryProps) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [source, setSource] = useState<ChildEmergencySource | "all">("all");
  const [health, setHealth] = useState<ChildHealthStatus | "all">("all");
  const [hospital, setHospital] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChildEmergencyCase[]>([]);
  const [total, setTotal] = useState(initialStats?.total ?? 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(timer);
  }, [q]);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "24",
      });
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
      if (source !== "all") params.set("source", source);
      if (health !== "all") params.set("health", health);
      if (hospital) params.set("hospital", hospital);

      try {
        const res = await fetch(`/api/children-emergency?${params}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as ApiResponse;
        setTotal(data.total);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setPage(pageNum);
      } catch {
        if (!append) setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedQ, source, health, hospital]
  );

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage]);

  const hasMore = items.length < total;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {labels.sourceFilter}
          </p>
          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map((option) => {
              const active = source === option.value;
              const label =
                option.value === "all" ? labels.allSources : labels.sources[option.value];
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${filterChipClass(active)}`}
                  onClick={() => setSource(option.value)}
                  aria-pressed={active}
                >
                  <span aria-hidden="true">{option.icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {labels.healthFilter}
          </p>
          <div className="flex flex-wrap gap-2">
            {HEALTH_OPTIONS.map((option) => {
              const active = health === option.value;
              const label =
                option.value === "all" ? labels.allHealth : labels.health[option.value];
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${filterChipClass(active)}`}
                  onClick={() => setHealth(option.value)}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex max-w-4xl flex-col gap-3 lg:flex-row">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="input flex-1"
          aria-label={labels.searchPlaceholder}
        />
        {hospitals.length > 0 && (
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            className="input lg:max-w-sm"
            aria-label={labels.hospitalFilter}
          >
            <option value="">{labels.allHospitals}</option>
            {hospitals.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="text-sm text-ink-secondary">
        {labels.showing} {items.length} {labels.of} {total.toLocaleString()}
      </p>

      {items.length === 0 && !loading ? (
        <p className="text-sm text-ink-secondary">{labels.noResults}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ChildCard key={item.id} item={item} labels={labels} locale={locale} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => void fetchPage(page + 1, true)}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? labels.loading : labels.loadMore}
        </button>
      )}
    </div>
  );
}
