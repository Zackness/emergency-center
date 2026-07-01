export interface BloodDonationSite {
  id: string;
  name: string;
  zone: string;
  city: string;
  state: string;
  address: string;
  phone?: string;
  notes?: { es: string; en: string };
  sort_order: number;
}

export interface BloodDonationCampaign {
  id: string;
  organization: string;
  handle: string;
  instagram_url: string;
  source_published_at: string;
  headline: { es: string; en: string };
  message: { es: string; en: string };
  requirements: { es: string[]; en: string[] };
  sites: BloodDonationSite[];
}

/** Difundido por @tugranitodearenahoy — alineado con centros de la Red de Bancos de Sangre (MinSalud, jun 2026). */
export const BLOOD_DONATION_CAMPAIGN: BloodDonationCampaign = {
  id: "tu-granito-de-arena-sangre",
  organization: "Tu Granito de Arena Hoy",
  handle: "@tugranitodearenahoy",
  instagram_url: "https://www.instagram.com/tugranitodearenahoy/",
  source_published_at: "2026-06-28T16:00:00.000Z",
  headline: {
    es: "¿Dónde puedo donar sangre?",
    en: "Where can I donate blood?",
  },
  message: {
    es: "Tras el terremoto del 24 de junio, cientos de personas siguen hospitalizadas y los centros asistenciales necesitan donantes con urgencia. Cada donación puede salvar hasta tres vidas. Confirma horario y requisitos al llegar al centro.",
    en: "After the June 24 earthquake, hundreds of people remain hospitalized and health centers urgently need donors. Each donation can save up to three lives. Confirm hours and requirements when you arrive.",
  },
  requirements: {
    es: [
      "Mayor de 18 años y más de 50 kg de peso",
      "Acudir desayunado",
      "No haber tenido gripe recientemente ni estar tomando antibióticos",
      "No haber padecido hepatitis después de los 10 años",
      "Si tienes tatuajes, deben tener más de un año",
    ],
    en: [
      "18+ years old and over 50 kg",
      "Come having had breakfast",
      "No recent flu and not taking antibiotics",
      "No hepatitis after age 10",
      "If you have tattoos, they must be over one year old",
    ],
  },
  sites: [
    {
      id: "bd-jgh-magallanes",
      name: "Hospital Dr. José Gregorio Hernández",
      zone: "Los Magallanes de Catia",
      city: "Caracas",
      state: "Distrito Capital",
      address: "Av. principal de La Laguna de Catia, sector Los Magallanes, parroquia Sucre",
      phone: "0212-870-7897",
      sort_order: 1,
    },
    {
      id: "bd-huc",
      name: "Hospital Universitario de Caracas (HUC)",
      zone: "Los Chaguaramos — Zona Médica UCV",
      city: "Caracas",
      state: "Distrito Capital",
      address: "Av. Minerva y av. Interna UCV, Zona Médica de Los Chaguaramos",
      phone: "0212-605-8811",
      sort_order: 2,
    },
    {
      id: "bd-banco-municipal",
      name: "Banco Municipal de Sangre",
      zone: "San José",
      city: "Caracas",
      state: "Distrito Capital",
      address: "Esquina de Pirineos, San José, detrás del Hospital José María Vargas y frente a la Escuela de Medicina",
      sort_order: 3,
    },
    {
      id: "bd-perez-leon-ii",
      name: "Hospital Pérez de León II",
      zone: "Buena Vista, Petare",
      city: "Caracas",
      state: "Miranda",
      address: "Final de la av. Francisco de Miranda, Buena Vista, Petare",
      sort_order: 4,
    },
    {
      id: "bd-domingo-luciani",
      name: "Hospital Domingo Luciani (Hemocentro de Chacao)",
      zone: "Chacao",
      city: "Caracas",
      state: "Miranda",
      address: "Av. Santa Teresa, cruce con calle Monseñor Grill, frente al antiguo Mercado Municipal",
      sort_order: 5,
    },
    {
      id: "bd-victorino-santaella",
      name: "Hospital Victorino Santaella",
      zone: "El Tambor",
      city: "Los Teques",
      state: "Miranda",
      address: "Av. Bicentenario, sector El Tambor, Los Teques",
      sort_order: 6,
    },
    {
      id: "bd-miguel-perez-carreno",
      name: "Hospital Miguel Pérez Carreño",
      zone: "Bella Vista",
      city: "Caracas",
      state: "Distrito Capital",
      address: "Bella Vista, Caracas",
      phone: "0212-472-8472",
      sort_order: 7,
    },
    {
      id: "bd-hospital-vargas",
      name: "Hospital Vargas",
      zone: "San José — Av. Panteón",
      city: "Caracas",
      state: "Distrito Capital",
      address: "Diagonal al Panteón Nacional, San José, Caracas",
      phone: "0212-861-1711",
      sort_order: 8,
    },
  ],
};

export function getBloodDonationCampaign() {
  return {
    ...BLOOD_DONATION_CAMPAIGN,
    sites: [...BLOOD_DONATION_CAMPAIGN.sites].sort((a, b) => a.sort_order - b.sort_order),
  };
}
