import { useState, type FormEvent } from "react";

interface CompanyFormProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  resourceTypes: Record<string, string>;
  states: string[];
}

const RESOURCE_KEYS = [
  "water", "food", "fuel", "transport", "internet", "telecom",
  "medicine", "machinery", "lodging",
];

export default function CompanyForm({
  locale,
  labels,
  resourceTypes,
  states,
}: CompanyFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  function toggleResource(key: string) {
    setSelectedResources((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      companyName: formData.get("company_name") as string,
      contactName: formData.get("contact_name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      resources: selectedResources,
      description: (formData.get("description") as string) || null,
    };

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setMessage(
        locale === "es"
          ? "Registro enviado correctamente."
          : "Registration submitted successfully."
      );
      form.reset();
      setSelectedResources([]);
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
          <label className="label" htmlFor="company_name">{labels.companyName}</label>
          <input className="input" id="company_name" name="company_name" required />
        </div>
        <div>
          <label className="label" htmlFor="contact_name">{labels.contactName}</label>
          <input className="input" id="contact_name" name="contact_name" required />
        </div>
        <div>
          <label className="label" htmlFor="phone">{labels.phone}</label>
          <input className="input" id="phone" name="phone" type="tel" required />
        </div>
        <div>
          <label className="label" htmlFor="email">{labels.email}</label>
          <input className="input" id="email" name="email" type="email" required />
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
      </div>

      <div>
        <span className="label">{labels.resources}</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {RESOURCE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleResource(key)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                selectedResources.includes(key)
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-ink-secondary hover:border-ink-muted"
              }`}
            >
              {resourceTypes[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">{labels.description}</label>
        <textarea className="input min-h-[100px]" id="description" name="description" />
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

      <button type="submit" className="btn-primary" disabled={status === "loading" || selectedResources.length === 0}>
        {status === "loading" ? (locale === "es" ? "Enviando..." : "Submitting...") : labels.submit ?? "Enviar"}
      </button>
    </form>
  );
}
