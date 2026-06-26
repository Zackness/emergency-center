export interface CentroacopioDeliveryView {
  id: string;
  external_id: string;
  name: string;
  city: string;
  sector: string;
  nearby_address: string;
  transport_type: string;
  transport_label: string;
  phone: string;
  state: string;
  source: string;
  created_at: string;
}

export interface HelpCentersCatalogStats {
  centers_total: number;
  deliveries_total: number;
  centroacopio_centers: number;
  last_synced_at: string | null;
}

export interface HelpCentersCatalogQuery {
  city?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
