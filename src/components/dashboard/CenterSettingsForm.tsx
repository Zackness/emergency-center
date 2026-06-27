import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { STAFF_NEEDED_KEYS } from "@/lib/help-centers/staff-needed";

const ACCEPT_LABELS: Record<"es" | "en", Record<string, string>> = {
  es: {
    water: "Agua",
    food: "Alimentos",
    medicine: "Medicinas",
    clothing: "Ropa",
    hygiene: "Higiene",
    blankets: "Mantas",
  },
  en: {
    water: "Water",
    food: "Food",
    medicine: "Medicine",
    clothing: "Clothing",
    hygiene: "Hygiene",
    blankets: "Blankets",
  },
};

const ACCEPT_KEYS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

interface CenterData {
  id: string;
  name: string;
  description: string | null;
  state: string;
  city: string;
  address: string;
  phone: string | null;
  email: string | null;
  schedule: string | null;
  accepts: string[];
  staff_needed: string[];
  staff_needed_notes: string | null;
  is_verified: boolean;
}

interface CenterSettingsFormProps {
  centerId: string;
  states: string[];
  locale: Locale;
  labels: {
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
  staffNeededLabels: Record<string, string>;
}

export default function CenterSettingsForm({
  centerId,
  states,
  locale,
  labels,
  staffNeededLabels,
}: CenterSettingsFormProps) {
  const [center, setCenter] = useState<CenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch(`/api/help-centers/${centerId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as { center: CenterData };
        if (!cancelled) setCenter(data.center);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el centro");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [centerId]);

  if (loading) return <p className="text-sm text-ink-secondary">{labels.loading}</p>;
  if (error || !center) return <p className="text-sm text-emergency">{error ?? "—"}</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!center) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/help-centers/${centerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(center),
      });
      const data = (await res.json()) as { error?: string; center?: CenterData };
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setCenter(data.center ?? center);
      setMessage(labels.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function toggleAccept(key: string) {
    setCenter((prev) => {
      if (!prev) return prev;
      const has = prev.accepts.includes(key);
      return {
        ...prev,
        accepts: has ? prev.accepts.filter((a) => a !== key) : [...prev.accepts, key],
      };
    });
  }

  function toggleStaffNeeded(key: string) {
    setCenter((prev) => {
      if (!prev) return prev;
      const has = prev.staff_needed.includes(key);
      return {
        ...prev,
        staff_needed: has
          ? prev.staff_needed.filter((role) => role !== key)
          : [...prev.staff_needed, key],
      };
    });
  }

  const acceptLocale = locale === "es" || locale === "pt" ? "es" : "en";

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-ink">{labels.title}</h3>
        {center.is_verified ? (
          <span className="badge-verified">{labels.verified}</span>
        ) : (
          <span className="rounded-full bg-warning-muted px-2 py-0.5 text-xs text-warning">
            {labels.pendingVerification}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">{labels.name}</label>
          <input
            className="input"
            required
            value={center.name}
            onChange={(e) => setCenter({ ...center, name: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">{labels.description}</label>
          <textarea
            className="input min-h-[88px]"
            value={center.description ?? ""}
            onChange={(e) => setCenter({ ...center, description: e.target.value || null })}
          />
        </div>
        <div>
          <label className="label">{labels.state}</label>
          <select
            className="input"
            required
            value={center.state}
            onChange={(e) => setCenter({ ...center, state: e.target.value })}
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{labels.city}</label>
          <input
            className="input"
            required
            value={center.city}
            onChange={(e) => setCenter({ ...center, city: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">{labels.address}</label>
          <input
            className="input"
            required
            value={center.address}
            onChange={(e) => setCenter({ ...center, address: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{labels.phone}</label>
          <input
            className="input"
            value={center.phone ?? ""}
            onChange={(e) => setCenter({ ...center, phone: e.target.value || null })}
          />
        </div>
        <div>
          <label className="label">{labels.email}</label>
          <input
            className="input"
            type="email"
            value={center.email ?? ""}
            onChange={(e) => setCenter({ ...center, email: e.target.value || null })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">{labels.schedule}</label>
          <input
            className="input"
            value={center.schedule ?? ""}
            onChange={(e) => setCenter({ ...center, schedule: e.target.value || null })}
          />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="label">{labels.accepts}</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {ACCEPT_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-ink-secondary">
                <input
                  type="checkbox"
                  checked={center.accepts.includes(key)}
                  onChange={() => toggleAccept(key)}
                />
                {ACCEPT_LABELS[acceptLocale][key]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2">
          <legend className="label">{labels.staffNeeded}</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {STAFF_NEEDED_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-ink-secondary">
                <input
                  type="checkbox"
                  checked={center.staff_needed.includes(key)}
                  onChange={() => toggleStaffNeeded(key)}
                />
                {staffNeededLabels[key] ?? key}
              </label>
            ))}
          </div>
          <label className="label mt-4" htmlFor="staff-needed-notes">
            {labels.staffNeededNotes}
          </label>
          <textarea
            id="staff-needed-notes"
            className="input mt-1 min-h-[72px]"
            placeholder={labels.staffNeededNotesPlaceholder}
            value={center.staff_needed_notes ?? ""}
            onChange={(e) =>
              setCenter({ ...center, staff_needed_notes: e.target.value || null })
            }
          />
        </fieldset>
      </div>

      {error && <p className="text-sm text-emergency">{error}</p>}
      {message && <p className="text-sm text-accent">{message}</p>}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? labels.loading : labels.save}
      </button>
    </form>
  );
}
