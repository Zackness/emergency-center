import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { SearchIndexItem, SearchResultType } from "@/types/search";
import { groupResults, searchIndex } from "@/lib/search";

interface GlobalSearchProps {
  locale: "es" | "en";
  index: SearchIndexItem[];
  initialQuery?: string;
  labels: {
    placeholder: string;
    noResults: string;
    resultsFor: string;
    hint: string;
    external: string;
    categories: Record<SearchResultType, string>;
  };
  compact?: boolean;
}

export default function GlobalSearch({
  locale,
  index,
  initialQuery = "",
  labels,
  compact = false,
}: GlobalSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = useMemo(
    () => searchIndex(index, query),
    [index, query]
  );

  const groups = useMemo(
    () => groupResults(results, labels.categories),
    [results, labels.categories]
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const url = `/${locale}/buscar?q=${encodeURIComponent(q)}`;
    if (window.location.pathname !== `/${locale}/buscar`) {
      window.location.href = url;
    }
  }

  return (
    <div className={compact ? "w-full max-w-md" : "w-full max-w-3xl mx-auto"}>
      <form onSubmit={handleSubmit} className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          className={`input w-full pl-11 ${compact ? "pr-4 py-2 text-sm" : "pr-24 py-3 text-base"}`}
          aria-label={labels.placeholder}
          autoComplete="off"
        />
        {!compact && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border border-zinc-200 bg-surface-muted px-2 py-0.5 text-xs text-ink-muted sm:inline">
            Ctrl+K
          </kbd>
        )}
      </form>

      {!compact && (
        <p className="mt-3 text-sm text-ink-secondary text-center">{labels.hint}</p>
      )}

      {query.trim().length >= 2 && (
        <div className={compact ? "mt-2" : "mt-8"}>
          {groups.length === 0 ? (
            <p className="text-sm text-ink-secondary py-4">{labels.noResults}</p>
          ) : (
            <>
              {!compact && (
                <p className="text-sm text-ink-muted mb-4">
                  {labels.resultsFor.replace("{query}", query)} ({results.length})
                </p>
              )}
              <div className="space-y-6">
                {groups.map((group) => (
                  <section key={group.type}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">
                      {group.label}
                    </h3>
                    <ul className="space-y-2">
                      {group.items.map((result) => (
                        <li key={result.id}>
                          <a
                            href={result.href}
                            target={result.external ? "_blank" : undefined}
                            rel={result.external ? "noopener noreferrer" : undefined}
                            className="block rounded-xl border border-zinc-200/80 bg-surface-elevated px-4 py-3 transition-colors hover:bg-surface-muted hover:border-zinc-300"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium text-ink truncate">{result.title}</p>
                                {result.description && (
                                  <p className="mt-0.5 text-sm text-ink-secondary line-clamp-2">
                                    {result.description}
                                  </p>
                                )}
                                {result.meta && (
                                  <p className="mt-1 text-xs text-ink-muted">{result.meta}</p>
                                )}
                              </div>
                              {result.external && (
                                <span className="shrink-0 text-xs text-ink-muted">
                                  {labels.external} ↗
                                </span>
                              )}
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
