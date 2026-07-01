import { AlertTriangle, MapPin, Phone } from "lucide-react";
import {
  formatUrgentAlertPublishedAt,
  getUrgentRescueAlertCards,
} from "@/data/urgent-rescue-alerts";
import { localePath, type Locale } from "@/i18n/config";

interface UrgentRescueAlertsBannerProps {
  locale: Locale;
  labels: {
    badge: string;
    published: string;
    call: string;
    whatsapp: string;
    map: string;
  };
}

export default function UrgentRescueAlertsBanner({ locale, labels }: UrgentRescueAlertsBannerProps) {
  const alerts = getUrgentRescueAlertCards();
  if (!alerts.length) return null;

  const lang = locale === "en" ? "en" : "es";
  const danosPath = `${localePath(locale, "danos")}#`;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <section
          key={alert.id}
          id={alert.mapAnchor}
          className="scroll-mt-24 rounded-2xl border-2 border-emergency/40 bg-gradient-to-br from-emergency-muted/50 via-surface to-surface p-5 shadow-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-emergency px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                <AlertTriangle className="h-3.5 w-3.5" />
                {labels.badge}
              </span>
              <h2 className="mt-3 text-xl font-bold text-ink sm:text-2xl">
                {alert.damageReport.title}
              </h2>
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                {alert.damageReport.description}
              </p>
              <p className="mt-2 text-xs font-medium text-ink-muted">
                {labels.published}: {formatUrgentAlertPublishedAt(alert.publishedAt, lang)}
              </p>
              {alert.damageReport.address && (
                <p className="mt-1 text-xs text-ink-muted">
                  {alert.damageReport.city}, {alert.damageReport.state} — {alert.damageReport.address}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={alert.phoneTel} className="btn-emergency inline-flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              {labels.call}: {alert.phone}
            </a>
            <a
              href={alert.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              {labels.whatsapp}
            </a>
            <a
              href={`${danosPath}${alert.mapAnchor}`}
              className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              <MapPin className="h-4 w-4" />
              {labels.map}
            </a>
          </div>
        </section>
      ))}
    </div>
  );
}
