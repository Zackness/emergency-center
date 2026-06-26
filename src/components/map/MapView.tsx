import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapLocation } from "@/types";

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

function damageIcon(severity?: string) {
  const color = DAMAGE_COLORS[severity ?? "damaged"] ?? DAMAGE_COLORS.damaged;
  return L.divIcon({
    className: "damage-marker",
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function iconForLocation(loc: MapLocation) {
  if (loc.type === "damage") return damageIcon(loc.severity);
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

interface MapViewProps {
  locations: MapLocation[];
  height?: string;
  locale?: "es" | "en";
  zoom?: number;
  defaultCenter?: [number, number];
}

export default function MapView({
  locations,
  height = "400px",
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

  if (showPlaceholder) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-border bg-surface-muted text-ink-secondary"
        style={{ height }}
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
    <div className="overflow-hidden rounded-2xl border border-border shadow-soft" style={{ height }}>
      <MapContainer
        center={fallbackCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
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
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
