export interface YummyDamageReport {
  id: string;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  state: string | null;
  severity: string | null;
  status: string | null;
  description: string | null;
  ticket: string | null;
  photoCount: number | null;
  createdAt: string | null;
  peopleAtRisk?: boolean | null;
}

export interface YummyHelpCenter {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  lat: number;
  lng: number;
  additionalInfo: string | null;
  status: string | null;
  createdAt: string | null;
}

export interface YummySosSnapshot {
  source: "https://sos.yummyrides.com";
  fetched_at: string;
  stats: {
    report_count: number | null;
    acopio_count: number | null;
    reports_in_snapshot: number;
    centers_in_snapshot: number;
  };
  damage_reports: YummyDamageReport[];
  help_centers: YummyHelpCenter[];
}

export const YUMMY_SOS_EXTERNAL_SOURCE = "yummyrides-sos";
export const YUMMY_SOS_SOURCE_URL = "https://sos.yummyrides.com";
