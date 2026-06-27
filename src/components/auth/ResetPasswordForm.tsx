import { useState, type FormEvent } from "react";

interface ResetPasswordFormProps {
  labels: {
    title: string;
    subtitle: string;
    password: string;
    confirmPassword: string;
    submit: string;
    submitting: string;
    mismatch: string;
    success: string;
    loginLink: string;
    error: string;
  };
  loginPath: string;
  context?: "admin" | "coordinator";
}

export default function ResetPasswordForm({
  labels,
  loginPath,
}: ResetPasswordFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm_password") ?? "");

    if (password !== confirm) {
      setStatus("error");
      setMessage(labels.mismatch);
      return;
    }

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.error);

      setStatus("success");
      setMessage(labels.success);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md card space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{labels.title}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{labels.subtitle}</p>
      </div>

      {status === "success" ? (
        <div className="space-y-4">
          <p className="text-sm text-success">{message}</p>
          <a href={loginPath} className="btn-primary inline-flex">
            {labels.loginLink}
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="new-password">
              {labels.password}
            </label>
            <input
              className="input"
              id="new-password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm-password">
              {labels.confirmPassword}
            </label>
            <input
              className="input"
              id="confirm-password"
              name="confirm_password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          {message && <p className="text-sm text-emergency">{message}</p>}
          <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
            {status === "loading" ? labels.submitting : labels.submit}
          </button>
        </form>
      )}
    </div>
  );
}
