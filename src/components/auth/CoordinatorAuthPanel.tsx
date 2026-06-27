import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import EmailOtpDialog from "@/components/auth/EmailOtpDialog";

type AuthView = "login" | "signup" | "forgot";

interface CoordinatorAuthPanelProps {
  locale: Locale;
  labels: Record<string, string>;
  nextPath: string;
  registerPath: string;
}

export default function CoordinatorAuthPanel({
  locale,
  labels,
  nextPath,
  registerPath,
}: CoordinatorAuthPanelProps) {
  const [view, setView] = useState<AuthView>("login");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [verifiedBanner, setVerifiedBanner] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "").trim();

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = (await res.json()) as { error?: string; needs_confirmation?: boolean };

      if (!res.ok) throw new Error(data.error ?? labels.authError);

      if (data.needs_confirmation) {
        setOtpEmail(email);
        setOtpOpen(true);
        setStatus("idle");
        return;
      }

      window.location.href = nextPath;
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.authError);
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/session-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.authError);

      window.location.href = nextPath;
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.authError);
    }
  }

  async function handleForgot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, context: "coordinator" }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? labels.authError);

      setStatus("success");
      setMessage(labels.forgotSent);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : labels.authError);
    }
  }

  function handleOtpVerified() {
    setOtpOpen(false);
    setVerifiedBanner(true);
    setView("login");
    setStatus("success");
    setMessage(labels.otpVerifiedLogin);
  }

  return (
    <>
      <EmailOtpDialog
        email={otpEmail}
        open={otpOpen}
        labels={{
          title: labels.otpTitle,
          subtitle: labels.otpSubtitle,
          code: labels.otpCode,
          verify: labels.otpVerify,
          resend: labels.otpResend,
          resendSent: labels.otpResendSent,
          invalid: labels.otpInvalid,
          close: labels.otpClose,
        }}
        onVerified={handleOtpVerified}
        onClose={() => setOtpOpen(false)}
      />

      <div className="mx-auto w-full max-w-md space-y-6">
        {verifiedBanner && (
          <div className="rounded-xl border border-success/30 bg-success-muted p-4 text-sm text-success">
            {labels.otpVerifiedLogin}
          </div>
        )}

        <div className="card space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{labels.portalTitle}</h1>
            <p className="mt-1 text-sm text-ink-secondary">{labels.portalSubtitle}</p>
          </div>

          {view !== "forgot" && (
            <div className="flex gap-2 border-b border-border">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  view === "login"
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-secondary"
                }`}
                onClick={() => {
                  setView("login");
                  setMessage("");
                  setStatus("idle");
                }}
              >
                {labels.loginTab}
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  view === "signup"
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-secondary"
                }`}
                onClick={() => {
                  setView("signup");
                  setMessage("");
                  setStatus("idle");
                }}
              >
                {labels.signupTab}
              </button>
            </div>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="label" htmlFor="signup-name">
                  {labels.fullName}
                </label>
                <input className="input" id="signup-name" name="full_name" required />
              </div>
              <div>
                <label className="label" htmlFor="signup-email">
                  {labels.email}
                </label>
                <input className="input" id="signup-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div>
                <label className="label" htmlFor="signup-password">
                  {labels.password}
                </label>
                <input
                  className="input"
                  id="signup-password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>
              {message && (
                <p className={`text-sm ${status === "success" ? "text-success" : "text-emergency"}`}>
                  {message}
                </p>
              )}
              <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
                {status === "loading" ? labels.submitting : labels.signupTab}
              </button>
            </form>
          )}

          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label" htmlFor="login-email">
                  {labels.email}
                </label>
                <input className="input" id="login-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div>
                <label className="label" htmlFor="login-password">
                  {labels.password}
                </label>
                <input
                  className="input"
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="button"
                className="text-sm text-accent hover:underline"
                onClick={() => {
                  setView("forgot");
                  setMessage("");
                  setStatus("idle");
                }}
              >
                {labels.forgotPassword}
              </button>
              {message && (
                <p className={`text-sm ${status === "success" ? "text-success" : "text-emergency"}`}>
                  {message}
                </p>
              )}
              <button type="submit" className="btn-primary w-full" disabled={status === "loading"}>
                {status === "loading" ? labels.submitting : labels.loginTab}
              </button>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-ink-secondary">{labels.forgotSubtitle}</p>
              <div>
                <label className="label" htmlFor="forgot-email">
                  {labels.email}
                </label>
                <input className="input" id="forgot-email" name="email" type="email" required autoComplete="email" />
              </div>
              {message && (
                <p className={`text-sm ${status === "success" ? "text-success" : "text-emergency"}`}>
                  {message}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary" disabled={status === "loading"}>
                  {status === "loading" ? labels.submitting : labels.forgotSubmit}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setView("login");
                    setMessage("");
                    setStatus("idle");
                  }}
                >
                  {labels.backToLogin}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink-secondary">
          {labels.registerCenterPrompt}{" "}
          <a href={registerPath} className="text-accent hover:underline">
            {labels.registerCenterLink}
          </a>
        </p>
      </div>
    </>
  );
}
