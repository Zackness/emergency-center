import { useEffect, useMemo, useState } from "react";
import MapView from "@/components/map/MapView";
import type { Hospital, MapLocation } from "@/types";

const PAGE_SIZE = 40;

interface HospitalDirectoryProps {
  hospitals: Hospital[];
  locale: "es" | "en";
  states: string[];
  labels: {
    searchPlaceholder: string;
    filterState: string;
    allStates: string;
    filterType: string;
    allTypes: string;
    typeHospital: string;
    typeClinic: string;
    showing: string;
    of: string;
    phone: string;
    directions: string;
    socialMedia: string;
    operational: string;
    limited: string;
    closed: string;
    unknown: string;
    dataSource: string;
    noResults: string;
    loadMore: string;
  };
}

const STATUS_BADGE: Record<string, string> = {
  operational: "badge-verified",
  limited: "badge-warning",
  closed: "badge-emergency",
  unknown: "badge bg-surface-muted text-ink-secondary",
};

export default function HospitalDirectory({
  hospitals,
  locale,
  states,
  labels,
}: HospitalDirectoryProps) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hospitals.filter((h) => {
      if (stateFilter && h.state !== stateFilter) return false;
      if (typeFilter === "hospital" && !h.services.includes("hospital")) return false;
      if (typeFilter === "clinic" && !h.services.includes("clínica")) return false;
      if (!q) return true;
      const haystack = `${h.name} ${h.city} ${h.state} ${h.address}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [hospitals, query, stateFilter, typeFilter]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, stateFilter, typeFilter]);

  const visibleHospitals = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = visibleCount < filtered.length;

  const mapLocations: MapLocation[] = useMemo(
    () =>
      filtered.map((h) => ({
        id: h.id,
        name: h.name,
        latitude: h.latitude,
        longitude: h.longitude,
        type: "hospital" as const,
        status: h.status,
        address: h.address,
      })),
    [filtered]
  );

  const statusLabel: Record<string, string> = {
    operational: labels.operational,
    limited: labels.limited,
    closed: labels.closed,
    unknown: labels.unknown,
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          className="input sm:col-span-2"
          placeholder={labels.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          aria-label={labels.filterState}
        >
          <option value="">{labels.allStates}</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label={labels.filterType}
        >
          <option value="">{labels.allTypes}</option>
          <option value="hospital">{labels.typeHospital}</option>
          <option value="clinic">{labels.typeClinic}</option>
        </select>
      </div>

      <p className="text-sm text-ink-secondary">
        {labels.showing} <strong>{filtered.length}</strong> {labels.of}{" "}
        <strong>{hospitals.length}</strong>
      </p>

      <MapView locations={mapLocations} locale={locale} height="420px" zoom={6} />

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface-muted p-6 text-sm text-ink-secondary">
          {labels.noResults}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleHospitals.map((hospital) => (
            <article className="card flex flex-col" id={hospital.id} key={hospital.id}>
              <div className="flex flex-col gap-3 flex-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink">{hospital.name}</h3>
                    <span className={STATUS_BADGE[hospital.status] ?? STATUS_BADGE.unknown}>
                      {statusLabel[hospital.status] ?? statusLabel.unknown}
                    </span>
                    {hospital.is_verified && (
                      <span className="badge-verified text-xs">
                        {locale === "es" ? "Verificado" : "Verified"}
                      </span>
                    )}
                    {hospital.services.includes("clínica") && (
                      <span className="badge bg-accent-muted text-accent text-xs">
                        {labels.typeClinic}
                      </span>
                    )}
                    {hospital.services.includes("hospital") && !hospital.services.includes("clínica") && (
                      <span className="badge bg-surface-muted text-ink-secondary text-xs">
                        {labels.typeHospital}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-ink-secondary">
                    <p>
                      {hospital.city}, {hospital.state} — {hospital.address}
                    </p>
                    {hospital.phone && (
                      <p className="mt-1">
                        {labels.phone}: {hospital.phone}
                      </p>
                    )}
                    {hospital.notes && <p className="mt-1">{hospital.notes}</p>}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-auto self-start text-xs"
                >
                  {labels.directions}
                </a>
              </div>
            </article>
          ))}
          {hasMore && (
            <button
              type="button"
              className="btn-secondary mx-auto"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              {labels.loadMore}
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-ink-secondary">{labels.dataSource}</p>
    </div>
  );
}
