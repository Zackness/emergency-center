import { useState, type FormEvent } from "react";
import { VZLAYUDA_CATEGORIES } from "@/lib/vzlayuda/types";

export interface HelpPublishLabels {
  title: string;
  subtitle: string;
  tabOffer: string;
  tabRequest: string;
  name: string;
  phone: string;
  titleField: string;
  category: string;
  zone: string;
  description: string;
  consent: string;
  submitOffer: string;
  submitRequest: string;
  submitting: string;
  successOffer: string;
  successRequest: string;
  error: string;
  vzlayudaNote: string;
  vzlayudaCta: string;
  kindOfferLabel: string;
  kindOfferHint: string;
  kindRequestLabel: string;
  kindRequestHint: string;
}

interface HelpPublishFormProps {
  locale: "es" | "en" | "pt" | "it";
  labels: HelpPublishLabels;
  states: string[];
  kind?: "offer" | "request";
  showKindTabs?: boolean;
  onPublished?: () => void;
}

export default function HelpPublishForm({
  locale,
  labels,
  states,
  kind: controlledKind,
  showKindTabs = true,
  onPublished,
}: HelpPublishFormProps) {
  const [internalKind, setInternalKind] = useState<"offer" | "request">("offer");
  const kind = controlledKind ?? internalKind;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      kind,
      contact_name: formData.get("contact_name") as string,
      contact_phone: formData.get("contact_phone") as string,
      title: formData.get("title") as string,
      category: (formData.get("category") as string) || null,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      zone: (formData.get("zone") as string) || null,
      description: (formData.get("description") as string) || null,
    };

    try {
      const res = await fetch("/api/community-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      setStatus("success");
      setMessage(kind === "offer" ? labels.successOffer : labels.successRequest);
      form.reset();
      onPublished?.();
    } catch {
      setStatus("error");
      setMessage(labels.error);
    }
  }

  const isOffer = kind === "offer";
  const zonePlaceholder =
    locale === "es"
      ? "Sector o urbanización (sin dirección exacta)"
      : "Area or neighborhood (not exact address)";

  return (
    <section id="publicar-ayuda" className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-ink">{labels.title}</h3>
        <p className="mt-1 text-sm text-ink-secondary max-w-3xl">{labels.subtitle}</p>
      </div>

      {showKindTabs ? (
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setInternalKind("offer")}
            className={`rounded-xl border-2 p-4 text-left transition-colors ${
              isOffer
                ? "border-success bg-success-muted/40"
                : "border-border bg-surface-muted hover:border-success/30"
            }`}
          >
            <span className="font-semibold text-ink">{labels.kindOfferLabel}</span>
            <p className="mt-1 text-xs text-ink-secondary">{labels.kindOfferHint}</p>
          </button>
          <button
            type="button"
            onClick={() => setInternalKind("request")}
            className={`rounded-xl border-2 p-4 text-left transition-colors ${
              !isOffer
                ? "border-emergency bg-emergency-muted/40"
                : "border-border bg-surface-muted hover:border-emergency/30"
            }`}
          >
            <span className="font-semibold text-ink">{labels.kindRequestLabel}</span>
            <p className="mt-1 text-xs text-ink-secondary">{labels.kindRequestHint}</p>
          </button>
        </div>
      ) : (
        <p
          className={`mb-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            isOffer ? "bg-success-muted text-success" : "bg-emergency-muted text-emergency"
          }`}
        >
          {isOffer ? labels.tabOffer : labels.tabRequest}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="kind" value={kind} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="help-title">
              {labels.titleField}
            </label>
            <input className="input" id="help-title" name="title" required maxLength={60} />
          </div>
          <div>
            <label className="label" htmlFor="help-name">
              {labels.name}
            </label>
            <input className="input" id="help-name" name="contact_name" required />
          </div>
          <div>
            <label className="label" htmlFor="help-phone">
              {labels.phone} (WhatsApp)
            </label>
            <input className="input" id="help-phone" name="contact_phone" type="tel" required placeholder="+58…" />
          </div>
          <div>
            <label className="label" htmlFor="help-category">
              {labels.category}
            </label>
            <select className="input" id="help-category" name="category">
              <option value="">—</option>
              {VZLAYUDA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="help-state">
              {labels.state}
            </label>
            <select className="input" id="help-state" name="state" required>
              <option value="">{labels.state}</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="help-city">
              {labels.city}
            </label>
            <input className="input" id="help-city" name="city" required />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="help-zone">
              {labels.zone}
            </label>
            <input className="input" id="help-zone" name="zone" placeholder={zonePlaceholder} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="help-description">
              {labels.description}
            </label>
            <textarea className="input min-h-[100px]" id="help-description" name="description" maxLength={280} />
          </div>
        </div>

        <p className="text-xs text-ink-muted">{labels.vzlayudaNote}</p>

        <label className="flex items-start gap-3 text-sm text-ink-secondary">
          <input type="checkbox" required className="mt-1 rounded" />
          {labels.consent}
        </label>

        {message && (
          <div
            className={`rounded-xl p-4 text-sm ${
              status === "success" ? "bg-success-muted text-success" : "bg-emergency-muted text-emergency"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          className={isOffer ? "btn-primary bg-success hover:bg-success/90" : "btn-primary bg-emergency hover:bg-emergency/90"}
          disabled={status === "loading"}
        >
          {status === "loading"
            ? labels.submitting
            : isOffer
              ? labels.submitOffer
              : labels.submitRequest}
        </button>
      </form>
    </section>
  );
}
