import { useMemo, useState } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { inventoryUrgency } from "@/lib/help-centers/public";
import { INVENTORY_CATEGORIES } from "@/data/inventory-categories";
import AddInventoryDialog, {
  type AddInventoryDialogLabels,
  type InventoryItemOption,
} from "@/components/dashboard/AddInventoryDialog";

export interface InventoryPanelLabels {
  search: string;
  filterAll: string;
  addToInventory: string;
  itemName: string;
  category: string;
  stock: string;
  minimumStock: string;
  empty: string;
  noResults: string;
  urgent: string;
  lowStock: string;
  needed: string;
  addDialog: AddInventoryDialogLabels;
  categories: Record<string, string>;
  units: Record<string, string>;
}

interface InventoryManagePanelProps {
  centerId: string;
  locale: Locale;
  items: InventoryItemOption[];
  labels: InventoryPanelLabels;
  onRefresh: () => void;
}

export default function InventoryManagePanel({
  centerId,
  locale,
  items,
  labels,
  onRefresh,
}: InventoryManagePanelProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!q) return true;
      const catLabel = labels.categories[item.category] ?? item.category;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        catLabel.toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter, labels.categories]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            className="input sm:max-w-xs"
            placeholder={labels.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input sm:max-w-[12rem]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{labels.filterAll}</option>
            {INVENTORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {labels.categories[c] ?? c}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-primary shrink-0" onClick={() => setDialogOpen(true)}>
          {labels.addToInventory}
        </button>
      </div>

      <AddInventoryDialog
        open={dialogOpen}
        centerId={centerId}
        locale={locale}
        items={items}
        labels={labels.addDialog}
        onClose={() => setDialogOpen(false)}
        onSuccess={onRefresh}
      />

      <div className="rounded-xl border border-border bg-surface-elevated overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm text-left">
          <thead>
            <tr className="border-b border-border text-ink-muted">
              <th className="py-3 px-4">{labels.itemName}</th>
              <th className="py-3 px-4">{labels.category}</th>
              <th className="py-3 px-4">{labels.stock}</th>
              <th className="py-3 px-4">{labels.minimumStock}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 px-4 text-center text-ink-secondary">
                  {labels.empty}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 px-4 text-center text-ink-secondary">
                  {labels.noResults}
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const urgency = inventoryUrgency({
                  quantityOnHand: item.quantityOnHand,
                  minimumStock: item.minimumStock ?? null,
                });
                return (
                  <tr key={item.id} className="border-b border-border/60">
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink">{item.name}</span>
                        {urgency === "critical" && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-emergency-muted px-2 py-0.5 text-xs font-medium text-emergency"
                            title={labels.urgent}
                          >
                            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {labels.needed}
                          </span>
                        )}
                        {urgency === "low" && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-warning-muted px-2 py-0.5 text-xs font-medium text-warning"
                            title={labels.lowStock}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                            {labels.lowStock}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-secondary">
                      {labels.categories[item.category] ?? item.category}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        urgency !== "ok" ? "text-warning" : "text-ink"
                      }`}
                    >
                      {item.quantityOnHand} {labels.units[item.unit] ?? item.unit}
                    </td>
                    <td className="py-3 px-4 text-ink-secondary">
                      {item.minimumStock ?? "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
