import { useCallback, useEffect, useState } from "react";
import type { HelpListingItem } from "@/lib/vzlayuda/feed";
import { VZLAYUDA_CATEGORIES } from "@/lib/vzlayuda/types";
import { phoneTelHref } from "@/lib/phone";

export interface HelpListingLabels {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  sourceAll: string;
  sourceVzlayuda: string;
  sourceLocal: string;
  stateFilter: string;
  allStates: string;
  categoryFilter: string;
  allCategories: string;
  showing: string;
  of: string;
  loading: string;
  noResults: string;
  offerBadge: string;
  requestBadge: string;
  contact: string;
  contactOnVzlayuda: string;
  publishOnVzlayuda: string;
  fetchedAt: string;
  statsCount: string;
}

interface ApiResponse {
  items: HelpListingItem[];
  total: number;
  counts: { offer: number; request: number; vzlayuda: number; local: number };
  fetched_at?: string;
  vzlayuda_counts?: { oferta: number; solicitud: number; total: number };
}

interface HelpListingRegistryProps {
  locale: "es" | "en" | "pt" | "it";
  labels: HelpListingLabels;
  states: string[];
  fixedKind: "offer" | "request";
  anchorId: string;
}

function whatsappHref(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function formatRelative(iso: string | null, locale: string) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return locale === "es" ? "hace un momento" : "just now";
    if (hours < 48) return locale === "es" ? `hace ${hours} h` : `${hours}h ago`;
    return date.toLocaleDateString(locale === "es" ? "es-VE" : "en-US");
  } catch {
    return "";
  }
}

function ListingCard({
  item,
  labels,
  locale,
}: {
  item: HelpListingItem;
  labels: HelpListingLabels;
  locale: HelpListingRegistryProps["locale"];
}) {
  const isOffer = item.kind === "offer";
  const location = [item.city, item.state].filter(Boolean).join(", ");
  const zone = item.zone ? ` · ${item.zone}` : "";

  return (
    <article className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`badge ${isOffer ? "bg-success-muted text-success" : "bg-emergency-muted text-emergency"}`}
        >
          {isOffer ? labels.offerBadge : labels.requestBadge}
        </span>
        {item.category && (
          <span className="badge bg-surface-muted text-ink-secondary capitalize">{item.category}</span>
        )}
        <span className="ml-auto text-xs text-ink-muted">{formatRelative(item.createdAt, locale)}</span>
      </div>

      <div>
        <h3 className="font-semibold text-ink">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-4 text-sm text-ink-secondary">{item.description}</p>
        )}
        <p className="mt-2 text-xs text-ink-muted">
          {item.contactName && <span className="font-medium text-ink-secondary">{item.contactName}</span>}
          {location && (
            <span>
              {item.contactName ? " · " : ""}
              {location}
              {zone}
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {item.contactPhone ? (
          <a
            href={whatsappHref(
              item.contactPhone,
              locale === "es"
                ? `Hola, vi tu ${isOffer ? "ofrecimiento" : "solicitud"} "${item.title}" en Centro de Emergencia.`
                : `Hello, I saw your ${isOffer ? "offer" : "request"} "${item.title}" on Emergency Center.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            WhatsApp
          </a>
        ) : (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            {labels.contactOnVzlayuda} ↗
          </a>
        )}
        {item.contactPhone && (
          <a href={phoneTelHref(item.contactPhone)} className="btn-secondary text-sm">
            {labels.contact}
          </a>
        )}
        <span className="self-center text-xs text-ink-muted">{item.source}</span>
      </div>
    </article>
  );
}

export default function HelpListingRegistry({
  locale,
  labels,
  states,
  fixedKind,
  anchorId,
}: HelpListingRegistryProps) {
  const [items, setItems] = useState<HelpListingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [source, setSource] = useState<"all" | "vzlayuda" | "local">("all");
  const [state, setState] = useState("all");
  const [category, setCategory] = useState("all");

  const isOffer = fixedKind === "offer";
  const sectionBorder = isOffer ? "border-success/25" : "border-emergency/25";
  const sectionBg = isOffer ? "bg-success-muted/20" : "bg-emergency-muted/20";

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "80", kind: fixedKind });
      if (source !== "all") params.set("source", source);
      if (state !== "all") params.set("state", state);
      if (category !== "all") params.set("category", category);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/vzlayuda/avisos?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as ApiResponse;
      setItems(data.items);
      setTotal(data.total);
      setFetchedAt(data.fetched_at ?? null);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [fixedKind, source, state, category, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section id={anchorId} className={`scroll-mt-24 rounded-2xl border ${sectionBorder} ${sectionBg} p-5 sm:p-6`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">{labels.title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-secondary">{labels.subtitle}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`badge ${isOffer ? "bg-success-muted text-success" : "bg-emergency-muted text-emergency"}`}
          >
            {labels.statsCount}: {total}
          </span>
          {fetchedAt && (
            <span className="self-center text-ink-muted">
              {labels.fetchedAt}{" "}
              {new Date(fetchedAt).toLocaleString(locale === "es" ? "es-VE" : "en-US")}
            </span>
          )}
          <a
            href="https://vzlayuda.com/publicar"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-accent hover:underline"
          >
            {labels.publishOnVzlayuda} ↗
          </a>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-surface/80 p-4 lg:grid-cols-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="input lg:col-span-2"
        />
        <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className="input">
          <option value="all">{labels.sourceAll}</option>
          <option value="vzlayuda">{labels.sourceVzlayuda}</option>
          <option value="local">{labels.sourceLocal}</option>
        </select>
        <select value={state} onChange={(e) => setState(e.target.value)} className="input">
          <option value="all">{labels.allStates}</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input lg:col-span-2 sm:col-span-1"
        >
          <option value="all">{labels.allCategories}</option>
          {VZLAYUDA_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-sm text-ink-secondary">
        {labels.showing} <strong className="text-ink">{items.length}</strong> {labels.of}{" "}
        <strong className="text-ink">{total}</strong>
        {loading ? ` · ${labels.loading}` : ""}
      </p>

      {items.length === 0 && !loading ? (
        <p className="rounded-xl border border-border bg-surface-muted p-8 text-center text-sm text-ink-secondary">
          {labels.noResults}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} labels={labels} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
