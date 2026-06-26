import type { Locale } from "@/i18n/config";
import { SEED_EMERGENCY_NUMBERS } from "@/data/seed";
import { getOfflineTools } from "@/data/offline-tools";
import {
  ACARIGUA_TRANSPORT_VOLUNTEER_CALL,
  BARQUISIMETO_CARGO_TRANSPORT_CALL,
  LARA_TRANSPORT_VOLUNTEER_CALL,
  MEDICAL_VOLUNTEER_CALL,
  UNEFM_TUCACAS_VOLUNTEER_CALL,
  RESCUER_VOLUNTEER_CALL,
} from "@/data/volunteer-calls";
import { VENEVISION_MISSING_LINE } from "@/data/venevision-missing-line";
import { INTERPRETER_VOLUNTEER_GROUP } from "@/data/interpreter-volunteer-group";
import { RED_CROSS_VOLUNTEER_REGISTRY } from "@/data/red-cross-volunteer";
import {
  fetchAgencies,
  fetchExternalLinks,
  fetchExternalSources,
  fetchHelpCenters,
  fetchHospitals,
  fetchMissingPersons,
  fetchNews,
  fetchShelters,
} from "@/lib/data";
import type { SearchIndexItem, SearchResultType } from "@/types/search";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function joinParts(...parts: (string | null | undefined | number)[]): string {
  return normalize(parts.filter(Boolean).join(" "));
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/$/, "").toLowerCase();
}

function item(
  partial: Omit<SearchIndexItem, "searchText"> & { extra?: string }
): SearchIndexItem {
  const { extra, ...rest } = partial;
  return {
    ...rest,
    searchText: joinParts(rest.title, rest.description, rest.meta, extra),
  };
}

const RESOURCE_GUIDES: Record<
  Locale,
  { phase: string; title: string; items: string[] }[]
> = {
  es: [
    {
      phase: "before",
      title: "Preparación ante terremotos",
      items: [
        "zonas seguras",
        "mochila de emergencia",
        "agua alimentos medicinas documentos",
        "punto de reunión familiar",
        "rutas de evacuación",
      ],
    },
    {
      phase: "during",
      title: "Durante un terremoto",
      items: [
        "agáchate cúbrete agárrate",
        "no usar ascensores",
        "alejarse de cables eléctricos",
      ],
    },
    {
      phase: "after",
      title: "Después del terremoto",
      items: [
        "heridos emergencia 171",
        "no reingresar edificios dañados",
        "máscara polvo",
        "fuentes oficiales VenApp",
      ],
    },
  ],
  en: [
    {
      phase: "before",
      title: "Earthquake preparedness",
      items: [
        "safe zones",
        "emergency bag water food medicine documents",
        "family meeting point",
        "evacuation routes",
      ],
    },
    {
      phase: "during",
      title: "During an earthquake",
      items: [
        "drop cover hold on",
        "do not use elevators",
        "power lines",
      ],
    },
    {
      phase: "after",
      title: "After the earthquake",
      items: [
        "injuries emergency 171",
        "damaged buildings",
        "dust mask",
        "official sources VenApp",
      ],
    },
  ],
};

const STATIC_PAGES: Record<
  Locale,
  { href: string; title: string; description: string; keywords: string }[]
> = {
  es: [
    {
      href: "/es/centros-ayuda",
      title: "Centros de ayuda",
      description: "Centros de acopio para donar agua, alimentos y medicinas. Vamos App tiene viajes gratis para donaciones.",
      keywords: "donar acopio ayuda solidaridad vamos app donaciones viajes gratis encomienda gasas jeringas guantes catéter ibuprofeno vendas suturas",
    },
    {
      href: "/es/centros-ayuda#acopio-activos-rdelbufalo",
      title: "Centros de acopio activos en Venezuela",
      description: "Puntos activos del 25 de junio en Caracas, Aragua, Carabobo, Andes, Anzoátegui, Guayana y Barquisimeto. Fuente @rdelbufalo.",
      keywords: "acopio activo mormón bejucal la capilla talislandia ula cecosesola ucab rdelbufalo quinta bejucal",
    },
    {
      href: "/es/centros-ayuda#acopio-g3-caritas",
      title: "G3 Logística y Cáritas — Dónde donar",
      description: "Centros de acopio G3 en Caracas, Valencia y Barquisimeto; sede Cáritas Montalbán (Av. Teherán).",
      keywords: "g3 logística caritas montalbán teherán maploca cortijos lourdes san diego barquisimeto donar",
    },
    {
      href: "https://centroacopio.site/",
      title: "Centros de Acopio Venezuela — centroacopio.site",
      description:
        "Red nacional de centros de acopio y voluntarios de delivery gratuito. Registra o consulta puntos de ayuda en zonas afectadas.",
      keywords: "centroacopio acopio delivery gratis motorizado transporte donaciones unidos por venezuela",
    },
    {
      href: "/es/centros-ayuda#que-donar",
      title: "¿Qué donar? — Insumos médicos necesarios",
      description: "Lista de insumos médicos: compresas, gasas, jeringas, soluciones, suturas, guantes, captopril, nifedipino, ketoprofeno, adrenalina y más.",
      keywords: "donar comprar insumos médicos compresas gasas jeringas ringer dextrosa yodopovidona captopril nifedipino ketoprofeno dexametasona adrenalina lidocaína sutura guantes",
    },
    {
      href: "/es/hospitales",
      title: "Hospitales en Venezuela — ingresos hospitalarios",
      description:
        "Busca por nombre o cédula si un familiar está ingresado en un hospital o centro de salud.",
      keywords: "hospitalesenvenezuela ingresados pacientes hospital familiar cédula lista digital",
    },
    {
      href: "/es/hospitales",
      title: "Hospitales",
      description: "Directorio nacional de hospitales en Venezuela con búsqueda, filtros y mapa.",
      keywords: "salud emergencia médico urgencias",
    },
    {
      href: "/es/refugios",
      title: "Refugios",
      description: "Refugios temporales con capacidad y servicios",
      keywords: "alojamiento refugio temporal vivienda hospedaje tucacas calipso voluntarios",
    },
    {
      href: "/es/refugios#calipso-tucacas",
      title: "Hospedaje gratuito — Club Calipso (Tucacas)",
      description: "Hospedaje gratuito en Tucacas para personas que vienen a ayudar. Club de Playa Calipso. Tel: 0412-8614663",
      keywords: "hospedaje gratuito tucacas falcon calipso paradise voluntarios alojamiento 04128614663",
    },
    {
      href: "/es/danos",
      title: "Mapa de daños",
      description: "Mapa de edificios dañados en Venezuela con búsqueda, filtros y reportes ciudadanos.",
      keywords: "daños mapa edificios desplomado dañado evacuado estructuras terremoto reportar terremotovenezuela",
    },
    {
      href: "/es/danos#sitios-prioritarios-rescate",
      title: "Sitios prioritarios de búsqueda y rescate",
      description: "13 estructuras críticas en Caraballeda, La Guaira, Caracas, Aragua y Falcón con coordenadas GPS. Fuente @rdelbufalo.",
      keywords: "rescate búsqueda caraballeda tahiti gabarra catia la mar maiquetía san judas tadeo turmero tucacas rdelbufalo",
    },
    {
      href: "https://habitable.lovable.app/",
      title: "Ingenieros por Venezuela — inspección de edificios",
      description:
        "Ingenieros civiles y estructurales: regístrate como voluntario. Ciudadanos: reporta edificios dañados para priorizar inspecciones.",
      keywords: "ingenieros por venezuela habitable ingeniero civil estructural voluntario inspección edificio dañado cabreracg",
    },
    {
      href: "/es/danos#ingenieros-por-venezuela",
      title: "Ingenieros por Venezuela — mapa de daños",
      description: "Plataforma aliada para registro de ingenieros voluntarios y reporte de edificios dañados.",
      keywords: "ingenieros habitable lovable inspección estructural daños edificio",
    },
    {
      href: "/es/organismos",
      title: "Organismos oficiales",
      description: "Protección Civil, Bomberos, Cruz Roja, Policía",
      keywords: "gobierno oficial rescate bomberos policía",
    },
    {
      href: "/es/desaparecidos",
      title: "Personas desaparecidas",
      description: "Buscar desaparecidos, plataformas externas y registro de respaldo",
      keywords: "desaparecido buscar familia VenApp Venezuela Te Busca",
    },
    {
      href: "/es/mascotas",
      title: "Mascotas perdidas",
      description: "Plataformas y redes sociales para reportar mascotas perdidas",
      keywords: "perro gato animal mascota perdida huellascan",
    },
    {
      href: "/es/mascotas#academia-leguau",
      title: "Academia Leguau — Mascotas perdidas (Instagram)",
      description: "Registro por Instagram @academialeguau y WhatsApp 0424-159-65-90. Foto, nombre, especie, raza, ubicación y contacto.",
      keywords: "academia leguau instagram whatsapp mascota perdida terremoto 04241596590",
    },
    {
      href: "/es/mascotas#vetcity-maracay",
      title: "VETCITY — Atención veterinaria solidaria (Maracay)",
      description: "Reciben mascotas afectadas por el terremoto para atención médica solidaria. Instagram @vetcity.mcy. Tel: 0424-3414790.",
      keywords: "vetcity maracay veterinaria animales terremoto atención médica 04243414790",
    },
    {
      href: "/es/noticias",
      title: "Noticias y verificación comunitaria",
      description: "Publica noticias y vota si parecen ciertas o falsas para estimar credibilidad colectiva.",
      keywords: "noticias fake news verificación votar falso cierto credibilidad comunidad sismo terremoto",
    },
    {
      href: "/es/voluntarios",
      title: "Registro de voluntarios",
      description: "Ofrece tu ayuda profesional o logística",
      keywords: "voluntario ayuda ofrecer médico enfermero rescatista defensa civil",
    },
    {
      href: "/es/empresas",
      title: "Empresas solidarias",
      description: "Vamos App, Yummy, Farmatodo, Cáritas Venezuela, MOF y más organizaciones con transporte gratis, ayuda humanitaria o centros de acopio",
      keywords: "empresa solidaria yummy farmatodo caritas caritasdevzla vamos app movistar digitel telefonía señal sms llamadas transporte donaciones acopio ayuda humanitaria mof odontólogo bel renov",
    },
    {
      href: "/es/empresas#caritas-venezuela",
      title: "Cáritas de Venezuela — Ayuda humanitaria",
      description: "Campaña de emergencia, centros de acopio nacionales y diocesanos. Instagram oficial: @caritasdevzla.",
      keywords: "caritas venezuela caritasdevzla instagram ayuda humanitaria acopio agua alimentos medicinas iglesia emergencia terremoto",
    },
    {
      href: "/es/empresas#movistar",
      title: "Movistar — Señal, llamadas y SMS gratis",
      description: "48 a 72 horas de telefonía móvil sin costo para usuarios Movistar tras el terremoto del 24 de junio.",
      keywords: "movistar señal gratis llamadas sms telefonía emergencia terremoto 48 horas 72 horas",
    },
    {
      href: "/es/empresas#digitel",
      title: "Digitel — Señal, llamadas y SMS gratis",
      description: "48 a 72 horas de señal, llamadas y mensajes de texto sin costo para abonados Digitel ante la emergencia.",
      keywords: "digitel señal gratis llamadas sms telefonía emergencia terremoto 48 horas 72 horas",
    },
    {
      href: "/es/empresas#vamos-app",
      title: "Vamos App — Viajes gratis para donaciones",
      description: "Encomienda y viajes con opción Donaciones a $0.00 para llevar ayuda a centros de acopio.",
      keywords: "vamos app donaciones viajes gratis encomienda transporte solidario",
    },
    {
      href: "/es/empresas#yummy",
      title: "Yummy — Viajes gratis a hospitales (Caracas)",
      description: "Transporte gratuito a hospitales y clínicas en Caracas tras el terremoto del 24 de junio.",
      keywords: "yummy viajes gratis hospitales caracas terremoto transporte",
    },
    {
      href: "/es/empresas#farmatodo",
      title: "Farmatodo — Puntos de acopio",
      description: "Farmacias y CENDIS como centros de acopio para agua, alimentos y medicinas.",
      keywords: "farmatodo acopio donaciones farmacia 0800 medicinas",
    },
    {
      href: "/es/empresas#foton-venezuela",
      title: "FOTON Venezuela — Concesionarios como centros de acopio",
      description: "Red nacional de concesionarios y showrooms FOTON habilitados para recibir donaciones.",
      keywords: "foton fotonvzla concesionarios acopio camiones valencia caracas barquisimeto maracaibo",
    },
    {
      href: "/es/empresas#mi-odontologo-favorito",
      title: "Mi Odontólogo Favorito — Acopio de insumos médicos",
      description: "10 sedes en Lara y regiones como centros de acopio; destino Tucacas, Falcón.",
      keywords: "mof odontólogo favorito acopio insumos médicos barquisimeto",
    },
    {
      href: "/es/recursos",
      title: "Recursos y guías",
      description: "Qué hacer antes, durante y después de una emergencia",
      keywords: "guía preparación seguridad terremoto inundación bitchat sin internet apoyo psicológico psicólogos salud mental",
    },
    {
      href: "/es/recursos#apoyo-psicologico",
      title: "Apoyo psicológico — @fceunimet y líneas de contención",
      description: "Primeros auxilios psicológicos, contención emocional e intervención en crisis para personas afectadas.",
      keywords: "fceunimet psicólogos psicologos apoyo psicológico salud mental ansiedad pánico estrés crisis lapsi federación psicólogos rehabilitarte",
    },
    {
      href: "/es/roadmap",
      title: "Roadmap y novedades",
      description: "Funcionalidades en desarrollo, próximas mejoras y sugerencias de la comunidad",
      keywords: "roadmap novedades features funcionalidades sugerir desarrollo plataforma",
    },
  ],
  en: [
    {
      href: "/en/centros-ayuda",
      title: "Help centers",
      description: "Collection centers for water, food and medicine donations. Vamos App has free rides for donations.",
      keywords: "donate collection aid solidarity vamos app donations free rides delivery gauze syringes gloves catheter ibuprofen bandages sutures",
    },
    {
      href: "/en/centros-ayuda#acopio-activos-rdelbufalo",
      title: "Active collection centers in Venezuela",
      description: "Active drop-off points from June 25 in Caracas, Aragua, Carabobo, Andes, Anzoátegui, Guayana and Barquisimeto. Source @rdelbufalo.",
      keywords: "active collection mormon bejucal la capilla talislandia ula cecosesola ucab rdelbufalo",
    },
    {
      href: "/en/centros-ayuda#acopio-g3-caritas",
      title: "G3 Logística and Caritas — Where to donate",
      description: "G3 collection centers in Caracas, Valencia and Barquisimeto; Caritas Montalbán HQ (Av. Teherán).",
      keywords: "g3 logistica caritas montalban teheran maploca cortijos lourdes san diego barquisimeto donate",
    },
    {
      href: "https://centroacopio.site/",
      title: "Centros de Acopio Venezuela — centroacopio.site",
      description:
        "National network of collection centers and free delivery volunteers. Register or look up aid points in affected areas.",
      keywords: "centroacopio collection center free delivery transport donations unidos por venezuela",
    },
    {
      href: "/en/centros-ayuda#que-donar",
      title: "What to donate — Medical supplies needed",
      description: "Medical supplies list: compress packs, gauze, syringes, solutions, sutures, gloves, captopril, nifedipine, ketoprofen, adrenaline and more.",
      keywords: "donate buy medical supplies compress gauze syringes ringer dextrose povidone captopril nifedipine ketoprofen dexamethasone adrenaline lidocaine suture gloves",
    },
    {
      href: "/en/hospitales",
      title: "Hospitales en Venezuela — hospital admissions",
      description:
        "Search by name or ID if a relative is admitted to a hospital or health center.",
      keywords: "hospitalesenvenezuela admitted patients hospital relative id digital list",
    },
    {
      href: "/en/hospitales",
      title: "Hospitals",
      description: "National directory of hospitals in Venezuela with search, filters and map.",
      keywords: "health emergency medical urgent care",
    },
    {
      href: "/en/refugios",
      title: "Shelters",
      description: "Temporary shelters with capacity and services",
      keywords: "housing shelter temporary lodging tucacas calipso volunteers",
    },
    {
      href: "/en/refugios#calipso-tucacas",
      title: "Free lodging — Club Calipso (Tucacas)",
      description: "Free lodging in Tucacas for people coming to help. Club de Playa Calipso. Tel: 0412-8614663",
      keywords: "free lodging tucacas falcon calipso paradise volunteers accommodation 04128614663",
    },
    {
      href: "/en/danos",
      title: "Damage map",
      description: "Map of damaged buildings in Venezuela with search, filters and community reports.",
      keywords: "damage map buildings collapsed damaged evacuated structures earthquake report terremotovenezuela",
    },
    {
      href: "/en/danos#sitios-prioritarios-rescate",
      title: "Priority search and rescue sites",
      description: "13 critical structures in Caraballeda, La Guaira, Caracas, Aragua and Falcón with GPS coordinates. Source @rdelbufalo.",
      keywords: "rescue search caraballeda tahiti gabarra catia la mar maiquetia san judas tadeo turmero tucacas rdelbufalo",
    },
    {
      href: "https://habitable.lovable.app/",
      title: "Ingenieros por Venezuela — building inspections",
      description:
        "Civil and structural engineers: register as a volunteer. Citizens: report damaged buildings to prioritize inspections.",
      keywords: "ingenieros por venezuela habitable engineer civil structural volunteer inspection damaged building cabreracg",
    },
    {
      href: "/en/danos#ingenieros-por-venezuela",
      title: "Ingenieros por Venezuela — damage map",
      description: "Allied platform for volunteer engineer registration and damaged building reports.",
      keywords: "engineers habitable lovable structural inspection damage building",
    },
    {
      href: "/en/organismos",
      title: "Official agencies",
      description: "Civil Protection, Firefighters, Red Cross, Police",
      keywords: "government official rescue firefighters police",
    },
    {
      href: "/en/desaparecidos",
      title: "Missing persons",
      description: "Search missing persons, external platforms and backup registry",
      keywords: "missing search family VenApp Venezuela Te Busca",
    },
    {
      href: "/en/mascotas",
      title: "Lost pets",
      description: "Platforms and social media to report lost pets",
      keywords: "dog cat animal pet lost huellascan",
    },
    {
      href: "/en/mascotas#academia-leguau",
      title: "Academia Leguau — Lost pets (Instagram)",
      description: "Report via Instagram @academialeguau and WhatsApp 0424-159-65-90. Photo, name, species, breed, location and contact.",
      keywords: "academia leguau instagram whatsapp lost pet earthquake 04241596590",
    },
    {
      href: "/en/mascotas#vetcity-maracay",
      title: "VETCITY — Solidarity veterinary care (Maracay)",
      description: "They receive pets affected by the earthquake for solidarity medical care. Instagram @vetcity.mcy. Tel: 0424-3414790.",
      keywords: "vetcity maracay veterinary animals earthquake medical care 04243414790",
    },
    {
      href: "/en/noticias",
      title: "News & community fact-checking",
      description: "Publish news and vote whether items seem true or false to estimate collective credibility.",
      keywords: "news fake fact check vote false true credibility community earthquake",
    },
    {
      href: "/en/voluntarios",
      title: "Volunteer registration",
      description: "Offer your professional or logistical help",
      keywords: "volunteer help offer nurse doctor rescuer civil defense",
    },
    {
      href: "/en/empresas",
      title: "Solidarity companies",
      description: "Vamos App, Yummy, Farmatodo, Caritas Venezuela, MOF and more organizations with free transport, humanitarian aid or collection centers",
      keywords: "solidarity company yummy farmatodo caritas caritasdevzla vamos app movistar digitel mobile signal sms calls transport donations collection humanitarian aid mof dentist bel renov",
    },
    {
      href: "/en/empresas#caritas-venezuela",
      title: "Caritas Venezuela — Humanitarian aid",
      description: "Emergency campaign, national and diocesan collection points. Official Instagram: @caritasdevzla.",
      keywords: "caritas venezuela caritasdevzla instagram humanitarian aid collection water food medicine church emergency earthquake",
    },
    {
      href: "/en/empresas#movistar",
      title: "Movistar — Free signal, calls and SMS",
      description: "48 to 72 hours of free mobile service for Movistar users after the June 24 earthquake.",
      keywords: "movistar free signal calls sms mobile telecom emergency earthquake",
    },
    {
      href: "/en/empresas#digitel",
      title: "Digitel — Free signal, calls and SMS",
      description: "48 to 72 hours of free signal, calls and text messages for Digitel subscribers during the emergency.",
      keywords: "digitel free signal calls sms mobile telecom emergency earthquake",
    },
    {
      href: "/en/empresas#vamos-app",
      title: "Vamos App — Free rides for donations",
      description: "Delivery and rides with Donations option at $0.00 to take aid to collection centers.",
      keywords: "vamos app donations free rides delivery solidarity transport",
    },
    {
      href: "/en/empresas#yummy",
      title: "Yummy — Free hospital rides (Caracas)",
      description: "Free transport to hospitals and clinics in Caracas after the June 24 earthquake.",
      keywords: "yummy free rides hospitals caracas earthquake transport",
    },
    {
      href: "/en/empresas#farmatodo",
      title: "Farmatodo — Collection points",
      description: "Pharmacies and distribution center accepting water, food and medicine donations.",
      keywords: "farmatodo collection donations pharmacy medicine",
    },
    {
      href: "/en/empresas#foton-venezuela",
      title: "FOTON Venezuela — Dealerships as collection centers",
      description: "Nationwide network of official FOTON dealerships and showrooms accepting donations.",
      keywords: "foton fotonvzla dealerships collection trucks valencia caracas barquisimeto maracaibo",
    },
    {
      href: "/en/empresas#mi-odontologo-favorito",
      title: "Mi Odontólogo Favorito — Medical supply collection",
      description: "10 branches in Lara and regions as collection centers; bound for Tucacas, Falcón.",
      keywords: "mof dentist collection medical supplies barquisimeto",
    },
    {
      href: "/en/recursos",
      title: "Resources and guides",
      description: "What to do before, during and after an emergency",
      keywords: "guide preparedness safety earthquake flood bitchat offline psychological support mental health",
    },
    {
      href: "/en/recursos#apoyo-psicologico",
      title: "Psychological support — @fceunimet and crisis lines",
      description: "Psychological first aid, emotional containment and crisis intervention for affected people.",
      keywords: "fceunimet psychologists psychological support mental health anxiety panic stress crisis lapsi federation psychologists rehabilitarte",
    },
    {
      href: "/en/roadmap",
      title: "Roadmap & updates",
      description: "Features in development, upcoming improvements and community suggestions",
      keywords: "roadmap updates features suggest development platform",
    },
  ],
};

export async function buildSearchIndex(locale: Locale): Promise<SearchIndexItem[]> {
  const prefix = `/${locale}`;
  const [
    helpCenters,
    hospitals,
    shelters,
    agencies,
    missingLinks,
    petLinks,
    toolLinks,
    officialLinks,
    news,
    externalSources,
    missingPersons,
  ] = await Promise.all([
    fetchHelpCenters(),
    fetchHospitals(),
    fetchShelters(),
    fetchAgencies(),
    fetchExternalLinks("missing"),
    fetchExternalLinks("pets"),
    fetchExternalLinks("tools"),
    fetchExternalLinks("official"),
    fetchNews(),
    fetchExternalSources(),
    fetchMissingPersons(),
  ]);

  const allExternalLinks = [...missingLinks, ...petLinks, ...toolLinks, ...officialLinks];

  const index: SearchIndexItem[] = [];
  const indexedExternalUrls = new Set<string>();

  const trackExternalUrl = (url: string) => {
    indexedExternalUrls.add(normalizeUrl(url));
  };

  const isExternalUrlIndexed = (url: string) => indexedExternalUrls.has(normalizeUrl(url));

  for (const center of helpCenters) {
    index.push(
      item({
        id: `hc-${center.id}`,
        type: "help_center",
        title: center.name,
        description: center.description ?? center.address,
        href: `${prefix}/centros-ayuda#${center.id}`,
        meta: `${center.city}, ${center.state}`,
        extra: joinParts(center.phone, center.email, center.accepts.join(" ")),
      })
    );
  }

  for (const hospital of hospitals) {
    index.push(
      item({
        id: `hp-${hospital.id}`,
        type: "hospital",
        title: hospital.name,
        description: hospital.notes ?? hospital.address,
        href: `${prefix}/hospitales#${hospital.id}`,
        meta: `${hospital.city}, ${hospital.state} · ${hospital.status}`,
        extra: joinParts(hospital.phone, hospital.services.join(" ")),
      })
    );
  }

  for (const shelter of shelters) {
    index.push(
      item({
        id: `sh-${shelter.id}`,
        type: "shelter",
        title: shelter.name,
        description: shelter.address,
        href: `${prefix}/refugios#${shelter.id}`,
        meta: `${shelter.city}, ${shelter.state}`,
        extra: joinParts(
          shelter.phone,
          shelter.services.join(" "),
          shelter.capacity?.toString()
        ),
      })
    );
  }

  for (const agency of agencies) {
    index.push(
      item({
        id: `ag-${agency.id}`,
        type: "agency",
        title: agency.name,
        description: agency.description ?? agency.category,
        href: `${prefix}/organismos#${agency.id}`,
        meta: agency.state ?? undefined,
        extra: joinParts(
          agency.phone,
          agency.email,
          agency.website ?? undefined,
          agency.social_links[0]?.handle ?? undefined
        ),
        external: Boolean(agency.website || agency.social_links.length),
      })
    );
  }

  for (const person of missingPersons) {
    index.push(
      item({
        id: `mp-${person.id}`,
        type: "missing_person",
        title: person.full_name,
        description: person.description ?? person.last_seen_location ?? "",
        href: `${prefix}/desaparecidos#${person.id}`,
        meta: `${person.city}, ${person.state}`,
        extra: joinParts(
          person.last_seen_location,
          person.sources.map((s) => s.source_name).join(" ")
        ),
      })
    );
  }

  for (const source of externalSources) {
    trackExternalUrl(source.url);
    index.push(
      item({
        id: `es-${source.id}`,
        type: "external_source",
        title: source.name,
        description: source.description ?? "",
        href: source.url,
        meta: source.registration_type,
        external: true,
      })
    );
  }

  for (const link of allExternalLinks) {
    if (isExternalUrlIndexed(link.url)) continue;
    trackExternalUrl(link.url);
    index.push(
      item({
        id: `el-${link.id}`,
        type: "external_link",
        title: link.title,
        description: link.description ?? "",
        href: link.url,
        meta: link.category,
        external: true,
      })
    );
  }

  for (const article of news) {
    index.push(
      item({
        id: `nw-${article.id}`,
        type: "news",
        title: article.title,
        description: article.summary,
        href: article.source_url,
        meta: article.source,
        external: true,
      })
    );
  }

  for (const num of SEED_EMERGENCY_NUMBERS) {
    const label = locale === "es" ? num.label_es : num.label_en;
    index.push(
      item({
        id: `em-${num.id}`,
        type: "emergency_number",
        title: `${label}: ${num.number}`,
        description:
          locale === "es"
            ? "Número de emergencia nacional"
            : "National emergency number",
        href: `tel:${num.number.replace(/\D/g, "")}`,
        meta: num.number,
        extra: label,
      })
    );
  }

  for (const guide of RESOURCE_GUIDES[locale]) {
    index.push(
      item({
        id: `rg-${guide.phase}`,
        type: "resource",
        title: guide.title,
        description: guide.items.join(" · "),
        href: `${prefix}/recursos#${guide.phase}`,
        extra: guide.items.join(" "),
      })
    );
  }

  for (const page of STATIC_PAGES[locale]) {
    index.push(
      item({
        id: `pg-${page.href}`,
        type: "page",
        title: page.title,
        description: page.description,
        href: page.href,
        extra: page.keywords,
      })
    );
  }

  for (const tool of getOfflineTools(locale)) {
    index.push(
      item({
        id: `ot-${tool.id}`,
        type: "resource",
        title: tool.name,
        description: tool.tagline,
        href: `${prefix}/recursos#${tool.slug}`,
        extra: joinParts(tool.description, tool.features.join(" "), "bluetooth offline sin internet"),
        external: false,
      })
    );
    for (const link of tool.links) {
      if (isExternalUrlIndexed(link.url)) continue;
      trackExternalUrl(link.url);
      index.push(
        item({
          id: `ot-${tool.id}-${link.url}`,
          type: "external_link",
          title: `${tool.name} — ${link.label}`,
          description: tool.tagline,
          href: link.url,
          external: true,
        })
      );
    }
  }

  const rescuerTitle =
    locale === "es"
      ? "Convocatoria rescatistas — transporte a Caracas y La Guaira"
      : "Rescuer call — transport to Caracas and La Guaira";
  const rescuerDesc =
    locale === "es"
      ? "Rescatistas o defensa civil de Barquisimeto, Yaracuy y Lara. Cubren transporte y comida. Tel: 04125459833"
      : "Rescuers or civil defense from Barquisimeto, Yaracuy and Lara. Transportation and meals covered. Tel: 04125459833";

  index.push(
    item({
      id: "vc-cruz-roja-voluntarios",
      type: "page",
      title:
        locale === "es"
          ? "Cruz Roja — Registro de voluntarios"
          : "Red Cross — Volunteer registration",
      description:
        locale === "es"
          ? "Registro oficial para apoyar tras el terremoto del 24 de junio. Prioridad: salud y respuesta. ee.ifrc.org"
          : "Official registry to support after the June 24 earthquake. Priority: health and response. ee.ifrc.org",
      href: `${prefix}/voluntarios#cruz-roja-voluntarios`,
      extra: joinParts(
        RED_CROSS_VOLUNTEER_REGISTRY.displayUrl,
        "cruz roja voluntario salud respuesta ifrc"
      ),
      external: true,
    })
  );

  index.push(
    item({
      id: "vc-interpretes-idiomas",
      type: "page",
      title:
        locale === "es"
          ? "Intérpretes para ayuda médica internacional"
          : "Interpreters for international medical aid",
      description:
        locale === "es"
          ? "Se buscan intérpretes para apoyar ayuda médica del exterior. Grupo WhatsApp. Todas las profesiones bienvenidas."
          : "Interpreters sought to support medical aid from abroad. WhatsApp group. All professions welcome.",
      href: `${prefix}/voluntarios#interpretes-idiomas`,
      extra: joinParts(
        INTERPRETER_VOLUNTEER_GROUP.displayPath,
        "intérprete idiomas traductor ayuda médica internacional whatsapp voluntario"
      ),
      external: true,
    })
  );

  index.push(
    item({
      id: "vc-equipo-medico",
      type: "page",
      title:
        locale === "es"
          ? "Equipo médico hacia Caracas"
          : "Medical team to Caracas",
      description:
        locale === "es"
          ? "Estudiantes de medicina, médicos, paramédicos y enfermeros. Equipo de cuidado y rescate junto al Seguro Pastor Oropeza. Tel: 04246734655"
          : "Medical students, doctors, paramedics and nurses. Care and rescue team with Seguro Pastor Oropeza. Tel: 04246734655",
      href: `${prefix}/voluntarios#equipo-medico`,
      extra: joinParts(
        MEDICAL_VOLUNTEER_CALL.phone,
        "medicina médicos enfermeros paramédicos pastor oropeza caracas whatsapp"
      ),
    })
  );

  index.push(
    item({
      id: "vc-unefm-tucacas",
      type: "page",
      title:
        locale === "es"
          ? "Voluntariado UNEFM — Tucacas nos necesita"
          : "UNEFM volunteering — Tucacas needs us",
      description:
        locale === "es"
          ? "Estudiantes de medicina UNEFM movilizados para atención médica en Tucacas. Insumos: gasas, alcohol, medicinas, agua, guantes y alimentos."
          : "UNEFM medical students mobilized for medical care in Tucacas. Supplies: gauze, alcohol, medicine, water, gloves and food.",
      href: `${prefix}/voluntarios#unefm-tucacas`,
      extra: joinParts(
        "unefm tucacas falcón coro estudiantes medicina voluntariado donación insumos"
      ),
    })
  );

  index.push(
    item({
      id: "vc-acarigua-transporte",
      type: "page",
      title:
        locale === "es"
          ? "Transporte Acarigua → La Guaira (enfermería)"
          : "Transport Acarigua → La Guaira (nursing)",
      description:
        locale === "es"
          ? "Se necesita vehículo para personal de enfermería que apoyará en La Guaira. Tel: 0424-5290464"
          : "Vehicle needed for nursing staff supporting in La Guaira. Tel: 0424-5290464",
      href: `${prefix}/voluntarios#acarigua-transporte`,
      extra: joinParts(
        ACARIGUA_TRANSPORT_VOLUNTEER_CALL.phone,
        "acarigua guaira enfermeria transporte portuguesa whatsapp"
      ),
    })
  );

  index.push(
    item({
      id: "vc-carreras-gratis-acopio",
      type: "page",
      title:
        locale === "es"
          ? "Carreras gratis para llevar insumos a los acopios (Barquisimeto)"
          : "Free rides to take supplies to collection centers (Barquisimeto)",
      description:
        locale === "es"
          ? "Transporte gratuito de donaciones a los centros de acopio en Barquisimeto. Ronny Oviedo 0424-510-03-13 / Gabriela Arroyo 0412-892-61-26"
          : "Free transport of donations to collection centers in Barquisimeto. Ronny Oviedo 0424-510-03-13 / Gabriela Arroyo 0412-892-61-26",
      href: `${prefix}/voluntarios#carreras-gratis-acopio`,
      extra: joinParts(
        BARQUISIMETO_CARGO_TRANSPORT_CALL.phone,
        "carreras gratis transporte insumos acopio barquisimeto ronny oviedo gabriela arroyo whatsapp"
      ),
    })
  );

  index.push(
    item({
      id: "vc-lara-transporte",
      type: "page",
      title:
        locale === "es"
          ? "Traslado gratuito Lara → Caracas"
          : "Free transport Lara → Caracas",
      description:
        locale === "es"
          ? "Protección civil, bomberos, guardaparques y rescate de Lara. Vehículo gratuito hacia Caracas. Tel: 04245482543"
          : "Civil protection, firefighters, park rangers and rescue from Lara. Free vehicle to Caracas. Tel: 04245482543",
      href: `${prefix}/voluntarios#lara-transporte`,
      extra: joinParts(
        LARA_TRANSPORT_VOLUNTEER_CALL.phone,
        "lara caracas bomberos protección civil guardaparques rescate whatsapp"
      ),
    })
  );

  index.push(
    item({
      id: "vc-rescatistas",
      type: "page",
      title: rescuerTitle,
      description: rescuerDesc,
      href: `${prefix}/voluntarios#rescatistas`,
      extra: joinParts(
        RESCUER_VOLUNTEER_CALL.phone,
        "rescatista defensa civil barquisimeto yaracuy lara caracas guaira whatsapp"
      ),
    })
  );

  index.push(
    item({
      id: "missing-venevision",
      type: "page",
      title:
        locale === "es"
          ? "Venevisión — Reportar desaparecidos en TV"
          : "Venevisión — Report missing persons on TV",
      description:
        locale === "es"
          ? "Línea para reportar desaparecidos y difundirlos en pantalla. Incluir nombre, edad, foto y lugar. Tel: 0414-3109169"
          : "Line to report missing persons for on-air broadcast. Include name, age, photo and location. Tel: 0414-3109169",
      href: `${prefix}/desaparecidos#venevision`,
      extra: joinParts(VENEVISION_MISSING_LINE.phone, "venevision televisión whatsapp"),
    })
  );

  return index;
}

function scoreItem(item: SearchIndexItem, tokens: string[]): number {
  const text = item.searchText;
  let score = 0;
  for (const token of tokens) {
    if (item.title && normalize(item.title).includes(token)) score += 10;
    if (text.includes(token)) score += 3;
  }
  return score;
}

export function searchIndex(
  index: SearchIndexItem[],
  query: string,
  limit = 50
): SearchIndexItem[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tokens = normalize(trimmed)
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  if (!tokens.length) return [];

  return index
    .map((entry) => ({ entry, score: scoreItem(entry, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function groupResults(
  results: SearchIndexItem[],
  labels: Record<SearchResultType, string>
): { type: SearchResultType; label: string; items: SearchIndexItem[] }[] {
  const order: SearchResultType[] = [
    "emergency_number",
    "page",
    "help_center",
    "hospital",
    "shelter",
    "agency",
    "missing_person",
    "external_source",
    "external_link",
    "news",
    "resource",
  ];

  const grouped = new Map<SearchResultType, SearchIndexItem[]>();
  for (const result of results) {
    const list = grouped.get(result.type) ?? [];
    list.push(result);
    grouped.set(result.type, list);
  }

  return order
    .filter((type) => grouped.has(type))
    .map((type) => ({
      type,
      label: labels[type],
      items: grouped.get(type)!,
    }));
}
