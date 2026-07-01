export type DonarSeguroCategory = "dinero" | "voluntariado" | "insumos";

export interface DonarSeguroOrganization {
  slug: string;
  category: DonarSeguroCategory;
  name: string;
  org_type: string | null;
  verdict: string | null;
  themes: string[];
  donate_url: string | null;
  verification_urls: string[];
  source_url: string;
  locale: "es" | "en";
}

export interface DonarSeguroSnapshot {
  source: "https://donarseguro.com";
  fetched_at: string;
  count: number;
  organizations: DonarSeguroOrganization[];
}

export const DONARSEGURO_SOURCE_URL = "https://donarseguro.com";
