import { useEffect, useState } from "react";
import type { MapLocation } from "@/types";
import type { MapViewInnerProps } from "@/components/map/MapViewInner";

const RESPONSIVE_MAP_HEIGHT =
  "h-[min(70vh,680px)] min-h-[280px] sm:h-[480px] lg:h-[600px]";

export default function MapView({
  locations,
  height,
  className = "",
  locale = "es",
  zoom = 12,
  defaultCenter,
}: MapViewInnerProps) {
  const [MapInner, setMapInner] = useState<React.ComponentType<MapViewInnerProps> | null>(null);

  useEffect(() => {
    void import("@/components/map/MapViewInner").then((module) => {
      setMapInner(() => module.default);
    });
  }, []);

  const wrapperStyle = height ? { height } : undefined;
  const placeholderClass = `flex items-center justify-center rounded-2xl border border-border bg-surface-muted text-ink-secondary w-full ${
    height ? "" : RESPONSIVE_MAP_HEIGHT
  } ${className}`.trim();

  if (!MapInner) {
    return (
      <div className={placeholderClass} style={wrapperStyle}>
        {locale === "es" ? "Cargando mapa..." : "Loading map..."}
      </div>
    );
  }

  return (
    <MapInner
      locations={locations}
      height={height}
      className={className}
      locale={locale}
      zoom={zoom}
      defaultCenter={defaultCenter}
    />
  );
}
