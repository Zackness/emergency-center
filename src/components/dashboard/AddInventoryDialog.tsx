import { useEffect, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from "@/data/inventory-categories";
import ImageUploadField from "@/components/forms/ImageUploadField";

export interface InventoryItemOption {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  minimumStock?: number | null;
}

export interface AddInventoryDialogLabels {
  title: string;
  subtitle: string;
  modeNew: string;
  modeExisting: string;
  modeNeed: string;
  modeNeedHint: string;
  sourceDonation: string;
  sourcePurchase: string;
  itemName: string;
  category: string;
  unit: string;
  minimumStock: string;
  selectItem: string;
  quantity: string;
  donor: string;
  invoicePhoto: string;
  invoicePhotoHint: string;
  notes: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  close: string;
  categories: Record<string, string>;
  units: Record<string, string>;
}

interface AddInventoryDialogProps {
  open: boolean;
  centerId: string;
  locale: Locale;
  items: InventoryItemOption[];
  labels: AddInventoryDialogLabels;
  onClose: () => void;
  onSuccess: () => void;
}

type IntakeMode = "new" | "existing" | "need";
type SourceType = "donation" | "purchase";

export default function AddInventoryDialog({
  open,
  centerId,
  locale,
  items,
  labels,
  onClose,
  onSuccess,
}: AddInventoryDialogProps) {
  const [mode, setMode] = useState<IntakeMode>("new");
  const [sourceType, setSourceType] = useState<SourceType>("donation");
  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("food");
  const [unit, setUnit] = useState("unidad");
  const [minimumStock, setMinimumStock] = useState("");
  const [quantity, setQuantity] = useState("");
  const [donorName, setDonorName] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setMode(items.length > 0 ? "existing" : "new");
    }
  }, [open, items.length]);

  if (!open) return null;

  function resetForm() {
    setMode(items.length > 0 ? "existing" : "new");
    setSourceType("donation");
    setItemId("");
    setName("");
    setCategory("food");
    setUnit("unidad");
    setMinimumStock("");
    setQuantity("");
    setDonorName("");
    setInvoiceUrl(null);
    setNotes("");
    setStatus("idle");
    setMessage("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const qty = mode === "need" ? 0 : Number(quantity);
    if (mode === "need") {
      if (!name.trim() || !category.trim()) {
        setStatus("error");
        setMessage(labels.error);
        return;
      }
    } else if (!Number.isFinite(qty) || qty <= 0) {
      setStatus("error");
      setMessage(labels.error);
      return;
    }

    const payload =
      mode === "need"
        ? {
            mode,
            name,
            category,
            unit,
            minimumStock: minimumStock ? Number(minimumStock) : null,
            notes: notes || null,
          }
        : mode === "new"
        ? {
            mode,
            name,
            category,
            unit,
            minimumStock: minimumStock ? Number(minimumStock) : null,
            quantity: qty,
            sourceType,
            donorName: sourceType === "donation" ? donorName || null : null,
            invoiceUrl: sourceType === "purchase" ? invoiceUrl : null,
            notes: notes || null,
          }
        : {
            mode,
            itemId,
            quantity: qty,
            sourceType,
            donorName: sourceType === "donation" ? donorName || null : null,
            invoiceUrl: sourceType === "purchase" ? invoiceUrl : null,
            notes: notes || null,
          };

    try {
      const res = await fetch(`/api/help-centers/${centerId}/inventory/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.error);

      setStatus("success");
      setMessage(labels.success);
      window.setTimeout(() => {
        onSuccess();
        handleClose();
      }, 600);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-inventory-title"
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
      <div className="relative z-10 flex max-h-[min(90vh,52rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 id="add-inventory-title" className="text-lg font-semibold text-ink">
              {labels.title}
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">{labels.subtitle}</p>
          </div>
          <button
            type="button"
            className="btn-ghost min-h-9 min-w-9 rounded-lg text-ink-muted"
            onClick={handleClose}
            aria-label={labels.close}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "existing"
                  ? "bg-accent text-white"
                  : "bg-surface-muted text-ink-secondary"
              }`}
              onClick={() => setMode("existing")}
              disabled={items.length === 0}
            >
              {labels.modeExisting}
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "new" ? "bg-accent text-white" : "bg-surface-muted text-ink-secondary"
              }`}
              onClick={() => setMode("new")}
            >
              {labels.modeNew}
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "need" ? "bg-accent text-white" : "bg-surface-muted text-ink-secondary"
              }`}
              onClick={() => setMode("need")}
            >
              {labels.modeNeed}
            </button>
          </div>

          {mode === "need" && (
            <p className="rounded-xl bg-warning-muted px-4 py-3 text-sm text-warning">
              {labels.modeNeedHint}
            </p>
          )}

          {mode !== "need" && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full border px-3 py-1.5 text-sm ${
                sourceType === "donation"
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-ink-secondary"
              }`}
              onClick={() => setSourceType("donation")}
            >
              {labels.sourceDonation}
            </button>
            <button
              type="button"
              className={`rounded-full border px-3 py-1.5 text-sm ${
                sourceType === "purchase"
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-ink-secondary"
              }`}
              onClick={() => setSourceType("purchase")}
            >
              {labels.sourcePurchase}
            </button>
          </div>
          )}

          {mode === "existing" ? (
            <div>
              <label className="label" htmlFor="inv-item">
                {labels.selectItem}
              </label>
              <select
                className="input"
                id="inv-item"
                required
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              >
                <option value="">—</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.quantityOnHand} {labels.units[item.unit] ?? item.unit})
                  </option>
                ))}
              </select>
            </div>
          ) : mode === "need" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="inv-name">
                  {labels.itemName}
                </label>
                <input
                  className="input"
                  id="inv-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="inv-category">
                  {labels.category}
                </label>
                <select
                  className="input"
                  id="inv-category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {INVENTORY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {labels.categories[c] ?? c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="inv-unit">
                  {labels.unit}
                </label>
                <select
                  className="input"
                  id="inv-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {INVENTORY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {labels.units[u] ?? u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="inv-min">
                  {labels.minimumStock}
                </label>
                <input
                  className="input"
                  id="inv-min"
                  type="number"
                  min="0"
                  step="any"
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="inv-name">
                  {labels.itemName}
                </label>
                <input
                  className="input"
                  id="inv-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="inv-category">
                  {labels.category}
                </label>
                <select
                  className="input"
                  id="inv-category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {INVENTORY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {labels.categories[c] ?? c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="inv-unit">
                  {labels.unit}
                </label>
                <select
                  className="input"
                  id="inv-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {INVENTORY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {labels.units[u] ?? u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="inv-min">
                  {labels.minimumStock}
                </label>
                <input
                  className="input"
                  id="inv-min"
                  type="number"
                  min="0"
                  step="any"
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode !== "need" && (
          <div>
            <label className="label" htmlFor="inv-qty">
              {labels.quantity}
            </label>
            <input
              className="input"
              id="inv-qty"
              type="number"
              min="0"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          )}

          {mode !== "need" && sourceType === "donation" && (
            <div>
              <label className="label" htmlFor="inv-donor">
                {labels.donor}
              </label>
              <input
                className="input"
                id="inv-donor"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>
          )}

          {mode !== "need" && sourceType === "purchase" && (
            <ImageUploadField
              id="inv-invoice"
              name="invoice_url"
              label={labels.invoicePhoto}
              hint={labels.invoicePhotoHint}
              folder="inventory-invoices"
              locale={locale}
              value={invoiceUrl}
              onChange={setInvoiceUrl}
            />
          )}

          <div>
            <label className="label" htmlFor="inv-notes">
              {labels.notes}
            </label>
            <input
              className="input"
              id="inv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {message && (
            <div
              className={`rounded-xl p-4 text-sm ${
                status === "success"
                  ? "bg-success-muted text-success"
                  : "bg-emergency-muted text-emergency"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-end border-t border-border pt-4">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              {labels.close}
            </button>
            <button type="submit" className="btn-primary" disabled={status === "loading"}>
              {status === "loading" ? labels.submitting : labels.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
