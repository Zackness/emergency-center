import { useCallback, useEffect, useState } from "react";
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from "@/data/inventory-categories";

interface CenterOption {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface VolunteerRow {
  id: string;
  name: string;
  profession: string;
  phone: string;
  email: string;
  availability: string;
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

interface DashboardLabels {
  title: string;
  selectCenter: string;
  noCenters: string;
  loginRequired: string;
  registerCenter: string;
  signIn: string;
  tabVolunteers: string;
  tabInventory: string;
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
  categories: Record<string, string>;
  units: Record<string, string>;
}

interface CenterDashboardProps {
  locale: "es" | "en";
  labels: DashboardLabels;
}

export default function CenterDashboard({ locale, labels }: CenterDashboardProps) {
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [centerId, setCenterId] = useState("");
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [items, setItems] = useState<InventoryItemRow[]>([]);
  const [summary, setSummary] = useState({
    volunteersPending: 0,
    volunteersActive: 0,
    items: 0,
    lowStock: 0,
  });
  const [tab, setTab] = useState<"volunteers" | "inventory">("volunteers");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "food",
    unit: "unidad",
    quantityOnHand: "0",
    minimumStock: "",
  });

  const [movement, setMovement] = useState({
    itemId: "",
    type: "inbound" as "inbound" | "outbound",
    quantity: "",
    donorName: "",
    destination: "",
    notes: "",
  });

  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/center-dashboard/session");
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      const data = (await res.json()) as { centers: CenterOption[] };
      setCenters(data.centers ?? []);
      if (data.centers?.length) {
        setCenterId((prev) => prev || data.centers[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCenterData = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const [volRes, invRes] = await Promise.all([
        fetch(`/api/help-centers/${id}/volunteers`),
        fetch(`/api/help-centers/${id}/inventory`),
      ]);
      if (!volRes.ok || !invRes.ok) throw new Error("fetch failed");
      const volData = await volRes.json();
      const invData = await invRes.json();
      setVolunteers(volData.volunteers ?? []);
      setSummary(volData.summary ?? summary);
      setItems(invData.items ?? []);
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (centerId) void loadCenterData(centerId);
  }, [centerId, loadCenterData]);

  async function updateVolunteer(volunteerId: string, status: string) {
    if (!centerId) return;
    await fetch(`/api/help-centers/${centerId}/volunteers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volunteerId, status }),
    });
    void loadCenterData(centerId);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!centerId) return;
    await fetch(`/api/help-centers/${centerId}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        category: newItem.category,
        unit: newItem.unit,
        quantityOnHand: Number(newItem.quantityOnHand) || 0,
        minimumStock: newItem.minimumStock ? Number(newItem.minimumStock) : null,
      }),
    });
    setNewItem({ name: "", category: "food", unit: "unidad", quantityOnHand: "0", minimumStock: "" });
    void loadCenterData(centerId);
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!centerId || !movement.itemId) return;
    await fetch(`/api/help-centers/${centerId}/inventory/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: movement.itemId,
        type: movement.type,
        quantity: Number(movement.quantity),
        donorName: movement.donorName || null,
        destination: movement.destination || null,
        notes: movement.notes || null,
      }),
    });
    setMovement({
      itemId: "",
      type: "inbound",
      quantity: "",
      donorName: "",
      destination: "",
      notes: "",
    });
    void loadCenterData(centerId);
  }

  if (authError) {
    return (
      <div className="card max-w-lg space-y-4">
        <p className="text-ink-secondary">{labels.loginRequired}</p>
        <div className="flex flex-wrap gap-3">
          <a href={`/${locale}/centros-ayuda/registrar`} className="btn-primary">
            {labels.registerCenter}
          </a>
          <a href={`/${locale}/centros-ayuda/registrar`} className="btn-secondary">
            {labels.signIn}
          </a>
        </div>
      </div>
    );
  }

  if (!loading && centers.length === 0) {
    return (
      <div className="card max-w-lg space-y-4">
        <p className="text-ink-secondary">{labels.noCenters}</p>
        <a href={`/${locale}/centros-ayuda/registrar`} className="btn-primary">
          {labels.registerCenter}
        </a>
      </div>
    );
  }

  const selectedCenter = centers.find((c) => c.id === centerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <label className="label" htmlFor="center-select">
            {labels.selectCenter}
          </label>
          <select
            id="center-select"
            className="input max-w-md"
            value={centerId}
            onChange={(e) => setCenterId(e.target.value)}
          >
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.city}, {c.state}
              </option>
            ))}
          </select>
        </div>
        {selectedCenter && (
          <p className="text-sm text-ink-muted">{selectedCenter.name}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-ink">{summary.volunteersPending}</p>
          <p className="text-sm text-ink-secondary">{labels.volunteersPending}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-ink">{summary.volunteersActive}</p>
          <p className="text-sm text-ink-secondary">{labels.volunteersActive}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-ink">{summary.items}</p>
          <p className="text-sm text-ink-secondary">{labels.itemsCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-warning">{summary.lowStock}</p>
          <p className="text-sm text-ink-secondary">{labels.lowStock}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "volunteers"
              ? "border-accent text-accent"
              : "border-transparent text-ink-secondary"
          }`}
          onClick={() => setTab("volunteers")}
        >
          {labels.tabVolunteers}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "inventory"
              ? "border-accent text-accent"
              : "border-transparent text-ink-secondary"
          }`}
          onClick={() => setTab("inventory")}
        >
          {labels.tabInventory}
        </button>
      </div>

      {loading && <p className="text-sm text-ink-secondary">{labels.loading}</p>}

      {tab === "volunteers" && !loading && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-ink-muted">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Profesión</th>
                <th className="py-2 pr-4">Contacto</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-ink-secondary">
                    —
                  </td>
                </tr>
              ) : (
                volunteers.map((v) => (
                  <tr key={v.id} className="border-b border-border/60">
                    <td className="py-3 pr-4 font-medium text-ink">{v.name}</td>
                    <td className="py-3 pr-4 text-ink-secondary">{v.profession}</td>
                    <td className="py-3 pr-4 text-ink-secondary">
                      {v.phone}
                      <br />
                      <span className="text-xs">{v.email}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-surface-muted text-ink-secondary">
                        {labels[v.status as keyof DashboardLabels] ?? v.status}
                      </span>
                    </td>
                    <td className="py-3">
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
      )}

      {tab === "inventory" && !loading && (
        <div className="space-y-8">
          <form onSubmit={handleAddItem} className="card space-y-4 max-w-2xl">
            <h3 className="font-semibold text-ink">{labels.addItem}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">{labels.itemName}</label>
                <input
                  className="input"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">{labels.category}</label>
                <select
                  className="input"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  {INVENTORY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {labels.categories[c] ?? c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{labels.unit}</label>
                <select
                  className="input"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                >
                  {INVENTORY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {labels.units[u] ?? u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{labels.quantity}</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="any"
                  value={newItem.quantityOnHand}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantityOnHand: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">{labels.minimumStock}</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="any"
                  value={newItem.minimumStock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minimumStock: e.target.value })
                  }
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              {labels.save}
            </button>
          </form>

          <form onSubmit={handleMovement} className="card space-y-4 max-w-2xl">
            <h3 className="font-semibold text-ink">
              {movement.type === "inbound" ? labels.recordInbound : labels.recordOutbound}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">{labels.itemName}</label>
                <select
                  className="input"
                  required
                  value={movement.itemId}
                  onChange={(e) => setMovement({ ...movement, itemId: e.target.value })}
                >
                  <option value="">—</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.quantityOnHand} {i.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tipo</label>
                <select
                  className="input"
                  value={movement.type}
                  onChange={(e) =>
                    setMovement({
                      ...movement,
                      type: e.target.value as "inbound" | "outbound",
                    })
                  }
                >
                  <option value="inbound">{labels.recordInbound}</option>
                  <option value="outbound">{labels.recordOutbound}</option>
                </select>
              </div>
              <div>
                <label className="label">{labels.quantity}</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={movement.quantity}
                  onChange={(e) => setMovement({ ...movement, quantity: e.target.value })}
                />
              </div>
              {movement.type === "inbound" && (
                <div>
                  <label className="label">{labels.donor}</label>
                  <input
                    className="input"
                    value={movement.donorName}
                    onChange={(e) =>
                      setMovement({ ...movement, donorName: e.target.value })
                    }
                  />
                </div>
              )}
              {movement.type === "outbound" && (
                <div>
                  <label className="label">{labels.destination}</label>
                  <input
                    className="input"
                    value={movement.destination}
                    onChange={(e) =>
                      setMovement({ ...movement, destination: e.target.value })
                    }
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="label">{labels.notes}</label>
                <input
                  className="input"
                  value={movement.notes}
                  onChange={(e) => setMovement({ ...movement, notes: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              {labels.save}
            </button>
          </form>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-ink-muted">
                  <th className="py-2 pr-4">{labels.itemName}</th>
                  <th className="py-2 pr-4">{labels.category}</th>
                  <th className="py-2 pr-4">{labels.stock}</th>
                  <th className="py-2">{labels.minimumStock}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => {
                  const low =
                    i.minimumStock != null && i.quantityOnHand <= i.minimumStock;
                  return (
                    <tr key={i.id} className="border-b border-border/60">
                      <td className="py-3 pr-4 font-medium text-ink">{i.name}</td>
                      <td className="py-3 pr-4 text-ink-secondary">
                        {labels.categories[i.category] ?? i.category}
                      </td>
                      <td
                        className={`py-3 pr-4 font-semibold ${low ? "text-warning" : "text-ink"}`}
                      >
                        {i.quantityOnHand} {labels.units[i.unit] ?? i.unit}
                      </td>
                      <td className="py-3 text-ink-secondary">
                        {i.minimumStock ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
