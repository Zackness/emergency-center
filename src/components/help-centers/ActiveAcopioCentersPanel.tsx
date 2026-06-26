import { Droplets, MapPin, Package } from "lucide-react";
import {
  RDELBUFALO_ACOPIO_REGIONS,
  RDELBUFALO_ACOPIO_SOURCE,
  RDELBUFALO_WHAT_TO_BRING,
  getAcopioCentersByRegion,
} from "@/data/rdelbufalo-acopio-activos";
import type { HelpCenter } from "@/types";

interface ActiveAcopioCentersPanelProps {
  locale: "es" | "en";
  labels: {
    title: string;
    subtitle: string;
    whatToBring: string;
    source: string;
    points: string;
    virtualNote: string;
    directions: string;
    viewOnMap: string;
    disclaimer: string;
  };
  typeLabels: Record<string, string>;
}

function CenterLink({
  center,
  locale,
  typeLabels,
  directionsLabel,
  virtualNote,
}: {
  center: HelpCenter;
  locale: "es" | "en";
  typeLabels: Record<string, string>;
  directionsLabel: string;
  virtualNote: string;
}) {
  const isVirtual = center.address?.includes("virtual") ?? false;
  return (
    <article className="rounded-xl border border-accent/20 bg-surface p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="font-semibold text-ink">{center.name}</h4>
        <span className="badge bg-accent-muted text-accent text-xs">
          {typeLabels[center.type] ?? center.type}
        </span>
      </div>
      {center.description && (
        <p className="mt-2 text-sm text-ink-secondary line-clamp-3">{center.description}</p>
      )}
      <p className="mt-2 text-xs text-ink-muted">
        {center.city}, {center.state}
        {center.address ? ` — ${center.address}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <a
          href={`#${center.id}`}
          className="font-medium text-accent hover:underline"
        >
          {locale === "es" ? "Ver en directorio" : "View in directory"}
        </a>
        {!isVirtual && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-ink-secondary hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            {directionsLabel}
          </a>
        )}
        {isVirtual && <span className="text-ink-muted">{virtualNote}</span>}
      </div>
    </article>
  );
}

export default function ActiveAcopioCentersPanel({
  locale,
  labels,
  typeLabels,
}: ActiveAcopioCentersPanelProps) {
  const whatToBring = locale === "es" ? RDELBUFALO_WHAT_TO_BRING.es : RDELBUFALO_WHAT_TO_BRING.en;
  const totalPoints = RDELBUFALO_ACOPIO_REGIONS.reduce((sum, r) => sum + r.pointCount, 0);

  return (
    <section
      id="acopio-activos-rdelbufalo"
      className="rounded-[1.75rem] border border-accent/25 bg-gradient-to-br from-accent-muted/30 via-surface to-surface p-5 sm:p-7"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            <Package className="h-3.5 w-3.5" />
            {locale === "es" ? "25 jun 2026" : "Jun 25, 2026"}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{labels.title}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{labels.subtitle}</p>
          <a
            href={RDELBUFALO_ACOPIO_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            {labels.source}: @rdelbufalo
          </a>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 text-center shadow-soft">
          <MapPin className="mx-auto h-5 w-5 text-accent" />
          <div className="mt-1 text-2xl font-bold text-ink">{totalPoints}</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            {labels.points}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface-muted/60 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Droplets className="h-4 w-4 text-accent" />
          {labels.whatToBring}
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {whatToBring.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-ink-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-ink-muted">{labels.disclaimer}</p>

      <div className="mt-6 space-y-8">
        {RDELBUFALO_ACOPIO_REGIONS.map((region) => {
          const centers = getAcopioCentersByRegion(region.id);
          return (
            <div key={region.id}>
              <h3 className="mb-3 text-lg font-semibold text-ink">
                {locale === "es" ? region.titleEs : region.titleEn}
                <span className="ml-2 text-sm font-normal text-ink-muted">
                  ({region.pointCount} {labels.points.toLowerCase()})
                </span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {centers.map((center) => (
                  <CenterLink
                    key={center.id}
                    center={center}
                    locale={locale}
                    typeLabels={typeLabels}
                    directionsLabel={labels.directions}
                    virtualNote={labels.virtualNote}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
