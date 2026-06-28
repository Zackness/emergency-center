import { useEffect, useState } from "react";
import HelpListingRegistry, { type HelpListingLabels } from "@/components/volunteers/HelpListingRegistry";
import HelpPublishForm, { type HelpPublishLabels } from "@/components/volunteers/HelpPublishForm";

export interface HelpHubLabels {
  hubTitle: string;
  hubSubtitle: string;
  offersCardTitle: string;
  offersCardSubtitle: string;
  requestsCardTitle: string;
  requestsCardSubtitle: string;
  publishOfferBtn: string;
  publishRequestBtn: string;
  cancelForm: string;
  tabOfferHint: string;
  tabRequestHint: string;
  dataNote: string;
}

interface HelpCommunitySectionProps {
  locale: "es" | "en" | "pt" | "it";
  states: string[];
  publishLabels: HelpPublishLabels;
  hubLabels: HelpHubLabels;
  offersListLabels: HelpListingLabels;
  requestsListLabels: HelpListingLabels;
}

type TabKind = "offer" | "request";

function tabFromHash(): TabKind | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  if (hash === "quiero-ayudar" || hash === "listado-ofrecimientos" || hash === "ofrecimientos") {
    return "offer";
  }
  if (hash === "necesito-ayuda" || hash === "listado-solicitudes" || hash === "solicitudes") {
    return "request";
  }
  return null;
}

export default function HelpCommunitySection({
  locale,
  states,
  publishLabels,
  hubLabels,
  offersListLabels,
  requestsListLabels,
}: HelpCommunitySectionProps) {
  const [tab, setTab] = useState<TabKind>("offer");
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fromHash = tabFromHash();
    if (fromHash) setTab(fromHash);
    if (window.location.hash === "#publicar-ayuda") setShowForm(true);

    const onHash = () => {
      const next = tabFromHash();
      if (next) setTab(next);
      if (window.location.hash === "#publicar-ayuda") setShowForm(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function selectTab(next: TabKind) {
    setTab(next);
    setShowForm(false);
    const hash = next === "offer" ? "quiero-ayudar" : "necesito-ayuda";
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${hash}`);
  }

  const isOffer = tab === "offer";
  const listLabels = isOffer ? offersListLabels : requestsListLabels;
  const anchorId = isOffer ? "listado-ofrecimientos" : "listado-solicitudes";

  return (
    <div id="directorio-solidario" className="scroll-mt-24">
      <header className="mb-8">
        <span className="eyebrow mb-3">VZLA Ayuda + local</span>
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{hubLabels.hubTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-secondary sm:text-base">{hubLabels.hubSubtitle}</p>
        <p className="mt-2 text-xs text-ink-muted">{hubLabels.dataNote}</p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2" role="tablist" aria-label={hubLabels.hubTitle}>
        <button
          type="button"
          role="tab"
          aria-selected={isOffer}
          onClick={() => selectTab("offer")}
          className={`group flex flex-col rounded-2xl border-2 p-5 text-left transition-all ${
            isOffer
              ? "border-success bg-success-muted/40 shadow-soft ring-2 ring-success/20"
              : "border-border bg-surface-muted/50 hover:border-success/30"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-success">
            {publishLabels.tabOffer}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-ink">{hubLabels.offersCardTitle}</h3>
          <p className="mt-1 text-sm text-ink-secondary">{hubLabels.offersCardSubtitle}</p>
          <span className="mt-3 text-xs text-ink-muted">{hubLabels.tabOfferHint}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={!isOffer}
          onClick={() => selectTab("request")}
          className={`group flex flex-col rounded-2xl border-2 p-5 text-left transition-all ${
            !isOffer
              ? "border-emergency bg-emergency-muted/40 shadow-soft ring-2 ring-emergency/20"
              : "border-border bg-surface-muted/50 hover:border-emergency/30"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-emergency">
            {publishLabels.tabRequest}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-ink">{hubLabels.requestsCardTitle}</h3>
          <p className="mt-1 text-sm text-ink-secondary">{hubLabels.requestsCardSubtitle}</p>
          <span className="mt-3 text-xs text-ink-muted">{hubLabels.tabRequestHint}</span>
        </button>
      </div>

      <div role="tabpanel" className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className={isOffer ? "btn-primary bg-success hover:bg-success/90" : "btn-primary bg-emergency hover:bg-emergency/90"}
          >
            {showForm ? hubLabels.cancelForm : isOffer ? hubLabels.publishOfferBtn : hubLabels.publishRequestBtn}
          </button>
          <a
            href="https://vzlayuda.com/publicar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            {publishLabels.vzlayudaCta} ↗
          </a>
        </div>

        {showForm && (
          <HelpPublishForm
            locale={locale}
            states={states}
            labels={publishLabels}
            kind={tab}
            showKindTabs={false}
            onPublished={() => {
              setRefreshKey((k) => k + 1);
              setShowForm(false);
            }}
          />
        )}

        <HelpListingRegistry
          key={`${tab}-${refreshKey}`}
          locale={locale}
          states={states}
          labels={listLabels}
          fixedKind={tab}
          anchorId={anchorId}
        />
      </div>
    </div>
  );
}
