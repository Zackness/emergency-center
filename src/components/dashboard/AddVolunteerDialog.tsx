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
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-volunteer-title"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative z-10 flex max-h-[min(92vh,40rem)] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface-elevated shadow-elevated sm:max-w-md sm:rounded-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
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

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
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

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
            <button type="button" className="btn-secondary min-h-11 w-full sm:w-auto" onClick={onClose}>
              {labels.form.close}
            </button>
            <button type="submit" className="btn-primary min-h-11 w-full sm:w-auto" disabled={status === "loading"}>
              {status === "loading" ? labels.form.submitting : labels.form.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
