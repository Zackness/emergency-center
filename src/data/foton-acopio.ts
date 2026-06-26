import type { HelpCenter } from "@/types";

export const FOTON_ACOPIO_SOURCE = "https://fotonvzla.com/concesionarios/";

const FOTON_ACOPIO_DESC =
  "Concesionario y showroom oficial FOTON Venezuela habilitado como centro de acopio tras el terremoto del 24 de junio de 2026. Reciben donaciones para familias afectadas: agua potable, alimentos no perecederos, insumos médicos y de primeros auxilios, ropa en buen estado, artículos de higiene y material de rescate. Red nacional: fotonvzla.com/concesionarios — @fotonvzla.";

const ACCEPTS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

const TIMESTAMP = "2026-06-26T18:00:00Z";

interface FotonDealer {
  id: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email?: string;
  instagram?: string;
  operator?: string;
}

const DEALERS: FotonDealer[] = [
  {
    id: "63",
    city: "Acarigua",
    state: "Portuguesa",
    address: "Av. Trino Melean, galpones Sumarca Nº 34, zona centro, Araure",
    latitude: 9.5642,
    longitude: -69.2081,
    phone: "+58 414-5021736",
    email: "ventasllanocamiones@gmail.com",
    operator: "Llano Camiones, C.A.",
  },
  {
    id: "64",
    city: "Cagua",
    state: "Aragua",
    address: "Carretera Nacional Cagua–La Villa, al lado del INTT, Cagua",
    latitude: 10.1856,
    longitude: -67.4597,
    phone: "+58 424-3433958",
    email: "gteventascagua@tractocamionesmaracay.com",
    instagram: "@fotonmaracay",
    operator: "Tracto Camiones Maracay, C.A.",
  },
  {
    id: "65",
    city: "El Tigrito",
    state: "Anzoátegui",
    address:
      "Av. Intercomunal Tigre–El Tigrito, Edif. Elite Trucks, sector centro, San José de Guanipa",
    latitude: 8.8893,
    longitude: -64.2451,
    phone: "+58 424-1200447",
    email: "ventas1@elitetrucksca.com",
    operator: "Elite Truck, C.A.",
  },
  {
    id: "66",
    city: "San Cristóbal",
    state: "Táchira",
    address: "Av. 8 con Calle 8, Edif. Alconsa PB, Oficina 1, sector La Concordia",
    latitude: 7.7694,
    longitude: -72.2252,
    phone: "+58 412-9136819",
    email: "gerenciafotontachira@gmail.com",
    operator: "Foton Táchira C.A.",
  },
  {
    id: "67",
    city: "Barquisimeto",
    state: "Lara",
    address: "Final de la Av. Lara, al lado de Pollos Arturo (Showroom Bqto)",
    latitude: 10.062,
    longitude: -69.318,
    phone: "+58 424-5970007",
    email: "ventas2@fotonyaritagua.com",
    operator: "Inversiones Inter Mundial 2020, C.A.",
  },
  {
    id: "68",
    city: "Valencia",
    state: "Carabobo",
    address:
      "Final Prolongación Av. Lisandro Alvarado, vía de Servicio, sector La Guacamaya",
    latitude: 10.2186,
    longitude: -68.0065,
    phone: "+58 414-0424177",
    operator: "Jinhua Motors, C.A.",
  },
  {
    id: "69",
    city: "Puerto La Cruz",
    state: "Anzoátegui",
    address: "Av. Alberto Ravell, local Fuerza Trucks, sector Paseo Colón",
    latitude: 10.2105,
    longitude: -64.6322,
    phone: "+58 424-5852367",
    email: "ventas@metrocamion.com",
    operator: "Metrocamión, C.A.",
  },
  {
    id: "70",
    city: "Porlamar",
    state: "Nueva Esparta",
    address: "Av. Juan Bautista Arismendi, sector Macho Muerto, Porlamar (taller autorizado)",
    latitude: 10.9577,
    longitude: -63.8697,
    phone: "+58 412-3530137",
    operator: "Automotriz Vázquez, C.A.",
  },
  {
    id: "71",
    city: "Guarenas",
    state: "Miranda",
    address: "Av. Intercomunal Guarenas–Guatire, frente a la Villa Panamericana, Guarenas",
    latitude: 10.4686,
    longitude: -66.5427,
    phone: "+58 424-5852367",
    email: "ventas@fotoncaracas.com",
    operator: "Metrocamión, C.A.",
  },
  {
    id: "72",
    city: "El Vigía",
    state: "Mérida",
    address: "Ctra. vía Mérida, Edif. Industrial Vigía PB, sector Buenos Aires",
    latitude: 8.6131,
    longitude: -71.6573,
    phone: "+58 424-7458389",
    email: "emolinafotonelvigia@gmail.com",
    operator: "Autocamiones Chama, C.A.",
  },
  {
    id: "73",
    city: "Maracaibo",
    state: "Zulia",
    address: "Av. 68 con calle 148, Zona Industrial de Maracaibo",
    latitude: 10.65,
    longitude: -71.63,
    phone: "+58 424-6256361",
    email: "asesor.comercial@autototalca.com",
    operator: "Auto Total, C.A.",
  },
  {
    id: "74",
    city: "Maracay",
    state: "Aragua",
    address: "Urb. San Jacinto, Av. Bolívar Nro. A-1 y A-2, frente al Parque de Ferias",
    latitude: 10.2468,
    longitude: -67.5951,
    phone: "+58 424-3433958",
    email: "gteventasmaracay@tractocamionesmaracay.com",
    instagram: "@fotonmaracay",
    operator: "Tracto Camiones Maracay, C.A.",
  },
  {
    id: "75",
    city: "Maturín",
    state: "Monagas",
    address: "Av. Alirio Ugarte Pelayo, Edif. Changan PB local 2, sector Tipuro",
    latitude: 9.7451,
    longitude: -63.1832,
    phone: "+58 424-8764969",
    email: "ventas1@monagastrucks.com",
    operator: "Monagas Trucks C.A.",
  },
  {
    id: "76",
    city: "Caracas",
    state: "Distrito Capital",
    address: "Av. Teresa de la Parra, local C PB, Urb. Santa Mónica (Showroom)",
    latitude: 10.4892,
    longitude: -66.8578,
    phone: "+58 414-3520283",
    operator: "Metrocamión, C.A.",
  },
  {
    id: "77",
    city: "Yaritagua",
    state: "Yaracuy",
    address:
      "Av. Cimarrón Andresote, Parque Industrial del Este parcela 53, sector Pueblo Nuevo",
    latitude: 10.0746,
    longitude: -68.6974,
    phone: "+58 424-5970007",
    email: "info@fotonyaritagua.com",
    operator: "Inversiones Inter Mundial 2020, C.A.",
  },
];

export const FOTON_ACOPIO_CENTERS: HelpCenter[] = DEALERS.map((dealer) => ({
  id: dealer.id,
  name: `FOTON ${dealer.city} — Centro de acopio`,
  description: [
    FOTON_ACOPIO_DESC,
    dealer.operator ? `Operador: ${dealer.operator}.` : null,
    dealer.instagram ? `Instagram: ${dealer.instagram}.` : null,
  ]
    .filter(Boolean)
    .join(" "),
  type: "community",
  state: dealer.state,
  city: dealer.city,
  address: dealer.address,
  latitude: dealer.latitude,
  longitude: dealer.longitude,
  phone: dealer.phone,
  email: dealer.email ?? null,
  schedule: "Horario del concesionario — confirmar en sitio",
  accepts: [...ACCEPTS],
  image_url: null,
  image_urls: [],
  is_verified: true,
  is_active: true,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
}));
