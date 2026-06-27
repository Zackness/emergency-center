import { useState, type FormEvent } from "react";

interface AdminForgotPanelProps {
  labels: {
    title: string;
    subtitle: string;
    email: string;
    submit: string;
    submitting: string;
    sent: string;
    error: string;
    backToLogin: string;
  };
  loginPath: string;
}

export default function AdminForgotPanel({ labels, loginPath }: AdminForgotPanelProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, context: "admin", locale: "es" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.error);

      setStatus("success");
      setMessage(labels.sent);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.error);
    }
  }

  return (
    <div className="card w-full max-w-md space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{labels.title}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{labels.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="admin-forgot-email">
            {labels.email}
          </label>
          <input
            className="input"
            id="admin-forgot-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        {message && (
          <p className={`text-sm ${status === "success" ? "text-success" : "text-emergency"}`}>
            {message}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
          {status === "loading" ? labels.submitting : labels.submit}
        </button>
      </form>

      <a href={loginPath} className="text-sm text-accent hover:underline">
        {labels.backToLogin}
      </a>
    </div>
  );
}
