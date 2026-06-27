import { useState, type FormEvent } from "react";

export interface AddVolunteerFormLabels {
  name: string;
  nationalId: string;
  nationalIdPlaceholder: string;
  phone: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  close: string;
}

interface AddVolunteerDialogProps {
  open: boolean;
  centerId: string;
  labels: {
    title: string;
    subtitle: string;
    form: AddVolunteerFormLabels;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVolunteerDialog({
  open,
  centerId,
  labels,
  onClose,
  onSuccess,
}: AddVolunteerDialogProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      nationalId: String(formData.get("nationalId") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
    };

    try {
      const res = await fetch(`/api/help-centers/${centerId}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.form.error);

      setStatus("success");
      setMessage(labels.form.success);
      e.currentTarget.reset();
      window.setTimeout(() => {
        onSuccess();
        onClose();
        setStatus("idle");
        setMessage("");
      }, 600);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.form.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-volunteer-title"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 id="add-volunteer-title" className="text-lg font-semibold text-ink">
              {labels.title}
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">{labels.subtitle}</p>
          </div>
          <button
            type="button"
            className="btn-ghost min-h-9 min-w-9 rounded-lg text-ink-muted"
            onClick={onClose}
            aria-label={labels.form.close}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="label" htmlFor="vol-name">
              {labels.form.name}
            </label>
            <input className="input" id="vol-name" name="name" required autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="vol-national-id">
              {labels.form.nationalId}
            </label>
            <input
              className="input"
              id="vol-national-id"
              name="nationalId"
              required
              inputMode="numeric"
              placeholder={labels.form.nationalIdPlaceholder}
            />
          </div>
          <div>
            <label className="label" htmlFor="vol-phone">
              {labels.form.phone}
            </label>
            <input className="input" id="vol-phone" name="phone" type="tel" required />
          </div>

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

          <div className="flex flex-wrap gap-2 justify-end border-t border-border pt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {labels.form.close}
            </button>
            <button type="submit" className="btn-primary" disabled={status === "loading"}>
              {status === "loading" ? labels.form.submitting : labels.form.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
