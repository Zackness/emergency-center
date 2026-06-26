import { useState, type FormEvent } from "react";

interface VolunteerFormProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  states: string[];
  helpCenters?: { id: string; name: string; city: string; state: string }[];
}

export default function VolunteerForm({
  locale,
  labels,
  states,
  helpCenters = [],
}: VolunteerFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      profession: formData.get("profession") as string,
      specialty: (formData.get("specialty") as string) || null,
      vehicle: (formData.get("vehicle") as string) || null,
      availability: formData.get("availability") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      location: (formData.get("location") as string) || null,
      notes: (formData.get("notes") as string) || null,
      help_center_id: (formData.get("help_center_id") as string) || null,
    };

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setMessage(
        locale === "es"
          ? "Registro enviado correctamente. Gracias por tu solidaridad."
          : "Registration submitted successfully. Thank you for your solidarity."
      );
      form.reset();
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">{labels.name}</label>
          <input className="input" id="name" name="name" required />
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
          <label className="label" htmlFor="profession">{labels.profession}</label>
          <input className="input" id="profession" name="profession" required />
        </div>
        <div>
          <label className="label" htmlFor="specialty">{labels.specialty}</label>
          <input className="input" id="specialty" name="specialty" />
        </div>
        <div>
          <label className="label" htmlFor="vehicle">{labels.vehicle}</label>
          <input className="input" id="vehicle" name="vehicle" />
        </div>
        <div>
          <label className="label" htmlFor="availability">{labels.availability}</label>
          <input className="input" id="availability" name="availability" required placeholder="24/7, fines de semana..." />
        </div>
        <div>
          <label className="label" htmlFor="phone">{labels.phone}</label>
          <input className="input" id="phone" name="phone" type="tel" required />
        </div>
        <div>
          <label className="label" htmlFor="email">{labels.email}</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="location">{labels.location}</label>
          <input className="input" id="location" name="location" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">{labels.notes}</label>
          <textarea className="input min-h-[100px]" id="notes" name="notes" />
        </div>
        {helpCenters.length > 0 && (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="help_center_id">{labels.helpCenter}</label>
            <select className="input" id="help_center_id" name="help_center_id">
              <option value="">{labels.helpCenterNone}</option>
              {helpCenters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.city}, {c.state}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-muted">{labels.helpCenterHint}</p>
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-secondary">
        <input type="checkbox" required className="mt-1 rounded" />
        {labels.consent}
      </label>

      {message && (
        <div className={`rounded-xl p-4 text-sm ${status === "success" ? "bg-success-muted text-success" : "bg-emergency-muted text-emergency"}`}>
          {message}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={status === "loading"}>
        {status === "loading" ? (locale === "es" ? "Enviando..." : "Submitting...") : labels.submit ?? "Enviar"}
      </button>
    </form>
  );
}
