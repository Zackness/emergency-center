import { useCallback, useEffect, useState } from "react";
import type { MissingPet, MissingPetStatus } from "@/lib/missing-pets/types";

interface RegistryLabels {
  searchPlaceholder: string;
  statusFilter: string;
  allStatuses: string;
  allStates: string;
  stateFilter: string;
  showing: string;
  of: string;
  noResults: string;
  loadMore: string;
  loading: string;
  location: string;
  marks: string;
  contact: string;
  source: string;
  status: Record<MissingPetStatus, string>;
}

interface MissingPetRegistryProps {
  locale: "es" | "en";
  states: string[];
  labels: RegistryLabels;
  initialStats?: {
    total: number;
    lost: number;
    found: number;
  };
}

interface ApiResponse {
  items: MissingPet[];
  total: number;
}

const STATUS_STYLES: Record<MissingPetStatus, string> = {
  lost: "bg-emergency-muted text-emergency",
  found: "bg-success-muted text-success",
};

function PetCard({
  pet,
  labels,
  locale,
}: {
  pet: MissingPet;
  labels: RegistryLabels;
  locale: "es" | "en";
}) {
  const whatsappUrl = pet.contact_phone
    ? `https://wa.me/${pet.contact_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        locale === "es"
          ? `Hola, vi el reporte de ${pet.name} en HuellasCAN y quiero ayudar.`
          : `Hello, I saw the report for ${pet.name} on HuellasCAN and want to help.`
      )}`
    : null;

  return (
    <article className="card flex flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/5] w-full bg-surface-muted">
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={pet.name}
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
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 20a7 7 0 0 1 13 0" />
            </svg>
          </div>
        )}
        <span className={`badge absolute right-3 top-3 shadow-sm ${STATUS_STYLES[pet.status]}`}>
          {labels.status[pet.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-ink">{pet.name}</h3>
        <p className="mt-1 text-sm text-ink-secondary">
          {labels.location}: {pet.location}
        </p>
        {pet.state && (
          <p className="mt-1 text-xs text-ink-muted">
            {[pet.city, pet.state].filter(Boolean).join(", ")}
          </p>
        )}
        {pet.distinctive_marks && (
          <p className="mt-2 line-clamp-3 text-sm text-ink-secondary">
            {labels.marks}: {pet.distinctive_marks}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {pet.contact_phone && (
            <a href={`tel:${pet.contact_phone.replace(/[^0-9+]/g, "")}`} className="btn-secondary text-xs">
              {labels.contact}: {pet.contact_phone}
            </a>
          )}
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
            href={pet.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            {labels.source} ↗
          </a>
        </div>
      </div>
    </article>
  );
}

export default function MissingPetRegistry({
  states,
  labels,
  locale,
  initialStats,
}: MissingPetRegistryProps) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<MissingPetStatus | "all">("all");
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MissingPet[]>([]);
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
      if (status !== "all") params.set("status", status);
      if (state) params.set("state", state);

      try {
        const res = await fetch(`/api/missing-pets?${params}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as ApiResponse & { stats?: { total: number } };
        setTotal(data.total);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setPage(pageNum);
      } catch {
        if (!append) setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedQ, status, state]
  );

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage]);

  const hasMore = items.length < total;

  return (
    <div className="space-y-6">
      <div className="flex max-w-4xl flex-col gap-3 lg:flex-row">
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
          onChange={(e) => setStatus(e.target.value as MissingPetStatus | "all")}
          className="input lg:max-w-[11rem]"
          aria-label={labels.statusFilter}
        >
          <option value="all">{labels.allStatuses}</option>
          <option value="lost">{labels.status.lost}</option>
          <option value="found">{labels.status.found}</option>
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
        <p className="text-sm text-ink-secondary">{labels.noResults}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((pet) => (
            <PetCard key={pet.id} pet={pet} labels={labels} locale={locale} />
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
