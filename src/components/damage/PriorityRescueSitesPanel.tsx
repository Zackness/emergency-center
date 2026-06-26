import { MapPin, Siren, Users, Building2 } from "lucide-react";
import type { DamageReport, DamageSeverity } from "@/types";
import {
  PRIORITY_RESCUE_SITES,
  PRIORITY_RESCUE_STATS,
  PRIORITY_RESCUE_SOURCE_URL,
  PRIORITY_RESCUE_ZONES,
  getPrioritySitesByZone,
} from "@/data/priority-rescue-sites";

interface PriorityRescueSitesPanelProps {
  locale: "es" | "en";
  labels: {
    title: string;
    subtitle: string;
    structures: string;
    zones: string;
    victims: string;
    source: string;
    priorityBadge: string;
    directions: string;
    disclaimer: string;
  };
  severityLabels: Record<DamageSeverity, string>;
}

const SEVERITY_STYLES: Record<DamageSeverity, string> = {
  collapsed: "bg-emergency-muted text-emergency",
  damaged: "bg-warning-muted text-warning",
  evacuated: "bg-yellow-100 text-yellow-800",
};

function SiteCard({
  site,
  severityLabels,
  priorityBadge,
  directionsLabel,
}: {
  site: DamageReport;
  severityLabels: Record<DamageSeverity, string>;
  priorityBadge: string;
  directionsLabel: string;
}) {
  return (
    <article className="rounded-xl border border-emergency/20 bg-surface p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="font-semibold text-ink">{site.title}</h4>
        <span className="badge bg-emergency text-white text-xs">{priorityBadge}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`badge text-xs ${SEVERITY_STYLES[site.severity]}`}>
          {severityLabels[site.severity]}
        </span>
      </div>
      {site.description && (
        <p className="mt-2 text-sm text-ink-secondary">{site.description}</p>
      )}
      <p className="mt-2 text-xs text-ink-muted">
        {site.city}, {site.state}
        {site.address ? ` — ${site.address}` : ""}
      </p>
      <p className="mt-1 font-mono text-xs text-ink-muted">
        {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
      </p>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
      >
        <MapPin className="h-3.5 w-3.5" />
        {directionsLabel}
      </a>
    </article>
  );
}

export default function PriorityRescueSitesPanel({
  locale,
  labels,
  severityLabels,
}: PriorityRescueSitesPanelProps) {
  return (
    <section
      id="sitios-prioritarios-rescate"
      className="rounded-[1.75rem] border-2 border-emergency/30 bg-gradient-to-br from-emergency-muted/40 via-surface to-surface p-5 sm:p-7"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emergency px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            <Siren className="h-3.5 w-3.5" />
            {labels.priorityBadge}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{labels.title}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{labels.subtitle}</p>
          <a
            href={PRIORITY_RESCUE_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            {labels.source}: @rdelbufalo
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-center shadow-soft">
            <Building2 className="mx-auto h-5 w-5 text-emergency" />
            <div className="mt-1 text-2xl font-bold text-ink">{PRIORITY_RESCUE_STATS.structures}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-secondary sm:text-xs">
              {labels.structures}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-center shadow-soft">
            <MapPin className="mx-auto h-5 w-5 text-emergency" />
            <div className="mt-1 text-2xl font-bold text-ink">{PRIORITY_RESCUE_STATS.zones}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-secondary sm:text-xs">
              {labels.zones}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-center shadow-soft">
            <Users className="mx-auto h-5 w-5 text-emergency" />
            <div className="mt-1 text-2xl font-bold text-ink">{PRIORITY_RESCUE_STATS.victimsLabel}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-secondary sm:text-xs">
              {labels.victims}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 rounded-xl border border-warning/25 bg-warning-muted/30 px-4 py-3 text-xs text-ink-secondary">
        {labels.disclaimer}
      </p>

      <div className="mt-6 space-y-8">
        {PRIORITY_RESCUE_ZONES.map((zone) => {
          const sites = getPrioritySitesByZone(zone.id);
          if (!sites.length) return null;
          return (
            <div key={zone.id}>
              <h3 className="mb-3 text-lg font-semibold text-ink">
                {locale === "es" ? zone.titleEs : zone.titleEn}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    severityLabels={severityLabels}
                    priorityBadge={labels.priorityBadge}
                    directionsLabel={labels.directions}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        {locale === "es"
          ? `${PRIORITY_RESCUE_SITES.length} ubicaciones en el mapa (marcadores prioritarios).`
          : `${PRIORITY_RESCUE_SITES.length} locations on the map (priority markers).`}
      </p>
    </section>
  );
}
