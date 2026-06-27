import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { centerSectionPath, DEFAULT_CENTER_SECTION } from "@/lib/center-manage-page";

interface ManagedCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  isVerified: boolean;
}

interface CenterSwitcherLabels {
  search: string;
  allCenters: string;
  verified: string;
  pending: string;
}

interface CenterSwitcherProps {
  locale: Locale;
  centerId: string;
  centerName: string;
  panelPath: string;
  labels: CenterSwitcherLabels;
}

function ChevronUpDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="opacity-60"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

export default function CenterSwitcher({
  locale,
  centerId,
  centerName,
  panelPath,
  labels,
}: CenterSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [centers, setCenters] = useState<ManagedCenter[]>([]);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const loadCenters = useCallback(async () => {
    try {
      const res = await fetch("/api/center-dashboard/session");
      if (!res.ok) return;
      const data = (await res.json()) as { centers?: ManagedCenter[] };
      setCenters(data.centers ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadCenters();
  }, [loadCenters]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return centers;
    return centers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    );
  }, [centers, query]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-full items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-ink transition-colors hover:bg-surface-muted/60"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="shrink-0 text-ink-muted"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span className="truncate">{centerName}</span>
        <ChevronUpDown />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-soft"
          role="listbox"
        >
          <div className="border-b border-border p-2">
            <input
              type="search"
              className="input text-sm"
              placeholder={labels.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-ink-muted">—</li>
            ) : (
              filtered.map((center) => (
                <li key={center.id}>
                  <a
                    href={centerSectionPath(locale, center.id, DEFAULT_CENTER_SECTION)}
                    className={`flex items-start justify-between gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted/60 ${
                      center.id === centerId ? "bg-surface-muted/40" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{center.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {center.city}, {center.state}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        center.isVerified
                          ? "bg-success-muted text-success"
                          : "bg-warning-muted text-warning"
                      }`}
                    >
                      {center.isVerified ? labels.verified : labels.pending}
                    </span>
                  </a>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-border p-2">
            <a
              href={panelPath}
              className="block rounded-md px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-muted/60 hover:text-ink"
              onClick={() => setOpen(false)}
            >
              ← {labels.allCenters}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
