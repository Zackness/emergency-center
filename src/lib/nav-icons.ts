export const NAV_ICON_PATHS: Record<string, string | string[]> = {
  home: ["m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  tent: "M3.5 21 12 3l8.5 18 M12 3v18",
  "map-pin": "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  heart:
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  newspaper:
    "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2 M18 14h-8 M15 18h-5 M10 6h8v4h-8V6Z",
  "book-open": "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  sparkles:
    "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",
  hospital: [
    "M12 6v4",
    "M15 4h-3a2 2 0 0 0-2 2v14",
    "M18 8h2a2 2 0 0 1 2 2v10",
    "M6 8H4a2 2 0 0 0-2 2v10",
    "M10 10h4",
    "M10 14h4",
    "M10 18h4",
  ],
  "alert-triangle":
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3 M12 9v4 M12 17h.01",
  building: [
    "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18",
    "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
    "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
    "M10 6h4",
    "M10 10h4",
    "M10 14h4",
    "M10 18h4",
  ],
  paw: [
    "M11.25 4.533A9.707 9.707 0 0 0 6 3a2.25 2.25 0 0 0-1.07 4.244",
    "M14.75 4.533A9.707 9.707 0 0 1 18 3a2.25 2.25 0 0 1 1.07 4.244",
    "M17.25 8.25a5.25 5.25 0 0 1-10.5 0",
    "M12 12.75a4.5 4.5 0 0 0-4.5 4.5v2.25h9v-2.25a4.5 4.5 0 0 0-4.5-4.5Z",
  ],
  briefcase: ["M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", "M2 20h20", "M6 12h12"],
  search: ["m21 21-4.3-4.3", "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"],
  "plus-circle": ["M12 8v8", "M8 12h8", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"],
  "layout-dashboard": ["M3 3h7v9H3z", "M14 3h7v5h-7z", "M14 12h7v9h-7z", "M3 16h7v5H3z"],
};

export const NAV_ICON_COLORS: Record<string, string> = {
  home: "bg-accent-muted text-accent",
  users: "bg-accent-muted text-accent",
  tent: "bg-success-muted text-success",
  "map-pin": "bg-emergency-muted text-emergency",
  heart: "bg-emergency-muted text-emergency",
  newspaper: "bg-warning-muted text-warning",
  "book-open": "bg-accent-muted text-accent",
  sparkles: "bg-warning-muted text-warning",
  hospital: "bg-accent-muted text-accent",
  "alert-triangle": "bg-emergency-muted text-emergency",
  building: "bg-surface-muted text-ink-secondary",
  paw: "bg-warning-muted text-warning",
  briefcase: "bg-success-muted text-success",
  search: "bg-accent-muted text-accent",
  "plus-circle": "bg-success-muted text-success",
  "layout-dashboard": "bg-accent-muted text-accent",
};

export function getNavIconPaths(name: string | undefined): string[] {
  const paths = NAV_ICON_PATHS[name ?? "map-pin"] ?? NAV_ICON_PATHS["map-pin"];
  return Array.isArray(paths) ? paths : [paths];
}

export function getNavIconColor(name: string | undefined): string {
  return NAV_ICON_COLORS[name ?? "map-pin"] ?? "bg-accent-muted text-accent";
}
