import { useCallback, useEffect, useState } from "react";
import type { AdminHelpCenterRow } from "@/lib/admin/help-centers";
import { useAdminHelpCentersRealtime } from "@/lib/hooks/useHelpCenterRealtime";

export default function AdminHelpCentersPanel() {
  const [items, setItems] = useState<AdminHelpCenterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [coordinatorEmails, setCoordinatorEmails] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/help-centers");
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/admin?error=unauthorized";
        return;
      }
      if (res.status === 503) {
        setError("La base de datos no está configurada. Activa Supabase para gestionar centros.");
        setItems([]);
        return;
      }
      if (!res.ok) throw new Error("No se pudo cargar el listado");
      const data = (await res.json()) as { items: AdminHelpCenterRow[] };
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useAdminHelpCentersRealtime(load);

  async function patchCenter(
    id: string,
    payload: { is_verified?: boolean; is_active?: boolean; coordinator_email?: string }
  ) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/help-centers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingId(null);
    }
  }

  const pendingCount = items.filter((c) => !c.is_verified).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-ink">{items.length}</p>
          <p className="text-sm text-ink-secondary">Centros registrados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          <p className="text-sm text-ink-secondary">Pendientes de verificar</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-ink">{items.filter((c) => c.is_active).length}</p>
          <p className="text-sm text-ink-secondary">Activos en el directorio</p>
        </div>
      </div>

      {error && <p className="text-sm text-emergency">{error}</p>}

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Centros de acopio</h2>
          <button type="button" className="btn-secondary text-sm" onClick={() => void load()} disabled={loading}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-ink-secondary">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            No hay centros en la base de datos. Los coordinadores pueden registrarse en{" "}
            <a href="/centros-ayuda/registrar" className="text-accent hover:underline">
              /centros-ayuda/registrar
            </a>
            .
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((center) => (
              <li key={center.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{center.name}</h3>
                      {center.is_verified ? (
                        <span className="badge-verified">Verificado</span>
                      ) : (
                        <span className="rounded-full bg-warning-muted px-2 py-0.5 text-xs text-warning">
                          Sin verificar
                        </span>
                      )}
                      {!center.is_active && (
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-muted">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-secondary">
                      {center.city}, {center.state} — {center.address}
                    </p>
                    {center.phone && (
                      <p className="mt-1 text-sm text-ink-muted">Tel: {center.phone}</p>
                    )}
                    {center.coordinators.length > 0 && (
                      <p className="mt-2 text-xs text-ink-muted">
                        Coordinadores:{" "}
                        {center.coordinators.map((c) => c.email).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!center.is_verified && (
                      <button
                        type="button"
                        className="btn-primary text-sm"
                        disabled={savingId === center.id}
                        onClick={() => void patchCenter(center.id, { is_verified: true })}
                      >
                        Verificar
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-secondary text-sm"
                      disabled={savingId === center.id}
                      onClick={() =>
                        void patchCenter(center.id, { is_active: !center.is_active })
                      }
                    >
                      {center.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
                  <div className="min-w-[16rem] flex-1">
                    <label className="label text-xs" htmlFor={`coord-${center.id}`}>
                      Asignar coordinador por correo
                    </label>
                    <input
                      id={`coord-${center.id}`}
                      className="input"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={coordinatorEmails[center.id] ?? ""}
                      onChange={(e) =>
                        setCoordinatorEmails((prev) => ({
                          ...prev,
                          [center.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    disabled={savingId === center.id || !coordinatorEmails[center.id]?.trim()}
                    onClick={() =>
                      void patchCenter(center.id, {
                        coordinator_email: coordinatorEmails[center.id],
                      })
                    }
                  >
                    Asignar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
