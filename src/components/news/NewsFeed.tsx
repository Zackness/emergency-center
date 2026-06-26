import { useEffect, useState } from "react";
import { getNewsVoterToken } from "@/lib/news-voter-token";
import CommunityFeedback from "@/components/community/CommunityFeedback";
import type { CommunityConfidenceLevel } from "@/types/community-feedback";
import type {
  NewsConfidenceLevel,
  NewsItemWithCredibility,
} from "@/types/news";
interface NewsFeedProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  confidenceLabels: Record<NewsConfidenceLevel, string>;
  feedbackLabels: Record<string, string>;
  communityConfidenceLabels: Record<CommunityConfidenceLevel, string>;
}
type SortOption = "newest" | "most_credible" | "most_disputed";

function formatDate(dateStr: string, locale: "es" | "en") {
  return new Date(dateStr).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function confidenceClass(level: NewsConfidenceLevel) {
  switch (level) {
    case "likely_credible":
      return "bg-success-muted text-success";
    case "likely_false":
      return "bg-emergency-muted text-emergency";
    case "disputed":
      return "bg-warning-muted text-warning";
    default:
      return "bg-surface-muted text-ink-secondary";
  }
}

export default function NewsFeed({
  locale,
  labels,
  confidenceLabels,
  feedbackLabels,
  communityConfidenceLabels,
}: NewsFeedProps) {
  const [items, setItems] = useState<NewsItemWithCredibility[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function loadFeed(nextSort: SortOption = sort) {
    setLoading(true);
    setError("");
    try {
      const voterToken = getNewsVoterToken();
      const params = new URLSearchParams({ sort: nextSort, voter_token: voterToken });
      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setError(labels.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed(sort);
  }, [sort]);

  return (    <div className="space-y-6">
      <div className="rounded-2xl border border-warning/30 bg-warning-muted/30 p-4 text-sm text-ink-secondary">
        {labels.disclaimer}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink" htmlFor="news-sort">
          {labels.sortBy}
        </label>
        <select
          id="news-sort"
          className="input max-w-xs"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="newest">{labels.sortNewest}</option>
          <option value="most_credible">{labels.sortCredible}</option>
          <option value="most_disputed">{labels.sortDisputed}</option>
        </select>
      </div>

      {error && (
        <p className="rounded-xl bg-emergency-muted px-4 py-3 text-sm text-emergency">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-secondary">{labels.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-secondary">{labels.empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const { credibility } = item;
            const percent = credibility.credible_percent ?? 0;

            return (
              <article key={item.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{item.title}</h3>
                      {item.is_verified && (
                        <span className="badge-verified">{labels.verified}</span>
                      )}
                      {!item.is_verified && (
                        <span className="badge bg-surface-muted text-ink-secondary">
                          {labels.community}
                        </span>
                      )}
                      <span className={`badge ${confidenceClass(credibility.confidence)}`}>
                        {confidenceLabels[credibility.confidence]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink-secondary">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-muted">
                      <span>
                        {labels.source}: {item.source}
                      </span>
                      <span>{formatDate(item.published_at, locale)}</span>
                      <span>
                        {labels.votes}: {credibility.total_votes}
                      </span>
                    </div>
                  </div>
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full shrink-0 text-center text-xs sm:w-auto"
                  >
                    {labels.readSource} →
                  </a>
                </div>

                <CommunityFeedback
                  contentType="news"
                  contentId={item.id}
                  locale={locale}
                  labels={feedbackLabels}
                  confidenceLabels={communityConfidenceLabels}
                />
              </article>            );
          })}
        </div>
      )}
    </div>
  );
}
