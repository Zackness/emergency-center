import { useCallback, useEffect, useMemo, useState } from "react";
import type { AlliedPlatform, AlliedPlatformColor } from "@/types";

type FormState = {
  domain: string;
  url: string;
  description_es: string;
  description_en: string;
  color: AlliedPlatformColor;
  sort_order: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  domain: "",
  url: "",
  description_es: "",
  description_en: "",
  color: "blue",
  sort_order: "0",
  is_active: true,
};

const COLOR_OPTIONS: AlliedPlatformColor[] = ["blue", "yellow", "red"];

function formFromPlatform(platform: AlliedPlatform): FormState {
  return {
    domain: platform.domain,
    url: platform.url,
    description_es: platform.description.es,
    description_en: platform.description.en,
    color: platform.color,
    sort_order: String(platform.sort_order ?? 0),
    is_active: platform.is_active ?? true,
  };
}

export default function AlliedPlatformsPanel() {
  const [items, setItems] = useState<AlliedPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const isEditing = editingId !== null;

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [items]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/allied-platforms?include_inactive=1");
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/admin?error=unauthorized";
        return;
      }
      if (!res.ok) throw new Error("No se pudo cargar el listado");
      const data = (await res.json()) as { items: AlliedPlatform[] };
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

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function startEdit(platform: AlliedPlatform) {
    if (!platform.id) return;
    setEditingId(platform.id);
    setForm(formFromPlatform(platform));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      domain: form.domain.trim(),
      url: form.url.trim(),
      description_es: form.description_es.trim(),
      description_en: form.description_en.trim(),
      color: form.color,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/allied-platforms/${editingId}` : "/api/allied-platforms",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = (await res.json()) as { error?: string; item?: AlliedPlatform };
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo guardar");
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(platform: AlliedPlatform) {
    if (!platform.id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/allied-platforms/${platform.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: platform.domain,
          url: platform.url,
          description_es: platform.description.es,
          description_en: platform.description.en,
          color: platform.color,
          sort_order: platform.sort_order ?? 0,
          is_active: !(platform.is_active ?? true),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo actualizar");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-lg font-semibold text-ink">
          {isEditing ? "Editar plataforma aliada" : "Registrar plataforma aliada"}
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Los cambios se reflejan en la home, desaparecidos y demás secciones que listan aliados.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ap-url">
              URL
            </label>
            <input
              id="ap-url"
              className="input"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://vzlayuda.com"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="ap-domain">
              Dominio (opcional)
            </label>
            <input
              id="ap-domain"
              className="input"
              value={form.domain}
              onChange={(e) => setForm((prev) => ({ ...prev, domain: e.target.value }))}
              placeholder="vzlayuda.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ap-desc-es">
              Descripción (español)
            </label>
            <textarea
              id="ap-desc-es"
              className="input min-h-[80px]"
              value={form.description_es}
              onChange={(e) => setForm((prev) => ({ ...prev, description_es: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ap-desc-en">
              Descripción (inglés)
            </label>
            <textarea
              id="ap-desc-en"
              className="input min-h-[80px]"
              value={form.description_en}
              onChange={(e) => setForm((prev) => ({ ...prev, description_en: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="ap-color">
              Color
            </label>
            <select
              id="ap-color"
              className="input"
              value={form.color}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, color: e.target.value as AlliedPlatformColor }))
              }
            >
              {COLOR_OPTIONS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ap-sort">
              Orden
            </label>
            <input
              id="ap-sort"
              className="input"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-secondary sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            Activa (visible en el sitio público)
          </label>

          {error && <p className="text-sm text-emergency sm:col-span-2">{error}</p>}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Registrar"}
            </button>
            {isEditing && (
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={saving}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Plataformas registradas</h2>
          <button type="button" className="btn-secondary text-sm" onClick={() => void load()} disabled={loading}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-ink-secondary">Cargando…</p>
        ) : sortedItems.length === 0 ? (
          <p className="mt-4 text-sm text-ink-secondary">
            No hay plataformas en la base de datos. Ejecuta la migración o registra la primera aquí.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {sortedItems.map((platform) => (
              <li key={platform.id ?? platform.domain} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{platform.domain}</p>
                      {platform.is_active === false && (
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-muted">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-secondary">{platform.description.es}</p>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-accent hover:underline"
                    >
                      {platform.url}
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {platform.id && (
                      <>
                        <button
                          type="button"
                          className="btn-secondary text-sm"
                          onClick={() => startEdit(platform)}
                          disabled={saving}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-ghost text-sm text-ink-secondary"
                          onClick={() => void toggleActive(platform)}
                          disabled={saving}
                        >
                          {platform.is_active === false ? "Activar" : "Desactivar"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
