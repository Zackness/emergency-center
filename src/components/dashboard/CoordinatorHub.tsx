import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/config";
import CenterRegisterDialog from "@/components/dashboard/CenterRegisterDialog";
import type { CenterRegistrationFormLabels } from "@/components/dashboard/CenterRegistrationForm";

interface ManagedCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  isVerified: boolean;
  isActive: boolean;
  volunteersPending: number;
  volunteersActive: number;
  items: number;
  lowStock: number;
}

interface HubLabels {
  title: string;
  subtitle: string;
  search: string;
  newCenter: string;
  verified: string;
  pending: string;
  inactive: string;
  manage: string;
  volunteers: string;
  inventory: string;
  loading: string;
  registerDialog: {
    title: string;
    subtitle: string;
    mandatorySubtitle: string;
    logout: string;
  };
  form: CenterRegistrationFormLabels;
}

interface CoordinatorHubProps {
  locale: Locale;
  labels: HubLabels;
  states: string[];
  typeLabels: Record<string, string>;
  acceptLabels: Record<string, string>;
}

export default function CoordinatorHub({
  locale,
  labels,
  states,
  typeLabels,
  acceptLabels,
}: CoordinatorHubProps) {
  const [centers, setCenters] = useState<ManagedCenter[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mandatoryRegister, setMandatoryRegister] = useState(false);

  const panelBase = localePath(locale, "centros-ayuda/panel");

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/center-dashboard/session");
      if (!res.ok) {
        window.location.href = localePath(locale, "centros-ayuda/acceso");
        return;
      }
      const data = (await res.json()) as {
        email?: string;
        centers?: ManagedCenter[];
      };
      const list = data.centers ?? [];
      setCenters(list);
      setEmail(data.email ?? "");
      if (list.length === 0) {
        setMandatoryRegister(true);
        setDialogOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return centers;
    return centers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [centers, query]);

  function handleRegisterSuccess() {
    setDialogOpen(false);
    setMandatoryRegister(false);
    void loadSession();
  }

  if (loading) {
    return <p className="text-sm text-ink-secondary">{labels.loading}</p>;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{labels.title}</h2>
            <p className="mt-1 text-sm text-ink-secondary">{labels.subtitle}</p>
            {email && (
              <p className="mt-2 text-xs text-ink-muted">
                {email} · {centers.length} {centers.length === 1 ? "centro" : "centros"}
              </p>
            )}
          </div>
          {centers.length > 0 && (
            <button
              type="button"
              className="btn-primary shrink-0"
              onClick={() => {
                setMandatoryRegister(false);
                setDialogOpen(true);
              }}
            >
              + {labels.newCenter}
            </button>
          )}
        </div>

        {centers.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                className="input w-full pl-10"
                placeholder={labels.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {centers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((center) => (
              <a
                key={center.id}
                href={`${panelBase}/${center.id}/inventario`}
                className="group relative flex flex-col rounded-xl border border-border bg-surface-elevated p-5 transition-all hover:border-accent/40 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-ink group-hover:text-accent transition-colors">
                      {center.name}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {center.city}, {center.state}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                      center.isVerified
                        ? "bg-success-muted text-success"
                        : "bg-warning-muted text-warning"
                    }`}
                  >
                    {center.isVerified ? labels.verified : labels.pending}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-xs text-ink-secondary">{center.address}</p>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 text-xs text-ink-muted">
                  <span>
                    {labels.volunteers}: {center.volunteersActive}
                    {center.volunteersPending > 0 && (
                      <span className="text-warning"> (+{center.volunteersPending})</span>
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    {labels.inventory}: {center.items}
                  </span>
                  {!center.isActive && (
                    <>
                      <span>·</span>
                      <span className="text-emergency">{labels.inactive}</span>
                    </>
                  )}
                </div>

                <span className="mt-4 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  {labels.manage} →
                </span>
              </a>
            ))}
          </div>
        )}

        {centers.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-ink-secondary">—</p>
        )}
      </div>

      <CenterRegisterDialog
        open={dialogOpen}
        mandatory={mandatoryRegister}
        locale={locale}
        title={labels.registerDialog.title}
        subtitle={
          mandatoryRegister
            ? labels.registerDialog.mandatorySubtitle
            : labels.registerDialog.subtitle
        }
        logoutLabel={labels.registerDialog.logout}
        states={states}
        typeLabels={typeLabels}
        acceptLabels={acceptLabels}
        formLabels={labels.form}
        onSuccess={handleRegisterSuccess}
        onClose={mandatoryRegister ? undefined : () => setDialogOpen(false)}
      />
    </>
  );
}
