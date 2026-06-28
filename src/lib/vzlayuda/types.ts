export type VzlaAyudaTipo = "oferta" | "solicitud";

export interface VzlaAyudaAviso {
  id: string;
  tipo: VzlaAyudaTipo;
  categoria: string | null;
  titulo: string;
  descripcion: string | null;
  estado: string | null;
  ciudad: string | null;
  zona: string | null;
  nombre: string | null;
  creado_en: string | null;
  confirmado_en: string | null;
  expira_en: string | null;
}

export interface VzlaAyudaSnapshot {
  source: string;
  source_url: string;
  fetched_at: string;
  counts: {
    oferta: number;
    solicitud: number;
    total: number;
  };
  avisos: VzlaAyudaAviso[];
}

export const VZLAYUDA_CATEGORIES = [
  "estructural",
  "salud",
  "transporte",
  "oficios",
  "alimentos",
  "alojamiento",
  "negocio",
  "exterior",
  "mascotas",
  "comunicacion",
  "materiales",
] as const;

export type VzlaAyudaCategory = (typeof VZLAYUDA_CATEGORIES)[number];
