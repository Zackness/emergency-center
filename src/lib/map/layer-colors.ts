import type { UnifiedMapLayer } from "@/types/map";

export const LAYER_COLORS: Record<UnifiedMapLayer, string> = {
  help_center: "#ea580c",
  hospital: "#2563eb",
  shelter: "#16a34a",
  damage: "#f59e0b",
  quake: "#7c3aed",
  redayuda: "#0ea5e9",
  platform: "#db2777",
  children: "#e11d48",
};

export const DAMAGE_COLORS: Record<string, string> = {
  collapsed: "#dc2626",
  damaged: "#f59e0b",
  evacuated: "#eab308",
};
