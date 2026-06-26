import type { HelpCenter } from "@/types";

export const CHANGAN_ACOPIO_FLYER = "/images/help-centers/changan-solidaridad-venezuela.png";

export const CHANGAN_ACOPIO_SOURCE = "https://www.instagram.com/changanvenezuela/";

const CHANGAN_ACOPIO_DESC =
  "Campaña «Unidos en solidaridad por Venezuela» de Changan Venezuela (Fundación Flor de la Esperanza). Concesionario oficial habilitado como centro de acopio. Reciben: herramientas de rescate (martillos, mandarrias, palas, picos, cinceles, seguetas), equipos de seguridad (guantes de cuero, cascos, lentes protectores, cuerdas de alta resistencia), iluminación (linternas, pilas), agua potable, alimentos no perecederos, insumos médicos y de primeros auxilios, ropa en buen estado. Fuente: @changanvenezuela.";

const ACCEPTS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

const TIMESTAMP = "2026-06-26T14:00:00Z";

interface ChanganDealer {
  id: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  instagram?: string;
}

const DEALERS: ChanganDealer[] = [
  {
    id: "48",
    city: "Caracas",
    state: "Miranda",
    address: "Av. Francisco de Miranda, Los Palos Grandes (Chacao), local PB",
    latitude: 10.4965,
    longitude: -66.8485,
    phone: "+58 412-6028930",
    instagram: "@changanccs",
  },
  {
    id: "49",
    city: "Valencia",
    state: "Carabobo",
    address:
      "Av. 71, Parque Comercio Industrial Castillito, parcela CMV-35, San Diego, Valencia",
    latitude: 10.2092,
    longitude: -67.9641,
    phone: "+58 414-5177023",
    instagram: "@changanvalencia",
  },
  {
    id: "50",
    city: "Barquisimeto",
    state: "Lara",
    address: "Av. Bracamonte entre Av. Libertador y Av. Venezuela, zona este",
    latitude: 10.0652,
    longitude: -69.3054,
    phone: "+58 424-5918648",
    instagram: "@changanbarquisimeto",
  },
  {
    id: "51",
    city: "Maracaibo",
    state: "Zulia",
    address: "Calle 20 entre Av. 15 y 15A-1, local Millennium, sector Canchancha",
    latitude: 10.6643,
    longitude: -71.6264,
    phone: "+58 414-7429822",
    instagram: "@changanmaracaibo",
  },
  {
    id: "52",
    city: "Maracay",
    state: "Aragua",
    address: "Av. Bolívar c/c Av. Primera Norte Sur, Urb. San Jacinto, parcelas A1 y A2",
    latitude: 10.2468,
    longitude: -67.5951,
    phone: "+58 424-3776994",
    instagram: "@changanmaracay",
  },
  {
    id: "53",
    city: "Acarigua",
    state: "Portuguesa",
    address: "Av. Trino Melean, galpones Sumarca Nº 34, zona centro, Araure",
    latitude: 9.5642,
    longitude: -69.2081,
    phone: "+58 412-2011745",
    instagram: "@changanacarigua",
  },
  {
    id: "54",
    city: "Barinas",
    state: "Barinas",
    address: "Av. Los Andes, Edif. Hobby Piso 1, Hong Kong Motor's, Urb. Alto Barinas",
    latitude: 8.6224,
    longitude: -70.2071,
    phone: "+58 414-3734343",
    instagram: "@changanbarinas",
  },
  {
    id: "55",
    city: "San Cristóbal",
    state: "Táchira",
    address: "Av. 8 con Calle 8, Edif. Alconsa PB, sector La Concordia",
    latitude: 7.7694,
    longitude: -72.2252,
    phone: "+58 412-9136819",
    instagram: "@changansancristobal",
  },
  {
    id: "56",
    city: "Coro",
    state: "Falcón",
    address:
      "Av. Prolongación Manaure esq. Av. Tirso Salavarria, Edif. Automotores Coro, Piso 1, sector San Antonio",
    latitude: 11.4052,
    longitude: -69.6814,
    phone: "+58 414-3972319",
    instagram: "@changanfalcon",
  },
  {
    id: "57",
    city: "El Vigía",
    state: "Mérida",
    address: "Av. Bolívar, antiguo local Automotriz PB, sector Sur América",
    latitude: 8.6131,
    longitude: -71.6573,
    phone: "+58 424-7578733",
    instagram: "@changanelvigia",
  },
  {
    id: "58",
    city: "El Tigre",
    state: "Anzoátegui",
    address: "Av. Intercomunal Tigre–El Tigrito, Edif. Elite PB, San José de Guanipa",
    latitude: 8.8893,
    longitude: -64.2451,
    phone: "+58 414-8177199",
    instagram: "@changaneltigrito",
  },
  {
    id: "59",
    city: "Puerto La Cruz",
    state: "Anzoátegui",
    address: "Av. Alberto Ravell, local Fuerza Trucks, sector Paseo Colón",
    latitude: 10.2105,
    longitude: -64.6322,
    phone: "+58 424-5510580",
    instagram: "@changanptolacruz",
  },
  {
    id: "60",
    city: "Maturín",
    state: "Monagas",
    address: "Av. Alirio Ugarte Pelayo, Edif. Changan PB local 2, sector Tipuro",
    latitude: 9.7451,
    longitude: -63.1832,
    phone: null,
    instagram: "@changanmaturin",
  },
  {
    id: "61",
    city: "Puerto Ordaz",
    state: "Bolívar",
    address: "Calle Tucupita, Edif. Tomasi Hermanos PB, sector Castillito",
    latitude: 8.2895,
    longitude: -62.7371,
    phone: null,
    instagram: "@changanpuertoordaz",
  },
  {
    id: "62",
    city: "San Juan de los Morros",
    state: "Guárico",
    address: "Estacionamiento Traki, San Juan de los Morros (concesionario Changan Guárico)",
    latitude: 9.9112,
    longitude: -67.3543,
    phone: null,
    instagram: "@changanguarico",
  },
];

export const CHANGAN_ACOPIO_CENTERS: HelpCenter[] = DEALERS.map((dealer) => ({
  id: dealer.id,
  name: `Changan ${dealer.city} — Centro de acopio`,
  description: `${CHANGAN_ACOPIO_DESC}${dealer.instagram ? ` Instagram: ${dealer.instagram}.` : ""} Red nacional: changanvzla.com/concesionarios`,
  type: "community",
  state: dealer.state,
  city: dealer.city,
  address: dealer.address,
  latitude: dealer.latitude,
  longitude: dealer.longitude,
  phone: dealer.phone,
  email: "informacion@changanvzla.com",
  schedule: "Horario del concesionario — confirmar en sitio",
  accepts: [...ACCEPTS],
  image_url: CHANGAN_ACOPIO_FLYER,
  image_urls: [CHANGAN_ACOPIO_FLYER],
  is_verified: true,
  is_active: true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
}));
