import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { dedupeUrlList } from "@/lib/damage-map/normalize";

interface DamageReportGalleryProps {
  imageUrls: string[] | null | undefined;
  title: string;
  locale: "es" | "en";
  expanded?: boolean;
  photosLabel?: string;
  variant?: "default" | "grid";
}

export default function DamageReportGallery({
  imageUrls,
  title,
  locale,
  expanded = false,
  photosLabel,
  variant = "default",
}: DamageReportGalleryProps) {
  const images = useMemo(() => dedupeUrlList(imageUrls), [imageUrls]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const countLabel =
    photosLabel?.replace("{count}", String(images.length)) ??
    (locale === "es" ? `${images.length} fotos` : `${images.length} photos`);

  const goPrev = () => setActiveIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  const goNext = () => setActiveIndex((index) => (index === images.length - 1 ? 0 : index + 1));

  if (expanded || images.length === 1) {
    return (
      <div className={variant === "grid" ? "w-full" : "w-full"}>
        <div
          className={`relative overflow-hidden bg-surface-muted ${
            variant === "grid" ? "rounded-none border-b border-border" : "rounded-xl border border-border"
          }`}
        >
          <img
            src={images[activeIndex]}
            alt={`${title} (${activeIndex + 1}/${images.length})`}
            className={
              variant === "grid"
                ? "aspect-[4/3] w-full object-cover"
                : "h-56 w-full object-cover sm:h-64"
            }
            loading="lazy"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/55 p-1.5 text-white backdrop-blur hover:bg-ink/70"
                aria-label={locale === "es" ? "Foto anterior" : "Previous photo"}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/55 p-1.5 text-white backdrop-blur hover:bg-ink/70"
                aria-label={locale === "es" ? "Foto siguiente" : "Next photo"}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="absolute bottom-2 right-2 rounded-full bg-ink/60 px-2 py-0.5 text-xs text-white">
                {activeIndex + 1}/{images.length}
              </span>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  index === activeIndex ? "border-accent" : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  className="h-14 w-20 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        <img src={images[0]} alt={title} className="h-full w-full object-cover" loading="lazy" />
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-ink/65 px-2 py-0.5 text-[10px] font-medium text-white">
            <Images className="h-3 w-3" />
            {countLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-36">
      <div className="relative overflow-hidden rounded-xl border border-border">
        <img
          src={images[0]}
          alt={title}
          className="h-28 w-full object-cover"
          loading="lazy"
        />
        {images.length > 1 && (
          <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-ink/65 px-2 py-0.5 text-[10px] font-medium text-white">
            <Images className="h-3 w-3" />
            {countLabel}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {images.slice(1, 5).map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt=""
              className="h-10 w-14 shrink-0 rounded-md border border-border object-cover"
              loading="lazy"
            />
          ))}
          {images.length > 5 && (
            <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[10px] font-medium text-ink-secondary">
              +{images.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
