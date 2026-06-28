import type { DamageSeverity, OperationalStatus } from "@/types";

export type UnifiedMapLayer =
  | "help_center"
  | "hospital"
  | "shelter"
  | "damage"
  | "quake"
  | "redayuda"
  | "platform"
  | "children";

export interface UnifiedMapMarker {
  id: string;
  layer: UnifiedMapLayer;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  severity?: DamageSeverity;
  status?: OperationalStatus;
  phone?: string | null;
  href: string;
  hrefExternal: boolean;
  hrefLabel?: string;
  secondaryHref?: string;
  secondaryHrefExternal?: boolean;
  secondaryHrefLabel?: string;
  source?: string | null;
  image_urls?: string[];
  meta?: string | null;
  priority?: boolean;
  childStatus?: "missing" | "critical" | "unidentified" | "stable" | "under_care";
}

export interface UnifiedMapCatalogResponse {
  markers: UnifiedMapMarker[];
  total: number;
  truncated: boolean;
  counts: Partial<Record<UnifiedMapLayer, number>>;
  redAyudaStats?: {
    desaparecidos: number;
    salvo: number;
    puntos: number;
    hospital: number;
    ninos: number;
    denuncias: number;
    atrapados: number;
    danos: number;
  } | null;
}

export type UnifiedMapLayerFilter = UnifiedMapLayer | "all";
