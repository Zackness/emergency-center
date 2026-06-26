import { useState, type FormEvent } from "react";
import ImageUploadField from "@/components/forms/ImageUploadField";
import type { ExternalSource } from "@/types";
interface MissingPersonFormProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  states: string[];
  externalSources: ExternalSource[];
}

export default function MissingPersonForm({
  locale,
  labels,
  states,
  externalSources,
}: MissingPersonFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [hasExternalLink, setHasExternalLink] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      full_name: formData.get("full_name") as string,
      national_id: (formData.get("national_id") as string) || null,
      age: (formData.get("age") as string) || null,
      gender: (formData.get("gender") as string) || null,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      last_seen_location: (formData.get("last_seen_location") as string) || null,
      last_seen_at: (formData.get("last_seen_at") as string) || null,
      description: (formData.get("description") as string) || null,
      contact_name: formData.get("contact_name") as string,
      contact_phone: formData.get("contact_phone") as string,
      contact_email: (formData.get("contact_email") as string) || null,
      photo_url: photoUrl,
      external_source_slug: hasExternalLink
        ? (formData.get("external_source_slug") as string) || null
        : null,
      external_url: hasExternalLink
        ? (formData.get("external_url") as string) || null
        : null,
    };

    try {
      const res = await fetch("/api/missing-persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        duplicate?: boolean;
        full_name?: string;
        message?: string;
      };

      if (res.status === 409 && data.duplicate) {
        setStatus("error");
        setMessage(
          locale === "es"
            ? `Esta persona ya figura en nuestro registro${data.full_name ? ` (${data.full_name})` : ""}. No se creó un duplicado.`
            : `This person is already in our registry${data.full_name ? ` (${data.full_name})` : ""}. No duplicate was created.`
        );
        return;
      }

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setMessage(
        locale === "es"
          ? "Registro enviado. Nuestro equipo lo revisará pronto."
          : "Registration submitted. Our team will review it shortly."
      );
      form.reset();
      setHasExternalLink(false);
      setPhotoUrl(null);
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
        {labels.backupNotice}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="full_name">{labels.fullName}</label>
          <input className="input" id="full_name" name="full_name" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="national_id">{labels.nationalId}</label>
          <input
            className="input"
            id="national_id"
            name="national_id"
            inputMode="numeric"
            autoComplete="off"
            placeholder={labels.nationalIdPlaceholder}
          />
          {labels.nationalIdHint && (
            <p className="mt-1 text-xs text-ink-muted">{labels.nationalIdHint}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="age">{labels.age}</label>
          <input className="input" id="age" name="age" type="number" min="0" max="120" />
        </div>
        <div>
          <label className="label" htmlFor="gender">{labels.gender}</label>
          <input className="input" id="gender" name="gender" />
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
        <div className="sm:col-span-2">
          <label className="label" htmlFor="last_seen_location">{labels.lastSeenLocation}</label>
          <input className="input" id="last_seen_location" name="last_seen_location" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="last_seen_at">{labels.lastSeenAt}</label>
          <input className="input" id="last_seen_at" name="last_seen_at" type="datetime-local" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">{labels.description}</label>
          <textarea className="input min-h-[100px]" id="description" name="description" />
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField
            id="photo"
            name="photo_url"
            label={labels.photo}
            hint={labels.photoHint}
            folder="missing-persons"
            locale={locale}
            value={photoUrl}
            onChange={setPhotoUrl}
          />
        </div>
        <div>
          <label className="label" htmlFor="contact_name">{labels.contactName}</label>
          <input className="input" id="contact_name" name="contact_name" required />
        </div>
        <div>
          <label className="label" htmlFor="contact_phone">{labels.contactPhone}</label>
          <input className="input" id="contact_phone" name="contact_phone" type="tel" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="contact_email">{labels.contactEmail}</label>
          <input className="input" id="contact_email" name="contact_email" type="email" />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
        <label className="flex items-start gap-3 text-sm text-ink-secondary">
          <input
            type="checkbox"
            className="mt-1 rounded"
            checked={hasExternalLink}
            onChange={(e) => setHasExternalLink(e.target.checked)}
          />
          {labels.hasExternalLink}
        </label>

        {hasExternalLink && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="external_source_slug">{labels.externalSource}</label>
              <select className="input" id="external_source_slug" name="external_source_slug">
                <option value="">{labels.externalSource}</option>
                {externalSources.map((source) => (
                  <option key={source.id} value={source.slug}>{source.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="external_url">{labels.externalUrl}</label>
              <input
                className="input"
                id="external_url"
                name="external_url"
                type="url"
                placeholder="https://"
              />
            </div>
          </div>
        )}
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
