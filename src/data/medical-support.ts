export interface MedicalSupportResource {
  id: string;
  name: string;
  description: { es: string; en: string };
  website_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  handle?: string;
  is_verified: boolean;
  sort_order: number;
}

export const MEDICAL_SUPPORT_RESOURCES: MedicalSupportResource[] = [
  {
    id: "app-zana",
    name: "Zana — App de apoyo médico",
    description: {
      es: "Plataforma venezolana 100 % gratuita durante la emergencia: mapa de ayuda en vivo, búsqueda de medicinas, publicar necesidades o disponibilidad, y contacto directo por teléfono o WhatsApp. No necesitas cuenta para pedir u ofrecer ayuda. Equipos de rescate y médicos voluntarios pueden registrarse para coordinar atención e insumos.",
      en: "Venezuelan platform 100% free during the emergency: live help map, medicine search, publish needs or availability, and direct phone or WhatsApp contact. No account needed to request or offer help. Rescue teams and volunteer physicians can register to coordinate care and supplies.",
    },
    website_url: "https://zanapronto.com/rescate",
    instagram_url: "https://www.instagram.com/appzana/",
    whatsapp_url: "https://wa.me/12246401785",
    handle: "@appzana",
    is_verified: false,
    sort_order: 0,
  },
  {
    id: "tu-granito-de-arena-sangre",
    name: "Tu Granito de Arena Hoy — donación de sangre",
    description: {
      es: "Iniciativa ciudadana en Instagram que difunde dónde donar sangre en Caracas y alrededores tras el terremoto. Cada donación puede salvar hasta tres vidas. Consulta centros, requisitos y horarios en la sección de donación de sangre de Recursos y Hospitales.",
      en: "Citizen initiative on Instagram spreading where to donate blood in Caracas and surrounding areas after the earthquake. Each donation can save up to three lives. See centers, requirements and hours in the blood donation section on Resources and Hospitals.",
    },
    instagram_url: "https://www.instagram.com/tugranitodearenahoy/",
    handle: "@tugranitodearenahoy",
    is_verified: false,
    sort_order: 1,
  },
];

export function getMedicalSupportResources() {
  return [...MEDICAL_SUPPORT_RESOURCES].sort((a, b) => a.sort_order - b.sort_order);
}
