import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { UnifiedMapMarker } from "@/types/map";
import { dedupeUrlList } from "@/lib/damage-map/normalize";
import { DAMAGE_COLORS, LAYER_COLORS } from "@/lib/map/layer-colors";

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0 &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function markerIcon(marker: UnifiedMapMarker) {
  if (marker.layer === "damage") {
    const color = DAMAGE_COLORS[marker.severity ?? "damaged"] ?? DAMAGE_COLORS.damaged;
    const size = marker.priority ? 22 : 16;
    const border = marker.priority ? "4px solid #fef2f2" : "3px solid #fff";
    const ring = marker.priority ? "0 0 0 2px #dc2626" : "0 1px 3px rgba(0,0,0,0.35)";
    return L.divIcon({
      className: "unified-map-marker",
      html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};box-shadow:${ring};"></span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -10],
    });
  }

  if (marker.layer === "quake") {
    const mag = Number.parseFloat(marker.name.replace(/^M([\d.]+).*/, "$1")) || 4;
    const size = Math.min(28, 14 + mag);
    return L.divIcon({
      className: "unified-map-marker",
      html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:#7c3aed;color:#fff;font-size:10px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);">${mag.toFixed(1)}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -10],
    });
  }

  if (marker.layer === "children") {
    const statusColors: Record<string, string> = {
      missing: "#7f1d1d",
      critical: "#dc2626",
      unidentified: "#d97706",
      stable: "#16a34a",
      under_care: LAYER_COLORS.children,
    };
    const statusIcons: Record<string, string> = {
      missing: "?",
      critical: "!",
      unidentified: "·",
      stable: "✓",
      under_care: "♥",
    };
    const status = marker.childStatus ?? "under_care";
    const color = statusColors[status] ?? LAYER_COLORS.children;
    const glyph = statusIcons[status] ?? "♥";
    const size = marker.priority ? 22 : 18;
    const ring = marker.priority ? "0 0 0 2px #fef2f2" : "0 1px 4px rgba(0,0,0,0.35)";
    return L.divIcon({
      className: "unified-map-marker",
      html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};color:#fff;font-size:${status === "under_care" ? 11 : 12}px;font-weight:700;border:2px solid #fff;box-shadow:${ring};">${glyph}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -10],
    });
  }

  const color = LAYER_COLORS[marker.layer] ?? "#64748b";
  const size = marker.layer === "platform" ? 14 : 18;
  const shape = marker.layer === "platform" ? "4px" : "50%";

  return L.divIcon({
    className: "unified-map-marker",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:${shape};background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -10],
  });
}

function FitToMarkers({
  markers,
  fallbackCenter,
  fallbackZoom,
  fitKey,
}: {
  markers: UnifiedMapMarker[];
  fallbackCenter: [number, number];
  fallbackZoom: number;
  fitKey: string;
}) {
  const map = useMap();
  const lastKey = useRef("");

  useEffect(() => {
    if (lastKey.current === fitKey) return;
    lastKey.current = fitKey;

    const valid = markers.filter((m) => isValidCoordinate(m.latitude, m.longitude));
    if (valid.length === 0) {
      map.setView(fallbackCenter, fallbackZoom);
      return;
    }
    if (valid.length === 1) {
      map.setView([valid[0].latitude, valid[0].longitude], 13);
      return;
    }
    try {
      const bounds = L.latLngBounds(valid.map((m) => [m.latitude, m.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } catch {
      map.setView(fallbackCenter, fallbackZoom);
    }
  }, [markers, map, fallbackCenter, fallbackZoom, fitKey]);

  return null;
}

function MapInvalidateSize({ fitKey }: { fitKey: string }) {
  const map = useMap();

  useEffect(() => {
    const run = () => map.invalidateSize({ animate: false });
    run();
    const timer = window.setTimeout(run, 150);
    const onResize = () => run();
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [map, fitKey]);

  return null;
}

function MapGestures() {
  const map = useMap();
  useEffect(() => {
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.dragging.enable();
    return () => {
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.dragging.disable();
    };
  }, [map]);
  return null;
}

export interface UnifiedMapViewLabels {
  directions: string;
  openDetail: string;
  externalLink: string;
  source: string;
  noLocations: string;
  loading: string;
}

export interface UnifiedMapViewProps {
  markers: UnifiedMapMarker[];
  locale?: "es" | "en" | "pt" | "it";
  height?: string;
  className?: string;
  zoom?: number;
  defaultCenter?: [number, number];
  labels: UnifiedMapViewLabels;
  fitKey?: string;
  selectedId?: string | null;
  loading?: boolean;
}

const DEFAULT_CENTER: [number, number] = [10.2, -67];
const DEFAULT_ZOOM = 7;

const MAP_HEIGHT_CLASS = "h-[min(70vh,720px)] min-h-[320px]";

export default function UnifiedMapViewInner({
  markers,
  locale = "es",
  height,
  className = "",
  zoom = DEFAULT_ZOOM,
  defaultCenter = DEFAULT_CENTER,
  labels,
  fitKey = "initial",
  selectedId,
  loading = false,
}: UnifiedMapViewProps) {
  const validMarkers = useMemo(
    () => markers.filter((m) => isValidCoordinate(m.latitude, m.longitude)),
    [markers]
  );

  const wrapperClass = `overflow-hidden rounded-2xl border border-border shadow-soft w-full ${MAP_HEIGHT_CLASS} ${className}`.trim();

  if (loading && validMarkers.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border bg-surface-muted text-ink-secondary w-full ${MAP_HEIGHT_CLASS} ${className}`}
        aria-busy="true"
      >
        {labels.loading}
      </div>
    );
  }

  if (validMarkers.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border bg-surface-muted text-ink-secondary w-full ${MAP_HEIGHT_CLASS} ${className}`}
      >
        {labels.noLocations}
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={height ? { height } : undefined}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        touchZoom
        dragging
        doubleClickZoom
        boxZoom
        keyboard
        zoomSnap={0.5}
      >
        <MapGestures />
        <MapInvalidateSize fitKey={fitKey} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers
          markers={validMarkers}
          fallbackCenter={defaultCenter}
          fallbackZoom={zoom}
          fitKey={fitKey}
        />
        {validMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={markerIcon(marker)}
            eventHandlers={
              selectedId === marker.id
                ? {
                    add: (e) => {
                      window.setTimeout(() => e.target.openPopup(), 200);
                    },
                  }
                : undefined
            }
          >
            <Popup maxWidth={280} minWidth={200}>
              <div className="text-sm leading-snug">
                <p className="font-semibold text-ink pr-2">{marker.name}</p>
                {marker.meta && (
                  <p className="mt-1 inline-flex rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">
                    {marker.meta}
                  </p>
                )}
                {marker.source && (
                  <p className="mt-1 text-xs text-ink-secondary">{labels.source}: {marker.source}</p>
                )}
                {marker.address && <p className="mt-1 text-xs text-ink-secondary">{marker.address}</p>}
                {marker.description && (
                  <p className="mt-1 text-xs text-ink-secondary line-clamp-3">{marker.description}</p>
                )}
                {marker.phone && (
                  <p className="mt-1 text-xs">
                    <a href={`tel:${marker.phone.replace(/\D/g, "")}`} className="text-accent hover:underline">
                      {marker.phone}
                    </a>
                  </p>
                )}
                {marker.layer === "damage" && marker.image_urls && marker.image_urls.length > 0 && (
                  <div className="mt-2 flex max-w-[220px] gap-1 overflow-x-auto">
                    {dedupeUrlList(marker.image_urls).slice(0, 3).map((src, index) => (
                      <a key={`${src}-${index}`} href={src} target="_blank" rel="noopener noreferrer">
                        <img src={src} alt="" className="h-14 w-16 rounded object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
                {marker.layer === "children" && marker.image_urls && marker.image_urls.length > 0 && (
                  <div className="mt-2">
                    <a href={marker.image_urls[0]} target="_blank" rel="noopener noreferrer">
                      <img
                        src={marker.image_urls[0]}
                        alt=""
                        className="h-24 w-full max-w-[220px] rounded object-contain bg-surface-muted"
                        loading="lazy"
                      />
                    </a>
                  </div>
                )}
                <div className="mt-3 flex flex-col gap-1.5">
                  <a
                    href={marker.href}
                    target={marker.hrefExternal ? "_blank" : undefined}
                    rel={marker.hrefExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    {marker.hrefLabel ?? labels.openDetail}
                    {marker.hrefExternal ? " ↗" : ""}
                  </a>
                  {marker.secondaryHref && (
                    <a
                      href={marker.secondaryHref}
                      target={marker.secondaryHrefExternal ? "_blank" : undefined}
                      rel={marker.secondaryHrefExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-muted"
                    >
                      {marker.secondaryHrefLabel ?? labels.externalLink}
                      {marker.secondaryHrefExternal ? " ↗" : ""}
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline"
                  >
                    {labels.directions} →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

