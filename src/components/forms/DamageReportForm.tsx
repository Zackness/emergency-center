import { useState, type FormEvent } from "react";

interface DamageReportFormProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  states: string[];
  onSubmitted?: () => void;
}

export default function DamageReportForm({
  locale,
  labels,
  states,
  onSubmitted,
}: DamageReportFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latInput = document.getElementById("latitude") as HTMLInputElement | null;
      const lngInput = document.getElementById("longitude") as HTMLInputElement | null;
      if (latInput) latInput.value = pos.coords.latitude.toFixed(6);
      if (lngInput) lngInput.value = pos.coords.longitude.toFixed(6);
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      severity: formData.get("severity") as string,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      address: (formData.get("address") as string) || null,
      latitude: formData.get("latitude") as string,
      longitude: formData.get("longitude") as string,
      description: (formData.get("description") as string) || null,
      reporter_name: (formData.get("reporter_name") as string) || null,
      reporter_contact: (formData.get("reporter_contact") as string) || null,
      source_name: (formData.get("source_name") as string) || null,
      source_url: (formData.get("source_url") as string) || null,
    };

    try {
      const res = await fetch("/api/damage-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setMessage(
        locale === "es"
          ? "Reporte enviado. Nuestro equipo lo revisará pronto."
          : "Report submitted. Our team will review it shortly."
      );
      form.reset();
      onSubmitted?.();
    } catch {
      setStatus("error");
      setMessage(
        locale === "es"
          ? "No se pudo enviar. Intenta de nuevo más tarde."
          : "Could not submit. Please try again later."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 max-w-2xl">
      <div className="rounded-xl border border-warning/30 bg-warning-muted p-4 text-sm text-warning">
        {labels.notice}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">{labels.titleField}</label>
          <input className="input" id="title" name="title" required placeholder={labels.titlePlaceholder} />
        </div>
        <div>
          <label className="label" htmlFor="severity">{labels.severity}</label>
          <select className="input" id="severity" name="severity" required defaultValue="damaged">
            <option value="collapsed">{labels.severityCollapsed}</option>
            <option value="damaged">{labels.severityDamaged}</option>
            <option value="evacuated">{labels.severityEvacuated}</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="state">{labels.state}</label>
          <select className="input" id="state" name="state" required>
            <option value="">{labels.state}</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="city">{labels.city}</label>
          <input className="input" id="city" name="city" required />
        </div>
        <div>
          <label className="label" htmlFor="address">{labels.address}</label>
          <input className="input" id="address" name="address" />
        </div>
        <div>
          <label className="label" htmlFor="latitude">{labels.latitude}</label>
          <input className="input" id="latitude" name="latitude" type="number" step="any" required />
        </div>
        <div>
          <label className="label" htmlFor="longitude">{labels.longitude}</label>
          <input className="input" id="longitude" name="longitude" type="number" step="any" required />
        </div>
        <div className="sm:col-span-2">
          <button type="button" className="btn-secondary text-sm" onClick={useMyLocation}>
            {labels.useMyLocation}
          </button>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">{labels.description}</label>
          <textarea className="input min-h-[100px]" id="description" name="description" />
        </div>
        <div>
          <label className="label" htmlFor="reporter_name">{labels.reporterName}</label>
          <input className="input" id="reporter_name" name="reporter_name" />
        </div>
        <div>
          <label className="label" htmlFor="reporter_contact">{labels.reporterContact}</label>
          <input className="input" id="reporter_contact" name="reporter_contact" />
        </div>
        <div>
          <label className="label" htmlFor="source_name">{labels.sourceName}</label>
          <input className="input" id="source_name" name="source_name" placeholder={labels.sourcePlaceholder} />
        </div>
        <div>
          <label className="label" htmlFor="source_url">{labels.sourceUrl}</label>
          <input className="input" id="source_url" name="source_url" type="url" placeholder="https://" />
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-secondary">
        <input type="checkbox" required className="mt-1 rounded" />
        {labels.consent}
      </label>

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

      <button type="submit" className="btn-primary" disabled={status === "loading"}>
        {status === "loading"
          ? locale === "es"
            ? "Enviando..."
            : "Submitting..."
          : labels.submit ?? "Enviar"}
      </button>
    </form>
  );
}
