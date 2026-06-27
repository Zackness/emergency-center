import { useCallback, useEffect, useState } from "react";
import CommunityFeedback from "@/components/community/CommunityFeedback";
import { formatNationalIdDisplay } from "@/lib/missing-persons/normalize";
import type { CommunityConfidenceLevel } from "@/types/community-feedback";
import type { MissingPersonWithSources } from "@/types";

interface RegistryLabels {
  searchPlaceholder: string;
  stateFilter: string;
  statusFilter: string;
  allStatuses: string;
  statusMissing: string;
  statusFound: string;
  allStates: string;
  showing: string;
  of: string;
  noResults: string;
  loadMore: string;
  loading: string;
  sources: string;
  lastSeen: string;
  nationalId: string;
  statsTotalReports: string;
  statsMissing: string;
  statsFound: string;
  statusBadge: {
    missing: string;
    found: string;
  };
}

interface MissingPersonRegistryProps {
  locale: "es" | "en";
  states: string[];
  labels: RegistryLabels;
  feedbackLabels: Record<string, string>;
  confidenceLabels: Record<CommunityConfidenceLevel, string>;
  initialStats?: {
    total_reports: number;
    missing: number;
    found: number;
  };
}

interface ApiResponse {
  items: MissingPersonWithSources[];
  total: number;
  page: number;
  limit: number;
}

const PERSON_STATUS_STYLES = {
  missing: "bg-emergency-muted text-emergency",
  found: "bg-success-muted text-success",
} as const;

function PersonCard({
  person,
  labels,
  locale,
  feedbackLabels,
  confidenceLabels,
}: {
  person: MissingPersonWithSources;
  labels: RegistryLabels;
  locale: "es" | "en";
  feedbackLabels: Record<string, string>;
  confidenceLabels: Record<CommunityConfidenceLevel, string>;
}) {
  const isFound = person.verification_status === "found";
  const statusKey = isFound ? "found" : "missing";

  return (
    <article className="card flex flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/5] w-full bg-surface-muted">
        {person.photo_url ? (
          <img
            src={person.photo_url}
            alt={person.full_name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 20a7 7 0 0 1 13 0" />
            </svg>
          </div>
        )}
        <span className={`badge absolute right-3 top-3 shadow-sm ${PERSON_STATUS_STYLES[statusKey]}`}>
          {labels.statusBadge[statusKey]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-ink text-lg">
          {person.full_name}
          {person.age != null && (
            <span className="text-ink-secondary font-normal">, {person.age}</span>
          )}
        </h3>
        {person.national_id && (
          <p className="mt-1 text-sm font-medium text-ink">
            {labels.nationalId}: {formatNationalIdDisplay(person.national_id)}
          </p>
        )}
        <p className="mt-1 text-sm text-ink-secondary">
          {labels.lastSeen}: {person.city}, {person.state}
          {person.last_seen_location && ` — ${person.last_seen_location}`}
        </p>

        {person.description && (
          <p className="mt-2 text-sm text-ink-secondary line-clamp-2">{person.description}</p>
        )}

        {person.sources.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted mb-2">
              {labels.sources}
            </p>
            <ul className="flex flex-wrap gap-2">
              {person.sources.map((source) => (
                <li key={source.id}>
                  {source.external_url ? (
                    <a
                      href={source.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-secondary hover:text-accent"
                    >
                      ↗ {source.source_name}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-secondary">
                      ● {source.source_name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-3">
          <CommunityFeedback
            contentType="missing_person"
            contentId={person.id}
            locale={locale}
            labels={feedbackLabels}
            confidenceLabels={confidenceLabels}
            compact
          />
        </div>
      </div>
    </article>
  );
}

export default function MissingPersonRegistry({
  states,
  labels,
  locale,
  feedbackLabels,
  confidenceLabels,
  initialStats,
}: MissingPersonRegistryProps) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState<"all" | "missing" | "found">("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MissingPersonWithSources[]>([]);
  const [total, setTotal] = useState(0);
  const [hubStats, setHubStats] = useState(initialStats);
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
      if (state) params.set("state", state);
      if (status !== "all") params.set("status", status);

      try {
        const res = await fetch(`/api/missing-persons?${params}`);
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
    [debouncedQ, state, status]
  );

  useEffect(() => {
    void fetch("/api/missing-persons/sync")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.total_reports != null) {
          setHubStats({
            total_reports: data.total_reports,
            missing: data.missing,
            found: data.found,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage]);

  const hasMore = items.length < total;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3 max-w-4xl">
        <div className="card flex flex-col items-center justify-center py-6 text-center">
          <p className="text-4xl font-extrabold tracking-tight text-ink">
            {(hubStats?.total_reports ?? 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-medium text-ink-secondary">
            {labels.statsTotalReports}
          </p>
        </div>
        <div className="card flex flex-col items-center justify-center border-accent/30 bg-accent-muted/20 py-6 text-center">
          <p className="text-4xl font-extrabold tracking-tight text-accent">
            {(hubStats?.missing ?? 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-medium text-ink-secondary">
            {labels.statsMissing}
          </p>
        </div>
        <div className="card flex flex-col items-center justify-center py-6 text-center">
          <p className="text-4xl font-extrabold tracking-tight text-ink">
            {(hubStats?.found ?? 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-medium text-ink-secondary">
            {labels.statsFound}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-4xl lg:flex-row">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="input flex-1"
          aria-label={labels.searchPlaceholder}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "missing" | "found")}
          className="input lg:max-w-[11rem]"
          aria-label={labels.statusFilter}
        >
          <option value="all">{labels.allStatuses}</option>
          <option value="missing">{labels.statusMissing}</option>
          <option value="found">{labels.statusFound}</option>
        </select>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="input lg:max-w-xs"
          aria-label={labels.stateFilter}
        >
          <option value="">{labels.allStates}</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-ink-secondary">
        {labels.showing} {items.length} {labels.of} {total.toLocaleString()}
      </p>

      {items.length === 0 && !loading ? (
        <p className="text-ink-secondary text-sm">{labels.noResults}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              labels={labels}
              locale={locale}
              feedbackLabels={feedbackLabels}
              confidenceLabels={confidenceLabels}
            />
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
