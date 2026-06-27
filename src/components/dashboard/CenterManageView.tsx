import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { CenterSection } from "@/lib/center-manage-page";
import { useHelpCenterInventoryRealtime } from "@/lib/hooks/useHelpCenterRealtime";
import AddVolunteerDialog, { type AddVolunteerFormLabels } from "@/components/dashboard/AddVolunteerDialog";
import InventoryManagePanel, {
  type InventoryPanelLabels,
} from "@/components/dashboard/InventoryManagePanel";
import CenterSettingsForm from "@/components/dashboard/CenterSettingsForm";
import { formatNationalIdDisplay } from "@/lib/missing-persons/normalize";

interface VolunteerRow {
  id: string;
  name: string;
  nationalId: string | null;
  phone: string;
  status: string;
  createdAt: string;
}

interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  minimumStock: number | null;
}

interface ManageLabels {
  tabVolunteers: string;
  tabInventory: string;
  tabCenter: string;
  centerSettings: {
    title: string;
    name: string;
    description: string;
    state: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    schedule: string;
    accepts: string;
    staffNeeded: string;
    staffNeededNotes: string;
    staffNeededNotesPlaceholder: string;
    save: string;
    loading: string;
    saved: string;
    verified: string;
    pendingVerification: string;
  };
  pending: string;
  active: string;
  inactive: string;
  approve: string;
  deactivate: string;
  volunteersPending: string;
  volunteersActive: string;
  itemsCount: string;
  lowStock: string;
  addItem: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: string;
  minimumStock: string;
  recordInbound: string;
  recordOutbound: string;
  donor: string;
  destination: string;
  notes: string;
  save: string;
  loading: string;
  stock: string;
  loadFailed: string;
  addVolunteer: string;
  addVolunteerDialog: {
    title: string;
    subtitle: string;
    form: AddVolunteerFormLabels;
  };
  volunteerTable: {
    name: string;
    nationalId: string;
    contact: string;
    status: string;
    actions: string;
    empty: string;
  };
  inventory: InventoryPanelLabels;
  categories: Record<string, string>;
  units: Record<string, string>;
  staffNeededLabels: Record<string, string>;
}

interface CenterManageViewProps {
  centerId: string;
  locale: Locale;
  section: CenterSection;
  labels: ManageLabels;
  states: string[];
  backHref: string;
}

export default function CenterManageView({
  centerId,
  locale,
  section,
  labels,
  states,
  backHref,
}: CenterManageViewProps) {
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [items, setItems] = useState<InventoryItemRow[]>([]);
  const [summary, setSummary] = useState({
    volunteersPending: 0,
    volunteersActive: 0,
    items: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false);

  const loadCenterData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [centerRes, volRes, invRes] = await Promise.all([
        fetch(`/api/help-centers/${centerId}`),
        fetch(`/api/help-centers/${centerId}/volunteers`),
        fetch(`/api/help-centers/${centerId}/inventory`),
      ]);
      if (centerRes.status === 401 || centerRes.status === 403) {
        window.location.href = backHref;
        return;
      }
      if (centerRes.ok) {
        await centerRes.json();
      }

      const errors: string[] = [];
      if (volRes.ok) {
        const volData = await volRes.json();
        setVolunteers(volData.volunteers ?? []);
        setSummary(volData.summary ?? summary);
      } else {
        const volData = (await volRes.json().catch(() => ({}))) as { error?: string };
        errors.push(volData.error ?? labels.loadFailed);
      }

      if (invRes.ok) {
        const invData = await invRes.json();
        setItems(invData.items ?? []);
      } else if (section === "inventario") {
        const invData = (await invRes.json().catch(() => ({}))) as { error?: string };
        errors.push(invData.error ?? labels.loadFailed);
      }

      if (errors.length > 0) setLoadError(errors[0]);
    } catch {
      setLoadError(labels.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [centerId, backHref, section, labels.loadFailed]);

  useEffect(() => {
    void loadCenterData();
  }, [loadCenterData]);

  useHelpCenterInventoryRealtime(
    section === "inventario" ? centerId : null,
    loadCenterData
  );

  async function updateVolunteer(volunteerId: string, status: string) {
    await fetch(`/api/help-centers/${centerId}/volunteers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volunteerId, status }),
    });
    void loadCenterData();
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div
          className="rounded-xl border border-emergency/30 bg-emergency-muted px-4 py-3 text-sm text-emergency"
          role="alert"
        >
          {loadError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
          <p className="text-2xl font-bold text-ink">{summary.volunteersPending}</p>
          <p className="text-sm text-ink-secondary">{labels.volunteersPending}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
          <p className="text-2xl font-bold text-ink">{summary.volunteersActive}</p>
          <p className="text-sm text-ink-secondary">{labels.volunteersActive}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
          <p className="text-2xl font-bold text-ink">{summary.items}</p>
          <p className="text-sm text-ink-secondary">{labels.itemsCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
          <p className="text-2xl font-bold text-warning">{summary.lowStock}</p>
          <p className="text-sm text-ink-secondary">{labels.lowStock}</p>
        </div>
      </div>

      {loading && section !== "centro" && (
        <p className="text-sm text-ink-secondary">{labels.loading}</p>
      )}

      {section === "centro" && (
        <CenterSettingsForm
          centerId={centerId}
          states={states}
          locale={locale}
          labels={labels.centerSettings}
          staffNeededLabels={labels.staffNeededLabels}
        />
      )}

      {section === "voluntarios" && !loading && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setAddVolunteerOpen(true)}
            >
              {labels.addVolunteer}
            </button>
          </div>

          <AddVolunteerDialog
            open={addVolunteerOpen}
            centerId={centerId}
            labels={labels.addVolunteerDialog}
            onClose={() => setAddVolunteerOpen(false)}
            onSuccess={() => void loadCenterData()}
          />

          <div className="rounded-xl border border-border bg-surface-elevated overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm text-left">
              <thead>
                <tr className="border-b border-border text-ink-muted">
                  <th className="py-3 px-4">{labels.volunteerTable.name}</th>
                  <th className="py-3 px-4">{labels.volunteerTable.nationalId}</th>
                  <th className="py-3 px-4">{labels.volunteerTable.contact}</th>
                  <th className="py-3 px-4">{labels.volunteerTable.status}</th>
                  <th className="py-3 px-4">{labels.volunteerTable.actions}</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-ink-secondary">
                      {labels.volunteerTable.empty}
                    </td>
                  </tr>
                ) : (
                  volunteers.map((v) => (
                    <tr key={v.id} className="border-b border-border/60">
                      <td className="py-3 px-4 font-medium text-ink">{v.name}</td>
                      <td className="py-3 px-4 text-ink-secondary">
                        {formatNationalIdDisplay(v.nationalId) ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-ink-secondary">{v.phone}</td>
                      <td className="py-3 px-4">
                        <span className="badge bg-surface-muted text-ink-secondary">
                          {(labels[v.status as keyof ManageLabels] as string) ?? v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {v.status !== "active" && (
                            <button
                              type="button"
                              className="btn-primary text-xs py-1 px-2"
                              onClick={() => void updateVolunteer(v.id, "active")}
                            >
                              {labels.approve}
                            </button>
                          )}
                          {v.status === "active" && (
                            <button
                              type="button"
                              className="btn-secondary text-xs py-1 px-2"
                              onClick={() => void updateVolunteer(v.id, "inactive")}
                            >
                              {labels.deactivate}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === "inventario" && !loading && (
        <InventoryManagePanel
          centerId={centerId}
          locale={locale}
          items={items}
          labels={labels.inventory}
          onRefresh={() => void loadCenterData()}
        />
      )}
    </div>
  );
}
