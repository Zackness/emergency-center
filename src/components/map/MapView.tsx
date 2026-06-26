import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapLocation } from "@/types";
import { dedupeUrlList } from "@/lib/damage-map/normalize";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DAMAGE_COLORS: Record<string, string> = {
  collapsed: "#dc2626",
  damaged: "#f59e0b",
  evacuated: "#eab308",
};

function damageIcon(severity?: string, priority?: boolean) {
  const color = DAMAGE_COLORS[severity ?? "damaged"] ?? DAMAGE_COLORS.damaged;
  const size = priority ? 22 : 18;
  const border = priority ? "4px solid #fef2f2" : "3px solid #fff";
  const ring = priority ? "0 0 0 2px #dc2626" : "0 1px 4px rgba(0,0,0,0.4)";
  return L.divIcon({
    className: "damage-marker",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};box-shadow:${ring};"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -10],
  });
}

function iconForLocation(loc: MapLocation) {
  if (loc.type === "damage") {
    return damageIcon(loc.severity, loc.id.startsWith("priority-"));
  }
  return defaultIcon;
}

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

function FitToMarkers({
  locations,
  fallbackCenter,
  fallbackZoom,
}: {
  locations: MapLocation[];
  fallbackCenter: [number, number];
  fallbackZoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    const validLocations = locations.filter((loc) =>
      isValidCoordinate(loc.latitude, loc.longitude)
    );

    if (validLocations.length === 0) {
      map.setView(fallbackCenter, fallbackZoom);
      return;
    }

    if (validLocations.length === 1) {
      map.setView([validLocations[0].latitude, validLocations[0].longitude], 14);
      return;
    }

    try {
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.latitude, loc.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    } catch {
      map.setView(fallbackCenter, fallbackZoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, map]);

  return null;
}

/** Habilita zoom con rueda/trackpad y gestos táctiles en todos los mapas. */
function MapGestures() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.style.touchAction = "none";

    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    return () => {
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.dragging.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    };
  }, [map]);

  return null;
}

interface MapViewProps {
  locations: MapLocation[];
  height?: string;
  className?: string;
  locale?: "es" | "en";
  zoom?: number;
  defaultCenter?: [number, number];
}

const RESPONSIVE_MAP_HEIGHT =
  "h-[min(50vh,520px)] min-h-[220px] sm:h-[400px] lg:h-[480px]";

export default function MapView({
  locations,
  height,
  className = "",
  locale = "es",
  zoom = 12,
  defaultCenter,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const validLocations = useMemo(
    () =>
      locations.filter((loc) => isValidCoordinate(loc.latitude, loc.longitude)),
    [locations]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const showPlaceholder = !mounted || (validLocations.length === 0 && !defaultCenter);

  const wrapperClass = `overflow-hidden rounded-2xl border border-border shadow-soft w-full ${
    height ? "" : RESPONSIVE_MAP_HEIGHT
  } ${className}`.trim();
  const wrapperStyle = height ? { height } : undefined;

  if (showPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-border bg-surface-muted text-ink-secondary w-full ${
          height ? "" : RESPONSIVE_MAP_HEIGHT
        } ${className}`.trim()}
        style={wrapperStyle}
      >
        {locale === "es" ? "Cargando mapa..." : "Loading map..."}
      </div>
    );
  }

  const fallbackCenter: [number, number] =
    validLocations.length > 0
      ? [
          validLocations.reduce((sum, l) => sum + l.latitude, 0) / validLocations.length,
          validLocations.reduce((sum, l) => sum + l.longitude, 0) / validLocations.length,
        ]
      : (defaultCenter as [number, number]);

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <MapContainer
        center={fallbackCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        touchZoom
        dragging
        doubleClickZoom
        boxZoom
        keyboard
        zoomSnap={0.5}
        zoomDelta={1}
      >
        <MapGestures />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers
          locations={validLocations}
          fallbackCenter={fallbackCenter}
          fallbackZoom={zoom}
        />
        {validLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={iconForLocation(loc)}
          >
            <Popup>
              <strong>{loc.name}</strong>
              {loc.address && <p className="text-sm mt-1">{loc.address}</p>}
              {loc.type === "damage" && loc.image_urls && loc.image_urls.length > 0 && (
                <div className="mt-2 flex max-w-[220px] gap-1.5 overflow-x-auto">
                  {dedupeUrlList(loc.image_urls).map((src, index) => (
                    <a
                      key={`${src}-${index}`}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-16 w-20 rounded-md object-cover"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
