export interface RedAyudaStats {
  salvo: number;
  atrapados: number;
  danos: number;
  voluntarios: number;
  necesidades: number;
  puntos: number;
  desaparecidos: number;
  hospital: number;
}

export interface RedAyudaOfficialStats {
  fallecidos: number | null;
  heridos: number | null;
  refugiados: number | null;
  desaparecidos: number | null;
  source: string | null;
  updated_at: string | null;
}

export interface RedAyudaQuake {
  id: string;
  mag: number;
  place: string;
  time: number;
  lat: number;
  lng: number;
}

export interface RedAyudaPhoneEntry {
  id: string;
  category: "emergency" | "ambulance" | "firefighters";
  label_es: string;
  label_en: string;
  numbers: string[];
  zone?: string;
}

export interface RedAyudaHospitalEntry {
  id: string;
  name: string;
  zone: string;
  city: string;
  state: string;
  phone: string;
}

export interface RedAyudaCommunityGuideItem {
  order: number;
  text_es: string;
  text_en: string;
}

export interface RedAyudaSnapshot {
  source: string;
  source_url: string;
  fetched_at: string;
  stats: RedAyudaStats | null;
  official: RedAyudaOfficialStats | null;
  ninos: number | null;
  denuncias: number | null;
  quakes: RedAyudaQuake[];
  hospitals: RedAyudaHospitalEntry[];
  phones: RedAyudaPhoneEntry[];
  community_guide: RedAyudaCommunityGuideItem[];
}
