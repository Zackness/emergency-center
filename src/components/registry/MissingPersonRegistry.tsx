import { useCallback, useEffect, useState } from "react";
import CommunityFeedback from "@/components/community/CommunityFeedback";
import type { CommunityConfidenceLevel } from "@/types/community-feedback";
import type { MissingPersonWithSources } from "@/types";

interface RegistryLabels {
  searchPlaceholder: string;
  stateFilter: string;
  allStates: string;
  showing: string;
  of: string;
  noResults: string;
  loadMore: string;
  loading: string;
  sources: string;
  lastSeen: string;
  verification: Record<string, string>;
}

interface MissingPersonRegistryProps {
  locale: "es" | "en";
  states: string[];
  labels: RegistryLabels;
  feedbackLabels: Record<string, string>;
  confidenceLabels: Record<CommunityConfidenceLevel, string>;
  initialStats?: {
    unique_active: number;
    total_external_records: number;
  };
}

interface ApiResponse {
  items: MissingPersonWithSources[];
  total: number;
  page: number;
  limit: number;
}

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
  const statusClass =
    person.verification_status === "family_verified" ||
    person.verification_status === "org_verified"
      ? "badge-verified"
      : "badge-warning";

  return (
    <article className="card">
      <div className="flex gap-4">
        {person.photo_url && (
          <img
            src={person.photo_url}
            alt=""
            className="h-20 w-20 rounded-lg object-cover shrink-0 bg-surface-muted"
            loading="lazy"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-ink text-lg">
                {person.full_name}
                {person.age != null && (
                  <span className="text-ink-secondary font-normal">, {person.age}</span>
                )}
              </h3>
              <p className="mt-1 text-sm text-ink-secondary">
                {labels.lastSeen}: {person.city}, {person.state}
                {person.last_seen_location && ` — ${person.last_seen_location}`}
              </p>
            </div>
            <span className={statusClass}>
              {labels.verification[person.verification_status] ?? person.verification_status}
            </span>
          </div>

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
        </div>
      </div>
      <CommunityFeedback
        contentType="missing_person"
        contentId={person.id}
        locale={locale}
        labels={feedbackLabels}
        confidenceLabels={confidenceLabels}
        compact
      />
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
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MissingPersonWithSources[]>([]);
  const [total, setTotal] = useState(initialStats?.unique_active ?? 0);
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
    [debouncedQ, state]
  );

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage]);

  const hasMore = items.length < total;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="input flex-1"
          aria-label={labels.searchPlaceholder}
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="input sm:max-w-xs"
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
