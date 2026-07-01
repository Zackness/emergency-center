import { SCAYTALLER_3D_DONATION } from "@/data/donation-needs";

export type SolidarityResource =
  | "water"
  | "food"
  | "fuel"
  | "transport"
  | "internet"
  | "telecom"
  | "medicine"
  | "machinery"
  | "lodging";

export interface SolidarityCompany {
  id: string;
  slug: string;
  name: string;
  resources: SolidarityResource[];
  state: string;
  city: string;
  /** Alcance geográfico en texto libre. */
  coverage: { es: string; en: string };
  description: { es: string; en: string };
  website_url?: string;
  instagram_url?: string;
  phone?: string;
  /** Fecha/hora del anuncio en redes o web (ISO 8601, UTC). */
  source_published_at?: string;
  /** Enlace a sede de acopio en /centros-ayuda#id */
  help_center_id?: string;
  is_verified: boolean;
  sort_order: number;
}

export const SOLIDARITY_COMPANIES: SolidarityCompany[] = [
  {
    id: "vamos-app",
    slug: "vamos-app",
    name: "Vamos App",
    resources: ["transport"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Nacional — encomienda y viajes con opción Donaciones",
      en: "Nationwide — delivery and rides with Donations option",
    },
    description: {
      es: "Activó viajes y encomiendas gratis para llevar donativos a centros de acopio: abre la app, selecciona la opción Donaciones y el viaje aparece con costo $0.00. Varios centros en Barquisimeto indican este servicio en sus afiches.",
      en: "Enabled free rides and deliveries to take donations to collection centers: open the app, select Donations and the trip shows $0.00. Several Barquisimeto centers mention this service on their flyers.",
    },
    website_url: "https://vamosapp.com/",
    is_verified: true,
    sort_order: 1,
  },
  {
    id: "yummy",
    slug: "yummy",
    name: "Yummy",
    resources: ["transport"],
    state: "Distrito Capital",
    city: "Caracas",
    coverage: {
      es: "Caracas — destino hospitales y clínicas",
      en: "Caracas — trips to hospitals and clinics",
    },
    description: {
      es: "Tras el terremoto del 24 de junio, anunció viajes gratuitos a hospitales y clínicas en Caracas (la app reconoce el destino como centro de salud). Eliminó el precio dinámico por alta demanda y los conductores recibieron el 100 % de las ganancias sin comisión de la plataforma.",
      en: "After the June 24 earthquake, it announced free trips to hospitals and clinics in Caracas (the app recognizes health-center destinations). Surge pricing was removed and drivers received 100% of earnings with no platform commission.",
    },
    website_url: "https://yummy.com.ve/",
    is_verified: true,
    sort_order: 2,
  },
  {
    id: "farmatodo",
    slug: "farmatodo",
    name: "Farmatodo",
    resources: ["medicine", "water", "food"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Sucursales seleccionadas a nivel nacional",
      en: "Selected branches nationwide",
    },
    description: {
      es: "Habilitó puntos de acopio en farmacias y en su centro de distribución (CENDIS, Charallave). Reciben agua potable, alimentos no perecederos, medicinas, insumos médicos y artículos de higiene. Confirma en tu sucursal o en sus redes cuáles están activas (ej. El Viñedo, Tipuro Maturín).",
      en: "Enabled collection points at pharmacies and its distribution center (CENDIS, Charallave). They accept drinking water, non-perishable food, medicine, medical supplies and hygiene items. Confirm at your branch or on their social channels which are active (e.g. El Viñedo, Tipuro Maturín).",
    },
    website_url: "https://www.farmatodo.com.ve/",
    phone: "0800-3276286",
    is_verified: true,
    sort_order: 3,
  },
  {
    id: "mercado-libre",
    slug: "mercado-libre",
    name: "Mercado Libre Venezuela",
    resources: ["food", "water", "medicine"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Nacional — tienda en línea y envíos Mercado Libre",
      en: "Nationwide — online marketplace and Mercado Libre shipping",
    },
    description: {
      es: "Habilitó el contenedor «Apoyo Venezuela» en su plataforma con publicaciones de insumos, alimentos, medicinas y artículos de primera necesidad para la emergencia sísmica. Consulta ofertas solidarias y vendedores que apoyan desde su tienda en Mercado Libre.",
      en: "Launched the «Apoyo Venezuela» hub on its platform with listings for supplies, food, medicine and essential items for the earthquake emergency. Browse solidarity offers and sellers supporting from their store on Mercado Libre.",
    },
    website_url:
      "https://listado.mercadolibre.com.ve/_Container_apoyo-venezuela-2",
    is_verified: true,
    sort_order: 3.5,
  },
  {
    id: "mundomac",
    slug: "mundomac",
    name: "MundoMac (@mundodomac_ve)",
    resources: ["internet", "telecom"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Nacional — sedes en Caracas, Lechería, Valencia, Maracay y más ciudades",
      en: "Nationwide — stores in Caracas, Lechería, Valencia, Maracay and more cities",
    },
    description: {
      es: "Centro de servicio autorizado Apple en Venezuela. Anunciaron en Instagram apoyo con señal Starlink gratuita para personas y comunidades afectadas por el terremoto del 24 de junio de 2026, facilitando conectividad donde las redes terrestres fallan. Coordinan orientación para activar el beneficio según las medidas vigentes de Starlink en zonas impactadas (incluye servicio sin costo hasta el 25 de julio para clientes elegibles, según el operador). Consulta sedes, pasos y actualizaciones en @mundodomac_ve o mundomac.com.ve.",
      en: "Apple Authorized Service Provider in Venezuela. They announced on Instagram free Starlink connectivity support for people and communities affected by the June 24, 2026 earthquake, helping where terrestrial networks fail. They guide users on activating Starlink’s earthquake benefit in impacted areas (including free service through July 25 for eligible customers, per the operator). Check locations, steps and updates on @mundodomac_ve or mundomac.com.ve.",
    },
    website_url: "https://mundomac.com.ve/",
    instagram_url: "https://www.instagram.com/mundodomac_ve/",
    source_published_at: "2026-06-30T18:00:00.000Z",
    is_verified: true,
    sort_order: 3.45,
  },
  {
    id: "movistar",
    slug: "movistar",
    name: "Movistar Venezuela",
    resources: ["telecom"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Nacional — usuarios con línea Movistar",
      en: "Nationwide — Movistar mobile subscribers",
    },
    description: {
      es: "Tras el terremoto del 24 de junio, activó entre 48 y 72 horas de señal móvil, llamadas y SMS gratis para sus usuarios, para facilitar contacto con familiares y servicios de emergencia mientras se restablecían las comunicaciones.",
      en: "After the June 24 earthquake, it enabled 48 to 72 hours of free mobile signal, voice calls and SMS for its subscribers, to help people reach family and emergency services while communications were being restored.",
    },
    website_url: "https://www.movistar.com.ve/",
    phone: "*611",
    is_verified: true,
    sort_order: 4,
  },
  {
    id: "digitel",
    slug: "digitel",
    name: "Digitel",
    resources: ["telecom"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Nacional — usuarios con línea Digitel",
      en: "Nationwide — Digitel mobile subscribers",
    },
    description: {
      es: "Ante la emergencia del sismo, ofreció entre 48 y 72 horas de señal, llamadas y mensajes de texto sin costo para sus abonados, como apoyo para mantener comunicación en zonas afectadas.",
      en: "In response to the earthquake emergency, it offered 48 to 72 hours of free signal, calls and text messages for its subscribers, to help maintain communication in affected areas.",
    },
    website_url: "https://www.digitel.com.ve/",
    phone: "*123",
    is_verified: true,
    sort_order: 5,
  },
  {
    id: "caritas-venezuela",
    slug: "caritas-venezuela",
    name: "Cáritas de Venezuela",
    resources: ["water", "food", "medicine"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Red nacional y diocesana — centros de acopio y ayuda humanitaria",
      en: "Nationwide and diocesan network — collection points and humanitarian aid",
    },
    description: {
      es: "Activó una campaña de emergencia para apoyar a las personas afectadas por los terremotos. Coordina centros de acopio nacionales y diocesanos para recibir agua potable, alimentos no perecederos, medicinas esenciales y bienes de primera necesidad. Actualizaciones oficiales en Instagram: @caritasdevzla.",
      en: "Activated an emergency campaign to support people affected by the earthquakes. Coordinates national and diocesan collection points for drinking water, non-perishable food, essential medicine and basic supplies. Official updates on Instagram: @caritasdevzla.",
    },
    website_url: "https://caritasvenezuela.org/",
    instagram_url: "https://www.instagram.com/caritasdevzla/",
    help_center_id: "1",
    is_verified: true,
    sort_order: 6,
  },
  {
    id: "academia-cecilio-acosta",
    slug: "academia-cecilio-acosta",
    name: "Academia Cecilio Acosta",
    resources: ["water", "food", "medicine"],
    state: "Lara",
    city: "Carora",
    coverage: {
      es: "Carora, municipio Torres — Lara y zonas vecinas",
      en: "Carora, Torres municipality — Lara and neighboring areas",
    },
    description: {
      es: "Institución educativa que habilitó sus instalaciones como centro de acopio tras el terremoto del 24 de junio. Recibe agua potable, alimentos no perecederos, medicinas, ropa, artículos de higiene y cobijas para familias afectadas en Lara y zonas vecinas. Horario: lun–dom 8:00–18:00.",
      en: "Educational institution that opened its facilities as a collection center after the June 24 earthquake. They accept drinking water, non-perishable food, medicine, clothing, hygiene items and blankets for families affected in Lara and neighboring areas. Hours: Mon–Sun 8:00 AM–6:00 PM.",
    },
    help_center_id: "5",
    phone: "0412-9099254",
    is_verified: true,
    sort_order: 7,
  },
  {
    id: "scaytaller",
    slug: "scaytaller",
    name: "@scaytaller",
    resources: ["medicine", "machinery"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Coordinación nacional por Instagram y teléfono",
      en: "Nationwide coordination via Instagram and phone",
    },
    description: {
      es: "Colectivo de impresión 3D que fabrica férulas para lesionados tras el terremoto. Solicitan donaciones de filamento (PLA, PETG, ABS) para seguir produciendo. Coordina entregas por Instagram @scaytaller o al teléfono indicado. También listado en «¿Qué donar?» en Centros de ayuda.",
      en: "3D printing collective manufacturing splints for injured people after the earthquake. They request filament donations (PLA, PETG, ABS) to keep producing. Coordinate delivery via Instagram @scaytaller or the phone number listed. Also under «What to donate?» in Help centers.",
    },
    instagram_url: SCAYTALLER_3D_DONATION.instagramUrl,
    phone: SCAYTALLER_3D_DONATION.phone,
    is_verified: false,
    sort_order: 8,
  },
  {
    id: "mi-odontologo-favorito",
    slug: "mi-odontologo-favorito",
    name: "Mi Odontólogo Favorito (MOF)",
    resources: ["medicine", "transport", "food", "water"],
    state: "Lara",
    city: "Barquisimeto y regiones",
    coverage: {
      es: "10 sedes en Lara, Portuguesa y otros estados — destino Tucacas, Falcón",
      en: "10 branches in Lara, Portuguesa and other states — bound for Tucacas, Falcón",
    },
    description: {
      es: "Red de clínicas odontológicas que habilitó sus sedes como centros de acopio. Priorizan insumos médicos para equipos de atención en zonas afectadas; la recolección se destina a Tucacas, estado Falcón.",
      en: "Dental clinic network that opened branches as collection centers. They prioritize medical supplies for response teams; donations are bound for Tucacas, Falcón state.",
    },
    help_center_id: "32",
    is_verified: false,
    sort_order: 10,
  },
  {
    id: "fundacion-bel",
    slug: "fundacion-bel",
    name: "Fundación BEL",
    resources: ["water", "food", "medicine"],
    state: "Lara",
    city: "Barquisimeto",
    coverage: {
      es: "Barquisimeto — apoyo a Caracas y La Guaira",
      en: "Barquisimeto — aid for Caracas and La Guaira",
    },
    description: {
      es: "Centro de acopio en la Torre BEL para familias afectadas en la Capital y La Guaira. Reciben agua, fórmulas, alimentos, medicinas, higiene, pañales, ropa, cobijas y también insumos para mascotas.",
      en: "Collection center at Torre BEL for families affected in the capital region and La Guaira. They accept water, formula, food, medicine, hygiene, diapers, clothing, blankets and pet supplies.",
    },
    help_center_id: "24",
    phone: "0424-5839025",
    is_verified: true,
    sort_order: 11,
  },
  {
    id: "will-store",
    slug: "will-store",
    name: "Will Store y Studio Gizah Rodríguez",
    resources: ["food", "water", "medicine"],
    state: "Lara",
    city: "Barquisimeto",
    coverage: {
      es: "Barrio Unión, Barquisimeto",
      en: "Barrio Unión, Barquisimeto",
    },
    description: {
      es: "Centro de acopio solidario «¡No están solos!» ante la emergencia nacional. Reciben alimentos no perecederos, ropa, linternas, insumos médicos y artículos de aseo personal.",
      en: "Solidarity collection center «You are not alone» during the national emergency. They accept non-perishable food, clothing, flashlights, medical supplies and personal hygiene items.",
    },
    help_center_id: "31",
    is_verified: false,
    sort_order: 12,
  },
  {
    id: "cc-las-trinitarias",
    slug: "cc-las-trinitarias",
    name: "C.C. Las Trinitarias",
    resources: ["food", "water", "medicine", "transport"],
    state: "Lara",
    city: "Barquisimeto",
    coverage: {
      es: "Tarima central, Barquisimeto",
      en: "Central stage area, Barquisimeto",
    },
    description: {
      es: "Centro comercial que habilitó su tarima central como acopio. Reciben alimentos, ropa, cobijas, medicinas, higiene, pañales y agua. El afiche indica encomienda gratis con Vamos App para entregar donativos.",
      en: "Shopping center that opened its central stage as a collection point. They accept food, clothing, blankets, medicine, hygiene, diapers and water. Flyers mention free Vamos App delivery for donations.",
    },
    help_center_id: "28",
    is_verified: false,
    sort_order: 13,
  },
  {
    id: "renov",
    slug: "renov",
    name: "RENOV",
    resources: ["medicine", "food", "water"],
    state: "Falcón",
    city: "Tucacas / Puerto Cabello",
    coverage: {
      es: "C.C. París — zona costera de Falcón",
      en: "C.C. París — Falcón coastal area",
    },
    description: {
      es: "Centro de acopio en el C.C. París para apoyar a damnificados en la zona de Tucacas y Puerto Cabello. Reciben insumos médicos y donativos de primera necesidad.",
      en: "Collection center at C.C. París supporting affected families in the Tucacas and Puerto Cabello area. They accept medical supplies and essential donations.",
    },
    help_center_id: "42",
    is_verified: false,
    sort_order: 14,
  },
  {
    id: "operacion-todos-vzla",
    slug: "operacion-todos-vzla",
    name: "Operación Todos con VZLA",
    resources: ["food", "water", "medicine"],
    state: "Lara",
    city: "Barquisimeto",
    coverage: {
      es: "Sambil Barquisimeto, municipio Iribarren",
      en: "Sambil Barquisimeto, Iribarren municipality",
    },
    description: {
      es: "Iniciativa ciudadana con centro de acopio junto al Sambil de Barquisimeto (Av. Venezuela). Canalizan ayuda humanitaria para zonas afectadas por el sismo.",
      en: "Citizen initiative with a collection center next to Sambil Barquisimeto (Av. Venezuela). They channel humanitarian aid to earthquake-affected areas.",
    },
    help_center_id: "43",
    is_verified: false,
    sort_order: 15,
  },
  {
    id: "foton-venezuela",
    slug: "foton-venezuela",
    name: "FOTON Venezuela",
    resources: ["water", "food", "medicine", "machinery"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "15 concesionarios y showrooms en todo el país",
      en: "15 dealerships and showrooms nationwide",
    },
    description: {
      es: "Todos los concesionarios y showrooms oficiales FOTON a nivel nacional están habilitados como centros de acopio tras el terremoto del 24 de junio. Reciben agua, alimentos, medicinas, ropa, higiene y material de rescate. Consulta la sede más cercana en Centros de ayuda o en fotonvzla.com/concesionarios.",
      en: "All official FOTON dealerships and showrooms nationwide are enabled as collection centers after the June 24 earthquake. They accept water, food, medicine, clothing, hygiene items and rescue supplies. Find the nearest branch under Help centers or at fotonvzla.com/concesionarios.",
    },
    website_url: "https://fotonvzla.com/concesionarios/",
    instagram_url: "https://www.instagram.com/fotonvzla/",
    phone: "+58 424-5599441",
    is_verified: true,
    sort_order: 16,
  },
  {
    id: "g3-logistica",
    slug: "g3-logistica",
    name: "G3 Logística",
    resources: ["water", "food", "medicine", "transport"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Caracas, Valencia y Barquisimeto",
      en: "Caracas, Valencia and Barquisimeto",
    },
    description: {
      es: "Centros de acopio habilitados para recibir insumos, materiales y donaciones tras el terremoto. Horario lun–vie 9:00–12:00 y 14:00–15:30 en las tres sedes.",
      en: "Collection centers enabled to receive supplies, materials and donations after the earthquake. Hours Mon–Fri 9:00 AM–12:00 PM and 2:00–3:30 PM at all three branches.",
    },
    is_verified: true,
    sort_order: 17,
  },
  {
    id: "casa-bambi",
    slug: "casa-bambi",
    name: "Casa Bambi (Hogar Bambi Venezuela)",
    resources: ["food", "medicine", "lodging"],
    state: "Distrito Capital",
    city: "Caracas",
    coverage: {
      es: "Nacional — 5 casas hogar y atención a niños en situación de riesgo",
      en: "Nationwide — 5 group homes and care for at-risk children",
    },
    description: {
      es: "Asociación civil sin fines de lucro con más de 30 años de trayectoria. Tras el terremoto del 24 de junio de 2026, canalizan ayuda para niños, niñas y adolescentes sin padres o afectados por la tragedia: acogida, alimentación, salud y acompañamiento integral. Aceptan donaciones económicas e insumos; consulta formas de aporte en su web oficial.",
      en: "Non-profit civil association with over 30 years of experience. After the June 24, 2026 earthquake, they channel aid for children and teens without parents or affected by the tragedy: shelter, food, health and holistic support. They accept financial donations and supplies; see their official website for how to contribute.",
    },
    website_url: "https://hogarbambi.org/",
    instagram_url: "https://www.instagram.com/hogarbambi/",
    phone: "+58 414-3081107",
    is_verified: true,
    sort_order: 18,
  },
  {
    id: "jesusdavid-med-literas",
    slug: "jesusdavid-med-literas",
    name: "Jesús David (@jesusdavid.med)",
    resources: ["lodging", "machinery"],
    state: "Lara",
    city: "Barquisimeto",
    coverage: {
      es: "Zona Industria 2, Barquisimeto",
      en: "Zona Industria 2, Barquisimeto",
    },
    description: {
      es: "Iniciativa solidaria en Zona Industria 2 que fabrica literas para familias damnificadas por el terremoto del 24 de junio. Coordinan entregas y apoyo en especie por Instagram @jesusdavid.med o al teléfono indicado.",
      en: "Solidarity initiative in Zona Industria 2 building bunk beds for families affected by the June 24 earthquake. Coordinate deliveries and in-kind support via Instagram @jesusdavid.med or the phone number listed.",
    },
    instagram_url: "https://www.instagram.com/jesusdavid.med/",
    phone: "+58 424-5465825",
    is_verified: false,
    sort_order: 19,
  },
  {
    id: "ferretotal",
    slug: "ferretotal",
    name: "Ferretotal",
    resources: ["machinery", "food", "water", "medicine"],
    state: "Miranda",
    city: "La Trinidad (Baruta)",
    coverage: {
      es: "Sede La Trinidad, Baruta — acopio y canalización de herramientas",
      en: "La Trinidad branch, Baruta — collection and tools coordination",
    },
    description: {
      es: "Cadena venezolana de ferreterías que habilitó la sede La Trinidad como centro de acopio tras el terremoto del 24 de junio. Recibe y canaliza donaciones — especialmente herramientas de rescate, linternas, pilas, guantes y material ferretero — hacia zonas afectadas. Listado en venezuelareporta.org; también difundido en recursos de emergencia en Instagram (@thefaria, @ferretotaloficial). Confirma horarios en @ferretotaloficial o al 0212-9422888.",
      en: "Venezuelan hardware chain that opened its La Trinidad branch as a collection center after the June 24 earthquake. They receive and channel donations — especially rescue tools, flashlights, batteries, gloves and hardware supplies — to affected areas. Listed on venezuelareporta.org; also shared via emergency resource posts on Instagram (@thefaria, @ferretotaloficial). Confirm hours on @ferretotaloficial or at 0212-9422888.",
    },
    website_url: "https://www.ferretotal.com/",
    instagram_url: "https://www.instagram.com/ferretotaloficial/",
    phone: "0212-9422888",
    help_center_id: "102",
    is_verified: false,
    sort_order: 20,
  },
  {
    id: "previasis",
    slug: "previasis",
    name: "Previasis",
    resources: ["medicine"],
    state: "Nacional",
    city: "Venezuela",
    coverage: {
      es: "Nacional — atención virtual y coordinación por Instagram",
      en: "Nationwide — virtual care and coordination via Instagram",
    },
    description: {
      es: "Empresa de medicina prepagada que activó apoyo psicológico gratuito para personas y familias afectadas por el terremoto del 24 de junio de 2026. Ofrecen contención emocional, orientación y acompañamiento en salud mental. Consulta disponibilidad, horarios y cómo acceder al servicio en Instagram @previasis o en previasis.com.",
      en: "Prepaid medicine company that activated free psychological support for people and families affected by the June 24, 2026 earthquake. They offer emotional containment, guidance and mental health support. Check availability, hours and how to access the service on Instagram @previasis or at previasis.com.",
    },
    website_url: "https://previasis.com/",
    instagram_url: "https://www.instagram.com/previasis/",
    phone: "0424-5051851",
    is_verified: true,
    sort_order: 21,
  },
];

export function getSolidarityCompanies() {
  return [...SOLIDARITY_COMPANIES].sort((a, b) => a.sort_order - b.sort_order);
}

export function getSolidarityCompany(slug: string) {
  return SOLIDARITY_COMPANIES.find((c) => c.slug === slug);
}
