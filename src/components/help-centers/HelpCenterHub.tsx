import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapView from "@/components/map/MapView";
import CommunityFeedback from "@/components/community/CommunityFeedback";
import ActiveAcopioCentersPanel from "@/components/help-centers/ActiveAcopioCentersPanel";
import G3CaritasAcopioPanel from "@/components/help-centers/G3CaritasAcopioPanel";
import HelpCenterDetailDialog, {
  type HelpCenterDetailLabels,
} from "@/components/help-centers/HelpCenterDetailDialog";
import CenterNeedsSummary, {
  type CenterNeedsSummaryLabels,
} from "@/components/help-centers/CenterNeedsSummary";
import { EMERGENCY_ZONES, centerMatchesZone } from "@/data/emergency-zones";
import { formatHelpCenterDescription } from "@/lib/help-centers/centroacopio";
import { resolveCenterHashAnchor } from "@/lib/help-centers";
import { canShowPublicInventory } from "@/lib/help-centers/public";
import type { HelpCenterNeedsSummary } from "@/lib/help-centers/types";
import { useHelpCenterCatalogRealtime } from "@/lib/hooks/useHelpCenterRealtime";
import type { CentroacopioDeliveryView } from "@/lib/help-centers/types";
import type { HelpCenter, MapLocation } from "@/types";
import type { CommunityConfidenceLevel } from "@/types/community-feedback";

import type { Locale } from "@/i18n/config";

type HubTab = "centers" | "delivery";

export interface HelpCenterView extends HelpCenter {
  images: string[];
  needs_summary?: HelpCenterNeedsSummary | null;
}

interface HubLabels {
  hashtag: string;
  criticalTitle: string;
  criticalBody: string;
  portals: {
    centers: { title: string; description: string; viewCta: string; registerCta: string };
    delivery: { title: string; description: string; viewCta: string; registerCta: string };
  };
  zonesTitle: string;
  directoryTitle: string;
  directorySubtitle: string;
  tabs: { centers: string; delivery: string };
  filterCity: string;
  filterSector: string;
  allCities: string;
  allSectors: string;
  searchSector: string;
  clearFilters: string;
  noResults: string;
  showing: string;
  of: string;
  verified: string;
  phone: string;
  schedule: string;
  directions: string;
  details: string;
  needsSummary: CenterNeedsSummaryLabels;
  detail: HelpCenterDetailLabels;
  deliveryTabIntro: string;
  deliveryTransportCta: string;
  deliveryRegisterCta: string;
  alliedPlatform: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    note: string;
  };
  ayudaEncamino: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    ctaOrganizations: string;
    note: string;
  };
  panelCta: string;
  thirdPartyCta: string;
  logisticsBadge: string;
  logisticsTitle: string;
  logisticsDescription: string;
  logisticsFree: string;
  deliveryNoResults: string;
  deliveryVehicle: string;
  deliveryCoverage: string;
  centroacopioBadge: string;
  activeAcopio: {
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
  g3Caritas: {
    title: string;
    subtitle: string;
    source: string;
    caritasTitle: string;
    directions: string;
    viewInDirectory: string;
    disclaimer: string;
  };
}

interface HelpCenterHubProps {
  locale: Locale;
  centers: HelpCenterView[];
  labels: HubLabels;
  typeLabels: Record<string, string>;
  acceptLabels: Record<string, string>;
  feedbackLabels: Record<string, string>;
  confidenceLabels: Record<CommunityConfidenceLevel, string>;
  registerPath: string;
  registerThirdPartyPath: string;
  panelPath: string;
  volunteersPath: string;
  volunteersTransportPath: string;
  volunteersRegisterPath: string;
  alliedPlatformUrl: string;
  /** Intro estático en Astro; evita duplicar aviso crítico y portales. */
  hideIntro?: boolean;
}

function CenterGallery({ images, alt }: { images: string[]; alt: string }) {
  const isPlaceholder = images.length === 1 && images[0].includes("placeholder.svg");
  return (
    <div
      className={`mb-4 grid gap-2 ${images.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}
    >
      {images.map((src, index) => (
        <img
          key={src + index}
          src={src}
          alt={images.length > 1 ? `${alt} (${index + 1})` : alt}
          className={`w-full rounded-xl border border-border object-cover ${
            isPlaceholder ? "max-h-40 opacity-80" : "max-h-72"
          }`}
          loading="lazy"
        />
      ))}
    </div>
  );
}

export default function HelpCenterHub({
  locale,
  centers,
  labels,
  typeLabels,
  acceptLabels,
  feedbackLabels,
  confidenceLabels,
  registerPath,
  registerThirdPartyPath,
  panelPath,
  volunteersPath,
  volunteersTransportPath,
  volunteersRegisterPath,
  alliedPlatformUrl,
  hideIntro = false,
}: HelpCenterHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>("centers");
  const [cityFilter, setCityFilter] = useState("");
  const [sectorQuery, setSectorQuery] = useState("");
  const [catalogCenters, setCatalogCenters] = useState<HelpCenterView[]>(centers);
  const [deliveries, setDeliveries] = useState<CentroacopioDeliveryView[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [detailCenter, setDetailCenter] = useState<HelpCenterView | null>(null);
  const directoryRef = useRef<HTMLElement>(null);

  const imageByCenterId = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const center of centers) map.set(center.id, center.images);
    return map;
  }, [centers]);

  const reloadCatalog = useCallback(() => {
    setCatalogLoading(true);
    fetch("/api/help-centers/catalog?limit=10000")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("catalog"))))
      .then((data: { centers: HelpCenterView[]; deliveries: CentroacopioDeliveryView[] }) => {
        const merged: HelpCenterView[] = data.centers.map((center) => ({
          ...center,
          images:
            imageByCenterId.get(center.id) ??
            (center.id.startsWith("centroacopio-")
              ? ["/images/help-centers/placeholder.svg"]
              : ["/images/help-centers/placeholder.svg"]),
          needs_summary: center.needs_summary ?? null,
        }));
        setCatalogCenters(merged);
        setDeliveries(data.deliveries ?? []);
      })
      .catch(() => {
        setCatalogCenters(centers);
        setDeliveries([]);
      })
      .finally(() => setCatalogLoading(false));
  }, [centers, imageByCenterId]);

  useEffect(() => {
    reloadCatalog();
  }, [reloadCatalog]);

  useHelpCenterCatalogRealtime(reloadCatalog);

  const filteredCenters = useMemo(() => {
    const q = sectorQuery.trim().toLowerCase();
    return catalogCenters.filter((center) => {
      if (cityFilter && !centerMatchesZone(center, cityFilter)) return false;
      if (!q) return true;
      const haystack = `${center.name} ${center.city} ${center.state} ${center.address}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [catalogCenters, cityFilter, sectorQuery]);

  const filteredDeliveries = useMemo(() => {
    const q = sectorQuery.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      if (cityFilter && !centerMatchesZone({ city: delivery.city, state: delivery.state }, cityFilter)) {
        return false;
      }
      if (!q) return true;
      const haystack =
        `${delivery.name} ${delivery.city} ${delivery.state} ${delivery.sector} ${delivery.nearby_address}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [deliveries, cityFilter, sectorQuery]);

  const mapLocations: MapLocation[] = useMemo(
    () =>
      filteredCenters.map((c) => ({
        id: c.id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        type: "help_center" as const,
        address: c.address,
      })),
    [filteredCenters],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyHashState = () => {
      const hash = window.location.hash.replace("#", "");
      const [hashPath, hashQuery = ""] = hash.split("?");
      const zoneFromHash = new URLSearchParams(hashQuery).get("zona");
      if (zoneFromHash) setCityFilter(zoneFromHash);

      if (!hashPath) return;
      const centerAnchor = resolveCenterHashAnchor(
        hashPath,
        catalogCenters.length ? catalogCenters : centers,
      );
      if (centerAnchor) {
        setActiveTab("centers");
        requestAnimationFrame(() => {
          document.getElementById(centerAnchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }
      if (hashPath === "acopio-activos-rdelbufalo" || hashPath === "acopio-g3-caritas" || hashPath === "directorio-ayuda") {
        setActiveTab("centers");
        requestAnimationFrame(() => {
          document.getElementById(hashPath)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };

    applyHashState();
    window.addEventListener("hashchange", applyHashState);
    return () => window.removeEventListener("hashchange", applyHashState);
  }, [centers, catalogCenters]);

  const scrollToDirectory = () => {
    directoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTab("centers");
  };

  const openDeliveryTab = () => {
    directoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTab("delivery");
  };

  const clearFilters = () => {
    setCityFilter("");
    setSectorQuery("");
  };

  return (
    <div className="space-y-10">
      {!hideIntro && (
        <>
          <p className="text-sm font-medium text-ink-secondary">{labels.hashtag}</p>

          <section
            className="rounded-2xl border border-warning/40 bg-warning/10 p-5"
            aria-labelledby="critical-notice-title"
          >
            <div className="flex gap-3">
              <span className="text-xl" aria-hidden="true">
                ⚠️
              </span>
              <div>
                <h2 id="critical-notice-title" className="text-base font-semibold text-ink">
                  {labels.criticalTitle}
                </h2>
                <p className="mt-2 text-sm text-ink-secondary">{labels.criticalBody}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="card flex flex-col p-5 sm:p-6">
              <span className="text-2xl" aria-hidden="true">
                📦
              </span>
              <h2 className="mt-3 text-lg font-semibold text-ink">{labels.portals.centers.title}</h2>
              <p className="mt-2 flex-1 text-sm text-ink-secondary">
                {labels.portals.centers.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn-primary text-sm" onClick={scrollToDirectory}>
                  {labels.portals.centers.viewCta}
                </button>
                <a href={registerPath} className="btn-secondary text-sm">
                  {labels.portals.centers.registerCta}
                </a>
              </div>
            </article>

            <article className="card flex flex-col p-5 sm:p-6">
              <span className="text-2xl" aria-hidden="true">
                🏍️
              </span>
              <h2 className="mt-3 text-lg font-semibold text-ink">{labels.portals.delivery.title}</h2>
              <p className="mt-2 flex-1 text-sm text-ink-secondary">
                {labels.portals.delivery.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn-primary text-sm" onClick={openDeliveryTab}>
                  {labels.portals.delivery.viewCta}
                </button>
                <a href={volunteersRegisterPath} className="btn-secondary text-sm">
                  {labels.portals.delivery.registerCta}
                </a>
              </div>
            </article>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-ink">{labels.zonesTitle}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {EMERGENCY_ZONES.map((zone) => {
                const active = cityFilter === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-surface-elevated text-ink-secondary hover:border-accent/50 hover:text-accent"
                    }`}
                    onClick={() => setCityFilter(active ? "" : zone.id)}
                  >
                    {locale === "es" ? zone.label.es : zone.label.en}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      <ActiveAcopioCentersPanel
        locale={locale}
        labels={labels.activeAcopio}
        typeLabels={typeLabels}
      />

      <G3CaritasAcopioPanel locale={locale} labels={labels.g3Caritas} />

      <section className="card border-accent/30 bg-accent-muted/20 p-5 sm:p-6" id="centroacopio-aliada">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {labels.alliedPlatform.eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-bold text-ink">{labels.alliedPlatform.title}</h2>
        <p className="mt-2 text-sm text-ink-secondary">{labels.alliedPlatform.description}</p>
        <p className="mt-2 text-xs text-ink-muted">{labels.alliedPlatform.note}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={alliedPlatformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            {labels.alliedPlatform.cta}
          </a>
          <a href={registerPath} className="btn-secondary text-sm">
            {labels.portals.centers.registerCta}
          </a>
          <a href={panelPath} className="btn-secondary text-sm">
            {labels.panelCta}
          </a>
          <a href={registerThirdPartyPath} className="btn-secondary text-sm">
            {labels.thirdPartyCta}
          </a>
        </div>
      </section>

      <section className="card border-warning/30 bg-warning-muted/15 p-5 sm:p-6" id="ayudaencamino">
        <p className="text-xs font-semibold uppercase tracking-wide text-warning">
          {labels.ayudaEncamino.eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-bold text-ink">{labels.ayudaEncamino.title}</h2>
        <p className="mt-2 text-sm text-ink-secondary">{labels.ayudaEncamino.description}</p>
        <p className="mt-2 text-xs text-ink-muted">{labels.ayudaEncamino.note}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://ayudaencamino.com/necesidades"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            {labels.ayudaEncamino.cta}
          </a>
          <a
            href="https://ayudaencamino.com/organizaciones"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            {labels.ayudaEncamino.ctaOrganizations}
          </a>
          <a
            href="https://ayudaencamino.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            ayudaencamino.com →
          </a>
        </div>
      </section>

      <section
        ref={directoryRef}
        id="directorio-ayuda"
        className="scroll-mt-24"
        aria-labelledby="directory-title"
      >
        <h2 id="directory-title" className="text-xl font-bold text-ink sm:text-2xl">
          {labels.directoryTitle}
        </h2>
        <p className="mt-2 text-sm text-ink-secondary">{labels.directorySubtitle}</p>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "centers"
                ? "bg-accent text-white"
                : "bg-surface-muted text-ink-secondary hover:text-ink"
            }`}
            onClick={() => setActiveTab("centers")}
          >
            {labels.tabs.centers}
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "delivery"
                ? "bg-accent text-white"
                : "bg-surface-muted text-ink-secondary hover:text-ink"
            }`}
            onClick={() => setActiveTab("delivery")}
          >
            {labels.tabs.delivery}
          </button>
        </div>

        {activeTab === "centers" ? (
          <div className="mt-6 space-y-6">
            {filteredCenters.length > 0 && (
              <MapView locations={mapLocations} locale={locale} />
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                className="input"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                aria-label={labels.filterCity}
              >
                <option value="">{labels.allCities}</option>
                {EMERGENCY_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {locale === "es" ? zone.label.es : zone.label.en}
                  </option>
                ))}
              </select>
              <input
                type="search"
                className="input sm:col-span-2"
                placeholder={labels.searchSector}
                value={sectorQuery}
                onChange={(e) => setSectorQuery(e.target.value)}
                aria-label={labels.filterSector}
              />
              <button type="button" className="btn-secondary text-sm" onClick={clearFilters}>
                {labels.clearFilters}
              </button>
            </div>

            <p className="text-sm text-ink-secondary">
              {labels.showing} <strong>{filteredCenters.length}</strong> {labels.of}{" "}
              <strong>{catalogCenters.length}</strong>
              {catalogLoading ? " · …" : ""}
            </p>

            {filteredCenters.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface-muted p-6 text-center text-sm text-ink-secondary">
                {labels.noResults}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCenters.map((center) => (
                  <article key={center.id} className="card flex flex-col" id={center.id}>
                    <CenterGallery images={center.images} alt={center.name} />
                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-ink">{center.name}</h3>
                        {center.is_verified && (
                          <span className="badge-verified">{labels.verified}</span>
                        )}
                        <span className="badge bg-surface-muted text-ink-secondary">
                          {typeLabels[center.type] ?? center.type}
                        </span>
                        {center.id.startsWith("centroacopio-") && (
                          <span className="badge bg-accent-muted text-accent text-xs">
                            {labels.centroacopioBadge}
                          </span>
                        )}
                      </div>
                      {formatHelpCenterDescription(center.description) && (
                        <p className="mt-2 text-sm text-ink-secondary">
                          {formatHelpCenterDescription(center.description)}
                        </p>
                      )}
                      <div className="mt-3 flex flex-col gap-1 text-sm text-ink-secondary">
                        <span>
                          {center.city}, {center.state}
                        </span>
                        <span>{center.address}</span>
                        {center.phone && (
                          <a
                            href={`tel:${center.phone.replace(/[^0-9+]/g, "")}`}
                            className="text-accent hover:underline"
                          >
                            {labels.phone}: {center.phone}
                          </a>
                        )}
                        {center.schedule && (
                          <span>
                            {labels.schedule}: {center.schedule}
                          </span>
                        )}
                      </div>
                      {center.accepts?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {center.accepts.map((item) => (
                            <span
                              key={item}
                              className="badge bg-accent-muted text-accent text-xs"
                            >
                              {acceptLabels[item] ?? item}
                            </span>
                          ))}
                        </div>
                      )}
                      {center.needs_summary && (
                        <CenterNeedsSummary
                          summary={center.needs_summary}
                          labels={labels.needsSummary}
                        />
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs"
                        >
                          {labels.directions}
                        </a>
                        {canShowPublicInventory(center) && (
                          <button
                            type="button"
                            className="btn-primary text-xs"
                            onClick={() => setDetailCenter(center)}
                          >
                            {labels.details}
                          </button>
                        )}
                      </div>
                      <CommunityFeedback
                        contentType="help_center"
                        contentId={center.id}
                        locale={locale}
                        labels={feedbackLabels}
                        confidenceLabels={confidenceLabels}
                        compact
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <p className="text-sm text-ink-secondary">{labels.deliveryTabIntro}</p>

            <section className="rounded-2xl border border-accent/20 bg-accent-muted/40 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {labels.logisticsBadge}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">{labels.logisticsTitle}</h3>
                  <p className="mt-2 text-sm text-ink-secondary">{labels.logisticsDescription}</p>
                </div>
                <span className="badge bg-white text-accent shadow-soft">{labels.logisticsFree}</span>
              </div>
              <CommunityFeedback
                contentType="external_link"
                contentId="help-centers-logistics"
                locale={locale}
                labels={feedbackLabels}
                confidenceLabels={confidenceLabels}
                compact
              />
            </section>

            <div className="flex flex-wrap gap-3">
              <a href={volunteersTransportPath} className="btn-primary">
                {labels.deliveryTransportCta}
              </a>
              <a href={volunteersRegisterPath} className="btn-secondary">
                {labels.deliveryRegisterCta}
              </a>
              <a href={volunteersPath} className="btn-secondary text-sm">
                {labels.portals.delivery.viewCta}
              </a>
            </div>

            {filteredDeliveries.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDeliveries.map((delivery) => (
                  <article key={delivery.id} className="card flex flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{delivery.name}</h3>
                      <span className="badge bg-accent-muted text-accent text-xs">
                        {labels.centroacopioBadge}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-1 text-sm text-ink-secondary">
                      <span>
                        {delivery.city}, {delivery.state}
                      </span>
                      {delivery.sector && <span>{delivery.sector}</span>}
                      {delivery.nearby_address && (
                        <span>
                          {labels.deliveryCoverage}: {delivery.nearby_address}
                        </span>
                      )}
                      <span>
                        {labels.deliveryVehicle}: {delivery.transport_label}
                      </span>
                      {delivery.phone && (
                        <a
                          href={`https://wa.me/58${delivery.phone.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          WhatsApp: {delivery.phone}
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-border bg-surface-muted p-6 text-center text-sm text-ink-secondary">
                {labels.deliveryNoResults}
              </p>
            )}
          </div>
        )}
      </section>

      <HelpCenterDetailDialog
        centerId={detailCenter?.id ?? null}
        centerPreview={detailCenter}
        labels={labels.detail}
        onClose={() => setDetailCenter(null)}
      />
    </div>
  );
}
