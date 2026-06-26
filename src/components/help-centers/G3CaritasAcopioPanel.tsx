import { Building2, MapPin } from "lucide-react";
import {
  CARITAS_MONTALBAN_RDELBUFALO,
  G3_LOGISTICA_ACOPIO_CENTERS,
  G3_LOGISTICA_SOURCE,
} from "@/data/g3-logistica-acopio";
import type { HelpCenter } from "@/types";

interface G3CaritasAcopioPanelProps {
  locale: "es" | "en";
  labels: {
    title: string;
    subtitle: string;
    source: string;
    caritasTitle: string;
    directions: string;
    viewInDirectory: string;
    disclaimer: string;
  };
}

function CenterCard({
  center,
  directionsLabel,
  viewInDirectoryLabel,
}: {
  center: HelpCenter;
  directionsLabel: string;
  viewInDirectoryLabel: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <h4 className="font-semibold text-ink">{center.name}</h4>
      <p className="mt-2 text-sm text-ink-secondary">{center.address}</p>
      <p className="mt-2 text-xs text-ink-muted">
        {center.city}, {center.state}
      </p>
      {center.schedule && (
        <p className="mt-2 text-xs font-medium text-accent">{center.schedule}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <a href={`#${center.id}`} className="font-medium text-accent hover:underline">
          {viewInDirectoryLabel}
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-ink-secondary hover:underline"
        >
          <MapPin className="h-3.5 w-3.5" />
          {directionsLabel}
        </a>
      </div>
    </article>
  );
}

export default function G3CaritasAcopioPanel({ locale, labels }: G3CaritasAcopioPanelProps) {
  const caritas = CARITAS_MONTALBAN_RDELBUFALO;

  return (
    <section
      id="acopio-g3-caritas"
      className="rounded-[1.75rem] border border-border bg-surface-elevated p-5 sm:p-7"
    >
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          <Building2 className="h-3.5 w-3.5" />
          G3 + Cáritas
        </div>
        <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{labels.title}</h2>
        <p className="mt-2 text-sm text-ink-secondary">{labels.subtitle}</p>
        <a
          href={G3_LOGISTICA_SOURCE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
        >
          {labels.source}: @rdelbufalo
        </a>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-lg font-semibold text-ink">G3 Logística</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {G3_LOGISTICA_ACOPIO_CENTERS.map((center) => (
            <CenterCard
              key={center.id}
              center={center}
              directionsLabel={labels.directions}
              viewInDirectoryLabel={labels.viewInDirectory}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-ink">{labels.caritasTitle}</h3>
        <article className="rounded-xl border border-accent/25 bg-accent-muted/20 p-4">
          <h4 className="font-semibold text-ink">{caritas.name}</h4>
          <p className="mt-2 text-sm text-ink-secondary">{caritas.description}</p>
          <p className="mt-2 text-sm text-ink-secondary">{caritas.address}</p>
          <p className="mt-2 text-xs font-medium text-accent">{caritas.schedule}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <a href="#1" className="font-medium text-accent hover:underline">
              {labels.viewInDirectory}
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${caritas.latitude},${caritas.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-secondary hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              {labels.directions}
            </a>
            <a
              href="https://www.instagram.com/caritasdevzla/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-secondary hover:underline"
            >
              @caritasdevzla
            </a>
          </div>
        </article>
      </div>

      <p className="mt-5 text-xs text-ink-muted">{labels.disclaimer}</p>
    </section>
  );
}
