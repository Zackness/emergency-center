import { useEffect, useRef, useState, type FormEvent } from "react";

interface EmailOtpDialogProps {
  email: string;
  open: boolean;
  labels: {
    title: string;
    subtitle: string;
    code: string;
    verify: string;
    resend: string;
    resendSent: string;
    invalid: string;
    close: string;
  };
  onVerified: () => void;
  onClose: () => void;
}

export default function EmailOtpDialog({
  email,
  open,
  labels,
  onVerified,
  onClose,
}: EmailOtpDialogProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sent">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode("");
      setStatus("idle");
      setMessage("");
      setResendStatus("idle");
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, email]);

  if (!open) return null;

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: code.trim(), type: "signup" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.invalid);

      onVerified();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.invalid);
    } finally {
      setStatus((prev) => (prev === "loading" ? "idle" : prev));
    }
  }

  async function handleResend() {
    setResendStatus("idle");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.invalid);
      setResendStatus("sent");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.invalid);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-dialog-title"
    >
      <div className="card w-full max-w-md shadow-elevated">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="otp-dialog-title" className="text-lg font-semibold text-ink">
              {labels.title}
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {labels.subtitle.replace("{email}", email)}
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost shrink-0 px-2 py-1 text-sm"
            onClick={onClose}
            aria-label={labels.close}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="otp-code">
              {labels.code}
            </label>
            <input
              ref={inputRef}
              id="otp-code"
              className="input text-center text-lg tracking-[0.3em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
              required
            />
          </div>

          {message && <p className="text-sm text-emergency">{message}</p>}

          <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
            {status === "loading" ? "…" : labels.verify}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <button type="button" className="text-accent hover:underline" onClick={() => void handleResend()}>
            {labels.resend}
          </button>
          {resendStatus === "sent" && (
            <span className="text-success">{labels.resendSent}</span>
          )}
        </div>
      </div>
    </div>
  );
}
