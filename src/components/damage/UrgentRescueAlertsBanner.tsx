import { AlertTriangle, Droplet, MapPin, Phone } from "lucide-react";
import {
  formatUrgentAlertPublishedAt,
  getUrgentRescueAlertCards,
} from "@/data/urgent-rescue-alerts";
import { localePath, type Locale } from "@/i18n/config";

interface UrgentRescueAlertsBannerProps {
  locale: Locale;
  labels: {
    badge: string;
    badgeMissingPerson: string;
    badgeBloodDonation: string;
    published: string;
    call: string;
    whatsapp: string;
    whatsappFamily: string;
    whatsappSecondary: string;
    map: string;
    mapMissingPerson: string;
    viewBloodCenters: string;
    instagramSource: string;
  };
}

export default function UrgentRescueAlertsBanner({ locale, labels }: UrgentRescueAlertsBannerProps) {
  const alerts = getUrgentRescueAlertCards();
  if (!alerts.length) return null;

  const lang = locale === "en" ? "en" : "es";
  const danosPath = `${localePath(locale, "danos")}#`;
  const desaparecidosPath = `${localePath(locale, "desaparecidos")}#`;
  const recursosPath = `${localePath(locale, "recursos")}#`;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isMissingPerson = alert.kind === "missing_person";
        const isBloodDonation = alert.kind === "blood_donation";
        const badge = isBloodDonation
          ? labels.badgeBloodDonation
          : isMissingPerson
            ? labels.badgeMissingPerson
            : labels.badge;
        const mapHref = isBloodDonation
          ? `${recursosPath}${alert.mapAnchor}`
          : isMissingPerson
            ? `${desaparecidosPath}${alert.mapAnchor}`
            : `${danosPath}${alert.mapAnchor}`;
        const mapLabel = isBloodDonation
          ? labels.viewBloodCenters
          : isMissingPerson
            ? labels.mapMissingPerson
            : labels.map;
        const whatsappLabel = isMissingPerson ? labels.whatsappFamily : labels.whatsapp;
        const BadgeIcon = isBloodDonation ? Droplet : AlertTriangle;

        return (
          <section
            key={alert.id}
            id={alert.mapAnchor}
            className="scroll-mt-24 rounded-2xl border-2 border-emergency/40 bg-gradient-to-br from-emergency-muted/50 via-surface to-surface p-5 shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-emergency px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  <BadgeIcon className="h-3.5 w-3.5" />
                  {badge}
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
              {alert.phoneTel && alert.phone && (
                <a href={alert.phoneTel} className="btn-emergency inline-flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {labels.call}: {alert.phone}
                </a>
              )}
              {alert.whatsappUrl && (
                <a
                  href={alert.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  {whatsappLabel}
                </a>
              )}
              {alert.secondaryPhoneTel && alert.secondaryWhatsappUrl && (
                <>
                  <a
                    href={alert.secondaryPhoneTel}
                    className="btn-secondary inline-flex items-center gap-2 text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    {labels.call}: {alert.secondaryPhone}
                  </a>
                  <a
                    href={alert.secondaryWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm"
                  >
                    {labels.whatsappSecondary}
                  </a>
                </>
              )}
              {isBloodDonation && alert.instagramUrl && (
                <a
                  href={alert.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  {labels.instagramSource}
                </a>
              )}
              <a href={mapHref} className="btn-secondary inline-flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {mapLabel}
              </a>
            </div>
          </section>
        );
      })}
    </div>
  );
}
