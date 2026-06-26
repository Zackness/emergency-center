import { useState, type FormEvent } from "react";

interface NewsSubmissionFormProps {
  locale: "es" | "en";
  labels: Record<string, string>;
  onSubmitted?: () => void;
}

export default function NewsSubmissionForm({
  locale,
  labels,
  onSubmitted,
}: NewsSubmissionFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      summary: formData.get("summary") as string,
      source: formData.get("source") as string,
      source_url: formData.get("source_url") as string,
    };

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setMessage(labels.success);
      form.reset();
      onSubmitted?.();
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
        <input className="input" type="text" id="title" name="title" required maxLength={200} />
      </div>

      <div>
        <label className="label" htmlFor="summary">
          {labels.summary} <span className="text-emergency">*</span>
        </label>
        <textarea
          className="input min-h-[120px] resize-y"
          id="summary"
          name="summary"
          required
          maxLength={1200}
          placeholder={labels.summaryPlaceholder}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="source">
            {labels.source} <span className="text-emergency">*</span>
          </label>
          <input className="input" type="text" id="source" name="source" required maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="source_url">
            {labels.sourceUrl} <span className="text-emergency">*</span>
          </label>
          <input
            className="input"
            type="url"
            id="source_url"
            name="source_url"
            required
            placeholder="https://"
          />
        </div>
      </div>

      <p className="text-xs text-ink-muted">{labels.hint}</p>

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
