import { useRef, useState } from "react";

interface ImageUploadFieldProps {
  id: string;
  name: string;
  label: string;
  hint?: string;
  folder: "missing-persons" | "damage-reports" | "help-centers" | "media";
  locale: "es" | "en";
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUploadField({
  id,
  name,
  label,
  hint,
  folder,
  locale,
  value,
  onChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url ?? null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : locale === "es"
            ? "No se pudo subir la imagen"
            : "Could not upload image"
      );
      onChange(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {hint && <p className="text-xs text-ink-muted mb-2">{hint}</p>}

      <input type="hidden" name={name} value={value ?? ""} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="input w-full sm:max-w-xs"
          disabled={uploading}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        {uploading && (
          <span className="text-sm text-ink-secondary">
            {locale === "es" ? "Subiendo…" : "Uploading…"}
          </span>
        )}
        {value && (
          <button
            type="button"
            className="text-sm text-ink-muted hover:text-emergency"
            onClick={() => onChange(null)}
          >
            {locale === "es" ? "Quitar" : "Remove"}
          </button>
        )}
      </div>

      {value && (
        <img
          src={value}
          alt=""
          className="mt-3 h-24 w-24 rounded-lg object-cover border border-border"
        />
      )}

      {error && <p className="mt-2 text-sm text-emergency">{error}</p>}
    </div>
  );
}
