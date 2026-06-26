import { useState, type FormEvent } from "react";

interface FeatureSuggestionFormProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  categories: Record<string, string>;
}

const CATEGORY_KEYS = [
  "missing",
  "help_centers",
  "maps",
  "volunteers",
  "infrastructure",
  "community",
  "other",
];

export default function FeatureSuggestionForm({
  locale,
  labels,
  categories,
}: FeatureSuggestionFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: (formData.get("category") as string) || null,
      contact_name: (formData.get("contact_name") as string) || null,
      contact_email: (formData.get("contact_email") as string) || null,
    };

    try {
      const res = await fetch("/api/feature-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setMessage(labels.success);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(labels.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 max-w-2xl">
      <div>
        <label className="label" htmlFor="title">
          {labels.title} <span className="text-emergency">*</span>
        </label>
        <input
          className="input"
          type="text"
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder={labels.titlePlaceholder}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          {labels.description} <span className="text-emergency">*</span>
        </label>
        <textarea
          className="input min-h-[120px] resize-y"
          id="description"
          name="description"
          required
          maxLength={2000}
          placeholder={labels.descriptionPlaceholder}
        />
      </div>

      <div>
        <label className="label" htmlFor="category">
          {labels.category}
        </label>
        <select className="input" id="category" name="category" defaultValue="">
          <option value="">{labels.categoryAny}</option>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>
              {categories[key]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="contact_name">
            {labels.contactName}
          </label>
          <input className="input" type="text" id="contact_name" name="contact_name" maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="contact_email">
            {labels.contactEmail}
          </label>
          <input className="input" type="email" id="contact_email" name="contact_email" maxLength={200} />
        </div>
      </div>

      <p className="text-xs text-ink-muted">{labels.contactHint}</p>

      {message && (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            status === "success"
              ? "bg-success-muted text-success"
              : "bg-emergency-muted text-emergency"
          }`}
        >
          {message}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={status === "loading"}>
        {status === "loading" ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
