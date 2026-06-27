import { useCallback, useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, ExternalLink, Loader2, Users, X } from "lucide-react";
import type { HelpCenter } from "@/types";
import type { InventoryUrgency } from "@/lib/help-centers/public";
import { hasStaffNeeds } from "@/lib/help-centers/staff-needed";
import { useHelpCenterInventoryRealtime } from "@/lib/hooks/useHelpCenterRealtime";

export interface HelpCenterDetailLabels {
  title: string;
  inventoryTitle: string;
  invoicesTitle: string;
  itemName: string;
  category: string;
  stock: string;
  minimumStock: string;
  needed: string;
  urgent: string;
  lowStock: string;
  inStock: string;
  emptyInventory: string;
  emptyInvoices: string;
  viewInvoice: string;
  loadError: string;
  loading: string;
  close: string;
  purchase: string;
  donation: string;
  staffNeededTitle: string;
  categories: Record<string, string>;
  units: Record<string, string>;
  staffNeeded: Record<string, string>;
}

interface PublicInventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  minimumStock: number | null;
  notes: string | null;
  urgency: InventoryUrgency;
}

interface PublicInvoice {
  id: string;
  itemName: string;
  quantity: number;
  sourceType: string | null;
  invoiceUrl: string | null;
  createdAt: string;
}

interface PublicBundle {
  center: HelpCenter;
  items: PublicInventoryItem[];
  invoices: PublicInvoice[];
}

interface HelpCenterDetailDialogProps {
  centerId: string | null;
  centerPreview: HelpCenter | null;
  labels: HelpCenterDetailLabels;
  onClose: () => void;
}

function UrgencyBadge({
  urgency,
  labels,
}: {
  urgency: InventoryUrgency;
  labels: HelpCenterDetailLabels;
}) {
  if (urgency === "critical") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-emergency-muted px-2 py-0.5 text-xs font-medium text-emergency"
        title={labels.urgent}
      >
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {labels.needed}
      </span>
    );
  }
  if (urgency === "low") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-warning-muted px-2 py-0.5 text-xs font-medium text-warning"
        title={labels.lowStock}
      >
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        {labels.lowStock}
      </span>
    );
  }
  return (
    <span className="text-xs text-ink-muted">{labels.inStock}</span>
  );
}

export default function HelpCenterDetailDialog({
  centerId,
  centerPreview,
  labels,
  onClose,
}: HelpCenterDetailDialogProps) {
  const [bundle, setBundle] = useState<PublicBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBundle = useCallback(async () => {
    if (!centerId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/help-centers/${centerId}/public`);
      if (!res.ok) throw new Error(labels.loadError);
      const data = (await res.json()) as PublicBundle;
      setBundle(data);
    } catch {
      setError(labels.loadError);
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, [centerId, labels.loadError]);

  useEffect(() => {
    if (!centerId) {
      setBundle(null);
      setError("");
      return;
    }
    void loadBundle();
  }, [centerId, loadBundle]);

  useHelpCenterInventoryRealtime(centerId, loadBundle);

  if (!centerId || !centerPreview) return null;

  const center = bundle?.center ?? centerPreview;
  const items = bundle?.items ?? [];
  const invoices = bundle?.invoices ?? [];
  const criticalCount = items.filter((item) => item.urgency === "critical").length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-center-detail-title"
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[min(90vh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 id="help-center-detail-title" className="text-lg font-semibold text-ink">
              {center.name}
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {center.city}, {center.state} · {center.address}
            </p>
            {criticalCount > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emergency">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {criticalCount} {labels.needed.toLowerCase()}
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn-ghost min-h-9 min-w-9 rounded-lg text-ink-muted"
            onClick={onClose}
            aria-label={labels.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {loading && !bundle && (
            <p className="flex items-center gap-2 text-sm text-ink-secondary">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {labels.loading}
            </p>
          )}

          {error && (
            <div className="rounded-xl bg-emergency-muted p-4 text-sm text-emergency">{error}</div>
          )}

          {hasStaffNeeds(center) && (
            <section className="rounded-xl border border-accent/30 bg-accent-muted/30 p-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                <Users className="h-4 w-4 text-accent" aria-hidden="true" />
                {labels.staffNeededTitle}
              </h3>
              {center.staff_needed.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {center.staff_needed.map((role) => (
                    <li
                      key={role}
                      className="rounded-full bg-surface-elevated px-3 py-1 text-sm text-ink-secondary"
                    >
                      {labels.staffNeeded[role] ?? role}
                    </li>
                  ))}
                </ul>
              )}
              {center.staff_needed_notes?.trim() && (
                <p className={`text-sm text-ink-secondary ${center.staff_needed.length > 0 ? "mt-3" : "mt-2"}`}>
                  {center.staff_needed_notes}
                </p>
              )}
            </section>
          )}

          <section>
            <h3 className="text-base font-semibold text-ink">{labels.inventoryTitle}</h3>
            {items.length === 0 && !loading ? (
              <p className="mt-2 text-sm text-ink-secondary">{labels.emptyInventory}</p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[28rem] text-sm text-left">
                  <thead>
                    <tr className="border-b border-border text-ink-muted">
                      <th className="py-3 px-4">{labels.itemName}</th>
                      <th className="py-3 px-4">{labels.category}</th>
                      <th className="py-3 px-4">{labels.stock}</th>
                      <th className="py-3 px-4">{labels.minimumStock}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-border/60">
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-ink">{item.name}</span>
                            <UrgencyBadge urgency={item.urgency} labels={labels} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-ink-secondary">
                          {labels.categories[item.category] ?? item.category}
                        </td>
                        <td
                          className={`py-3 px-4 font-semibold ${
                            item.urgency !== "ok" ? "text-warning" : "text-ink"
                          }`}
                        >
                          {item.quantityOnHand} {labels.units[item.unit] ?? item.unit}
                        </td>
                        <td className="py-3 px-4 text-ink-secondary">
                          {item.minimumStock ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-base font-semibold text-ink">{labels.invoicesTitle}</h3>
            {invoices.length === 0 && !loading ? (
              <p className="mt-2 text-sm text-ink-secondary">{labels.emptyInvoices}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-ink">{invoice.itemName}</p>
                      <p className="text-ink-secondary">
                        {invoice.quantity}{" "}
                        ·{" "}
                        {invoice.sourceType === "purchase"
                          ? labels.purchase
                          : invoice.sourceType === "donation"
                            ? labels.donation
                            : "—"}
                      </p>
                    </div>
                    {invoice.invoiceUrl && (
                      <a
                        href={invoice.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary inline-flex items-center gap-1 text-xs"
                      >
                        {labels.viewInvoice}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
