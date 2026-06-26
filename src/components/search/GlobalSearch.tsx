import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { SearchIndexItem, SearchResultType } from "@/types/search";
import { groupResults, searchIndex } from "@/lib/search";

const SEARCH_INDEX_SCRIPT_ID = "search-index-data";

interface GlobalSearchProps {
  locale: "es" | "en";
  index?: SearchIndexItem[];
  initialQuery?: string;
  labels: {
    placeholder: string;
    placeholderShort?: string;
    noResults: string;
    resultsFor: string;
    hint: string;
    external: string;
    categories: Record<SearchResultType, string>;
  };
  compact?: boolean;
  primary?: boolean;
  inputId?: string;
}

function readIndexFromDom(): SearchIndexItem[] {
  if (typeof document === "undefined") return [];
  const node = document.getElementById(SEARCH_INDEX_SCRIPT_ID);
  if (!node?.textContent) return [];
  try {
    const parsed = JSON.parse(node.textContent) as SearchIndexItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function focusGlobalSearch() {
  const primary = document.querySelector<HTMLInputElement>("[data-search-primary]");
  if (primary && primary.offsetParent !== null) {
    primary.focus();
    return;
  }
  for (const input of document.querySelectorAll<HTMLInputElement>("[data-global-search-input]")) {
    if (input.offsetParent !== null) {
      input.focus();
      return;
    }
  }
}

export default function GlobalSearch({
  locale,
  index,
  initialQuery = "",
  labels,
  compact = false,
  primary = false,
  inputId = "global-search",
}: GlobalSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [resolvedIndex, setResolvedIndex] = useState<SearchIndexItem[]>(index ?? []);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (index?.length) {
      setResolvedIndex(index);
      return;
    }
    const fromDom = readIndexFromDom();
    if (fromDom.length) setResolvedIndex(fromDom);
  }, [index]);

  useEffect(() => {
    if (!initialQuery) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) setQuery(q);
    }
  }, [initialQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        focusGlobalSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = useMemo(
    () => searchIndex(resolvedIndex, query),
    [resolvedIndex, query],
  );

  const groups = useMemo(
    () => groupResults(results, labels.categories),
    [results, labels.categories],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `/${locale}/buscar?q=${encodeURIComponent(q)}`;
  }

  const showResults = query.trim().length >= 2;
  const placeholder = compact && labels.placeholderShort
    ? labels.placeholderShort
    : labels.placeholder;

  return (
    <div className={compact ? "relative w-full" : "w-full max-w-3xl mx-auto"}>
      <form onSubmit={handleSubmit} className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted sm:left-4">
          <svg xmlns="http://www.w3.org/2000/svg" width={compact ? 16 : 18} height={compact ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`input w-full ${compact ? "pl-9 py-1.5 text-sm" : "pl-11 pr-4 py-3 text-base sm:pr-24"}`}
          aria-label={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          data-global-search-input
          {...(primary ? { "data-search-primary": true } : {})}
        />
        {!compact && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border border-border bg-surface-muted px-2 py-0.5 text-xs text-ink-muted sm:inline">
            Ctrl+K
          </kbd>
        )}
      </form>

      {!compact && (
        <p className="mt-3 text-sm text-ink-secondary text-center">{labels.hint}</p>
      )}

      {showResults && (
        <div
          className={
            compact
              ? "absolute left-0 right-0 top-full z-[60] mt-1"
              : "relative z-30 mt-6"
          }
          role="region"
          aria-live="polite"
          aria-label={labels.resultsFor.replace("{query}", query)}
        >
          <div className="max-h-[min(60vh,28rem)] overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-4 shadow-elevated">
            {groups.length === 0 ? (
              <p className="text-sm text-ink-secondary py-2">{labels.noResults}</p>
            ) : (
              <>
                {!compact && (
                  <p className="text-sm text-ink-muted mb-4">
                    {labels.resultsFor.replace("{query}", query)} ({results.length})
                  </p>
                )}
                <div className="space-y-4">
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
                              className="block rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted hover:border-accent/30"
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
        </div>
      )}
    </div>
  );
}
