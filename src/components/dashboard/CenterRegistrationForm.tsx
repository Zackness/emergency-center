import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { HelpCenterType } from "@/types";
import ImageUploadField from "@/components/forms/ImageUploadField";

const CENTER_TYPES: HelpCenterType[] = [
  "church",
  "community",
  "university",
  "government",
  "ngo",
];

import { HELP_CENTER_ACCEPT_KEYS } from "@/lib/help-centers/accepts";

export interface CenterRegistrationFormLabels {
  centerName: string;
  centerType: string;
  schedule: string;
  scheduleHint: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  useLocation: string;
  phone: string;
  email: string;
  description: string;
  photo: string;
  photoHint: string;
  photoRequired: string;
  accepts: string;
  consent: string;
  submit: string;
  submitting: string;
  successOwn: string;
  submitError: string;
  authRequired: string;
}

interface CenterRegistrationFormProps {
  locale: Locale;
  states: string[];
  typeLabels: Record<string, string>;
  acceptLabels: Record<string, string>;
  labels: CenterRegistrationFormLabels;
  onSuccess: () => void;
  compact?: boolean;
}

export default function CenterRegistrationForm({
  locale,
  states,
  typeLabels,
  acceptLabels,
  labels,
  onSuccess,
  compact = false,
}: CenterRegistrationFormProps) {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [submitMessage, setSubmitMessage] = useState("");
  const [selectedAccepts, setSelectedAccepts] = useState<string[]>(["water", "food"]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  function toggleAccept(key: string) {
    setSelectedAccepts((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latInput = document.getElementById("reg-latitude") as HTMLInputElement | null;
      const lngInput = document.getElementById("reg-longitude") as HTMLInputElement | null;
      if (latInput) latInput.value = pos.coords.latitude.toFixed(6);
      if (lngInput) lngInput.value = pos.coords.longitude.toFixed(6);
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitStatus("loading");
    setSubmitMessage("");

    if (!imageUrl) {
      setSubmitStatus("error");
      setSubmitMessage(labels.photoRequired);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      registration_type: "own" as const,
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
      image_url: imageUrl,
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
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "submit failed");

      setSubmitStatus("success");
      setSubmitMessage(labels.successOwn);
      form.reset();
      setSelectedAccepts(["water", "food"]);
      setImageUrl(null);
      window.setTimeout(onSuccess, 800);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(err instanceof Error ? err.message : labels.submitError);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "gap-5 sm:grid-cols-2"}`}>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="reg-name">
            {labels.centerName}
          </label>
          <input className="input" id="reg-name" name="name" required />
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField
            id="reg-photo"
            name="image_url"
            label={labels.photo}
            hint={labels.photoHint}
            folder="help-centers"
            locale={locale}
            value={imageUrl}
            onChange={setImageUrl}
          />
        </div>
        <div>
          <label className="label" htmlFor="reg-type">
            {labels.centerType}
          </label>
          <select className="input" id="reg-type" name="type" required defaultValue="community">
            {CENTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] ?? type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="reg-schedule">
            {labels.schedule}
          </label>
          <input
            className="input"
            id="reg-schedule"
            name="schedule"
            placeholder={labels.scheduleHint}
          />
        </div>
        <div>
          <label className="label" htmlFor="reg-state">
            {labels.state}
          </label>
          <select className="input" id="reg-state" name="state" required>
            <option value="">{labels.state}</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="reg-city">
            {labels.city}
          </label>
          <input className="input" id="reg-city" name="city" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="reg-address">
            {labels.address}
          </label>
          <input className="input" id="reg-address" name="address" required />
        </div>
        <div>
          <label className="label" htmlFor="reg-latitude">
            {labels.latitude}
          </label>
          <input className="input" id="reg-latitude" name="latitude" required />
        </div>
        <div>
          <label className="label" htmlFor="reg-longitude">
            {labels.longitude}
          </label>
          <input className="input" id="reg-longitude" name="longitude" required />
        </div>
        <div className="sm:col-span-2">
          <button type="button" className="btn-secondary text-xs" onClick={useMyLocation}>
            {labels.useLocation}
          </button>
        </div>
        <div>
          <label className="label" htmlFor="reg-phone">
            {labels.phone}
          </label>
          <input className="input" id="reg-phone" name="phone" type="tel" />
        </div>
        <div>
          <label className="label" htmlFor="reg-email">
            {labels.email}
          </label>
          <input className="input" id="reg-email" name="email" type="email" />
        </div>
        {!compact && (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="reg-description">
              {labels.description}
            </label>
            <textarea className="input min-h-[80px]" id="reg-description" name="description" />
          </div>
        )}
      </div>

      <div>
        <p className="label">{labels.accepts}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {HELP_CENTER_ACCEPT_KEYS.map((key) => (
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

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitStatus === "loading"}>
        {submitStatus === "loading" ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
