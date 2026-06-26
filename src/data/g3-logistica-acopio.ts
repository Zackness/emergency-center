import type { HelpCenter } from "@/types";

export const G3_LOGISTICA_SOURCE = "https://www.instagram.com/rdelbufalo/";

const G3_SCHEDULE = "Lun–Vie 9:00–12:00 y 14:00–15:30";

const G3_DESC =
  "Centro de acopio G3 Logística habilitado para recibir insumos, materiales y donaciones tras la emergencia del 24 de junio de 2026. Fuente: @rdelbufalo.";

const ACCEPTS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

const TIMESTAMP = "2026-06-25T16:00:00Z";

const SITES = [
  {
    id: "92",
    city: "Caracas",
    state: "Distrito Capital",
    address:
      "Av. Principal de Los Cortijos de Lourdes, Edificio Maploca, Los Cortijos de Lourdes",
    latitude: 10.488,
    longitude: -66.868,
  },
  {
    id: "93",
    city: "Valencia",
    state: "Carabobo",
    address:
      "Calle La Pedrera, Fundo Los Marines, Lote S/N, Zona Industrial San Diego",
    latitude: 10.209,
    longitude: -67.964,
  },
  {
    id: "94",
    city: "Barquisimeto",
    state: "Lara",
    address:
      "Zona Industrial II, Av. Principal con Calle 6, Locales 110-111-112, Municipio Iribarren",
    latitude: 10.065,
    longitude: -69.332,
  },
] as const;

export const G3_LOGISTICA_ACOPIO_CENTERS: HelpCenter[] = SITES.map((site) => ({
  id: site.id,
  name: `G3 Logística ${site.city} — Centro de acopio`,
  description: G3_DESC,
  type: "community" as const,
  state: site.state,
  city: site.city,
  address: site.address,
  latitude: site.latitude,
  longitude: site.longitude,
  phone: null,
  email: null,
  schedule: G3_SCHEDULE,
  accepts: [...ACCEPTS],
  image_url: null,
  image_urls: [],
  is_verified: true,
  is_active: true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
}));

/** Dirección ampliada de Cáritas Montalbán según afiche @rdelbufalo. */
export const CARITAS_MONTALBAN_RDELBUFALO = {
  name: "Cáritas Venezuela — Sede Montalbán",
  address:
    "Av. Teherán, a 200 m de la UCAB, frente a Urb. Juan Pablo II. Sede de la Conferencia Episcopal Venezolana, Montalbán, Caracas",
  latitude: 10.4961,
  longitude: -66.8983,
  schedule: "Confirmar horario en sitio — campaña de emergencia activa",
  description:
    "Centro de acopio de Cáritas de Venezuela y la Conferencia Episcopal Venezolana. Recibe insumos, materiales y donaciones para familias afectadas. Actualizaciones: @caritasdevzla. Fuente adicional: @rdelbufalo.",
};
