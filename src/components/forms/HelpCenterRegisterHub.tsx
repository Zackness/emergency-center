import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { HelpCenterType } from "@/types";

type RegistrationMode = "own" | "third_party";
type AuthTab = "login" | "signup";

const CENTER_TYPES: HelpCenterType[] = [
  "church",
  "community",
  "university",
  "government",
  "ngo",
];

const ACCEPT_KEYS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"];

interface HelpCenterRegisterHubProps {
  locale: "es" | "en";
  states: string[];
  labels: Record<string, string>;
  typeLabels: Record<string, string>;
  acceptLabels: Record<string, string>;
  initialMode?: RegistrationMode;
  panelPath: string;
}

export default function HelpCenterRegisterHub({
  locale,
  states,
  labels,
  typeLabels,
  acceptLabels,
  initialMode = "own",
  panelPath,
}: HelpCenterRegisterHubProps) {
  const [mode, setMode] = useState<RegistrationMode>(initialMode);
  const [authTab, setAuthTab] = useState<AuthTab>("signup");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "error">("idle");
  const [authMessage, setAuthMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [submitMessage, setSubmitMessage] = useState("");
  const [selectedAccepts, setSelectedAccepts] = useState<string[]>(["water", "food"]);

  const loadSession = useCallback(async () => {
    setSessionLoading(true);
    try {
      const res = await fetch("/api/center-dashboard/session");
      if (res.ok) {
        const data = (await res.json()) as { email?: string };
        setSessionEmail(data.email ?? "coordinator");
      } else {
        setSessionEmail(null);
      }
    } catch {
      setSessionEmail(null);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  function toggleAccept(key: string) {
    setSelectedAccepts((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latInput = document.getElementById("hc-latitude") as HTMLInputElement | null;
      const lngInput = document.getElementById("hc-longitude") as HTMLInputElement | null;
      if (latInput) latInput.value = pos.coords.latitude.toFixed(6);
      if (lngInput) lngInput.value = pos.coords.longitude.toFixed(6);
    });
  }

  async function handleAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthStatus("loading");
    setAuthMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = (formData.get("full_name") as string) || "";

    try {
      const endpoint = authTab === "signup" ? "/api/auth/signup" : "/api/auth/session-login";
      const body =
        authTab === "signup"
          ? { email, password, full_name: fullName }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        needs_confirmation?: boolean;
      };

      if (!res.ok) throw new Error(data.error ?? "auth failed");

      if (data.needs_confirmation) {
        setAuthStatus("error");
        setAuthMessage(labels.authConfirmEmail);
        return;
      }

      setAuthStatus("idle");
      await loadSession();
    } catch (err) {
      setAuthStatus("error");
      setAuthMessage(
        err instanceof Error ? err.message : labels.authError
      );
    }
  }

  async function handleCenterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitStatus("loading");
    setSubmitMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      registration_type: mode,
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      latitude: formData.get("latitude") as string,
      longitude: formData.get("longitude") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      schedule: (formData.get("schedule") as string) || null,
      description: (formData.get("description") as string) || null,
      accepts: selectedAccepts,
      reporter_name:
        mode === "third_party" ? ((formData.get("reporter_name") as string) || null) : null,
      reporter_phone:
        mode === "third_party" ? ((formData.get("reporter_phone") as string) || null) : null,
    };

    try {
      const res = await fetch("/api/help-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; message?: string };

      if (res.status === 401) {
        setSubmitStatus("error");
        setSubmitMessage(data.message ?? labels.authRequired);
        setSessionEmail(null);
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "submit failed");

      setSubmitStatus("success");
      setSubmitMessage(
        mode === "own" ? labels.successOwn : labels.successThirdParty
      );
      form.reset();
      setSelectedAccepts(["water", "food"]);

      if (mode === "own") {
        window.setTimeout(() => {
          window.location.href = panelPath;
        }, 1200);
      }
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(
        err instanceof Error ? err.message : labels.submitError
      );
    }
  }

  const needsAuth = mode === "own" && !sessionLoading && !sessionEmail;

  if (mode === "own" && sessionLoading) {
    return (
      <div className="card max-w-lg text-sm text-ink-secondary">
        {labels.submitting}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={`card text-left transition-colors ${
            mode === "own" ? "ring-2 ring-accent border-accent/40" : "hover:border-accent/30"
          }`}
          onClick={() => setMode("own")}
        >
          <p className="font-semibold text-ink">{labels.modeOwnTitle}</p>
          <p className="mt-2 text-sm text-ink-secondary">{labels.modeOwnDesc}</p>
        </button>
        <button
          type="button"
          className={`card text-left transition-colors ${
            mode === "third_party"
              ? "ring-2 ring-accent border-accent/40"
              : "hover:border-accent/30"
          }`}
          onClick={() => setMode("third_party")}
        >
          <p className="font-semibold text-ink">{labels.modeThirdTitle}</p>
          <p className="mt-2 text-sm text-ink-secondary">{labels.modeThirdDesc}</p>
        </button>
      </div>

      {mode === "own" && (
        <div className="rounded-2xl border border-accent/20 bg-accent-muted/40 p-4 text-sm text-ink-secondary">
          {labels.modeOwnNotice}
        </div>
      )}

      {needsAuth ? (
        <div className="card space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">{labels.authTitle}</h2>
            <p className="mt-1 text-sm text-ink-secondary">{labels.authSubtitle}</p>
          </div>

          <div className="flex gap-2 border-b border-border">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                authTab === "signup"
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-secondary"
              }`}
              onClick={() => setAuthTab("signup")}
            >
              {labels.signupTab}
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                authTab === "login"
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-secondary"
              }`}
              onClick={() => setAuthTab("login")}
            >
              {labels.loginTab}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authTab === "signup" && (
              <div>
                <label className="label" htmlFor="full_name">
                  {labels.fullName}
                </label>
                <input className="input" id="full_name" name="full_name" required />
              </div>
            )}
            <div>
              <label className="label" htmlFor="auth-email">
                {labels.email}
              </label>
              <input
                className="input"
                id="auth-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="auth-password">
                {labels.password}
              </label>
              <input
                className="input"
                id="auth-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={authTab === "signup" ? "new-password" : "current-password"}
              />
            </div>
            {authMessage && (
              <p className="text-sm text-emergency">{authMessage}</p>
            )}
            <button type="submit" className="btn-primary" disabled={authStatus === "loading"}>
              {authStatus === "loading"
                ? labels.submitting
                : authTab === "signup"
                  ? labels.signupTab
                  : labels.loginTab}
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleCenterSubmit} className="card space-y-5">
          {mode === "own" && sessionEmail && (
            <div className="rounded-xl border border-success/30 bg-success-muted p-4 text-sm text-success">
              {labels.loggedInAs} <strong>{sessionEmail}</strong>
            </div>
          )}

          {mode === "third_party" && (
            <div className="rounded-xl border border-warning/30 bg-warning-muted p-4 text-sm text-warning">
              {labels.thirdPartyNotice}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="hc-name">
                {labels.centerName}
              </label>
              <input className="input" id="hc-name" name="name" required />
            </div>
            <div>
              <label className="label" htmlFor="hc-type">
                {labels.centerType}
              </label>
              <select className="input" id="hc-type" name="type" required defaultValue="community">
                {CENTER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type] ?? type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="hc-schedule">
                {labels.schedule}
              </label>
              <input className="input" id="hc-schedule" name="schedule" placeholder={labels.scheduleHint} />
            </div>
            <div>
              <label className="label" htmlFor="hc-state">
                {labels.state}
              </label>
              <select className="input" id="hc-state" name="state" required>
                <option value="">{labels.state}</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="hc-city">
                {labels.city}
              </label>
              <input className="input" id="hc-city" name="city" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="hc-address">
                {labels.address}
              </label>
              <input className="input" id="hc-address" name="address" required />
            </div>
            <div>
              <label className="label" htmlFor="hc-latitude">
                {labels.latitude}
              </label>
              <input className="input" id="hc-latitude" name="latitude" required />
            </div>
            <div>
              <label className="label" htmlFor="hc-longitude">
                {labels.longitude}
              </label>
              <input className="input" id="hc-longitude" name="longitude" required />
            </div>
            <div className="sm:col-span-2">
              <button type="button" className="btn-secondary text-xs" onClick={useMyLocation}>
                {labels.useLocation}
              </button>
            </div>
            <div>
              <label className="label" htmlFor="hc-phone">
                {labels.phone}
              </label>
              <input className="input" id="hc-phone" name="phone" type="tel" />
            </div>
            <div>
              <label className="label" htmlFor="hc-email">
                {labels.email}
              </label>
              <input className="input" id="hc-email" name="email" type="email" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="hc-description">
                {labels.description}
              </label>
              <textarea className="input min-h-[100px]" id="hc-description" name="description" />
            </div>
          </div>

          <div>
            <p className="label">{labels.accepts}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCEPT_KEYS.map((key) => (
                <label
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAccepts.includes(key)}
                    onChange={() => toggleAccept(key)}
                  />
                  {acceptLabels[key] ?? key}
                </label>
              ))}
            </div>
          </div>

          {mode === "third_party" && (
            <div className="grid gap-5 sm:grid-cols-2 border-t border-border pt-5">
              <div>
                <label className="label" htmlFor="hc-reporter-name">
                  {labels.reporterName}
                </label>
                <input className="input" id="hc-reporter-name" name="reporter_name" required />
              </div>
              <div>
                <label className="label" htmlFor="hc-reporter-phone">
                  {labels.reporterPhone}
                </label>
                <input className="input" id="hc-reporter-phone" name="reporter_phone" type="tel" />
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm text-ink-secondary">
            <input type="checkbox" required className="mt-1 rounded" />
            {labels.consent}
          </label>

          {submitMessage && (
            <div
              className={`rounded-xl p-4 text-sm ${
                submitStatus === "success"
                  ? "bg-success-muted text-success"
                  : "bg-emergency-muted text-emergency"
              }`}
            >
              {submitMessage}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={submitStatus === "loading"}>
            {submitStatus === "loading" ? labels.submitting : labels.submit}
          </button>
        </form>
      )}
    </div>
  );
}
