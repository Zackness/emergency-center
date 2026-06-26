export interface VolunteerCall {
  id: string;
  slug: string;
  image_url: string | null;
  phone?: string;
  whatsapp?: string;
  target_regions: string[];
  deployment_regions: string[];
  professions: string[];
}

export const RESCUER_VOLUNTEER_CALL: VolunteerCall = {
  id: "rescatistas-lara-yaracuy",
  slug: "rescatistas",
  image_url: "/images/volunteers/convocatoria-rescatistas.jpg",
  phone: "04125459833",
  whatsapp: "584125459833",
  target_regions: ["Barquisimeto", "Yaracuy", "Lara"],
  deployment_regions: ["Caracas", "La Guaira"],
  professions: ["rescatista", "defensa civil"],
};

/** Transporte Acarigua → La Guaira para personal de enfermería. */
export const ACARIGUA_TRANSPORT_VOLUNTEER_CALL: VolunteerCall = {
  id: "acarigua-transporte-guaira",
  slug: "acarigua-transporte",
  image_url: "/images/volunteers/transporte-acarigua-guaira.png",
  phone: "0424-5290464",
  whatsapp: "584245290464",
  target_regions: ["Acarigua", "Portuguesa"],
  deployment_regions: ["La Guaira"],
  professions: ["enfermería", "personal de salud"],
};

/** Carreras gratis para trasladar insumos a los centros de acopio en Barquisimeto. */
export const BARQUISIMETO_CARGO_TRANSPORT_CALL: VolunteerCall = {
  id: "carreras-gratis-acopio-barquisimeto",
  slug: "carreras-gratis-acopio",
  image_url: "/images/volunteers/carreras-gratis-barquisimeto.png",
  phone: "04245100313",
  whatsapp: "584128926126",
  target_regions: ["Barquisimeto", "Lara"],
  deployment_regions: ["Barquisimeto"],
  professions: ["transporte", "logística"],
};

/** Traslado gratuito Lara → Caracas para personal de emergencia. */
export const LARA_TRANSPORT_VOLUNTEER_CALL: VolunteerCall = {
  id: "lara-transporte-caracas",
  slug: "lara-transporte",
  image_url: "/images/volunteers/coordinacion-lara-caracas.png",
  phone: "04245482543",
  whatsapp: "584245482543",
  target_regions: ["Lara"],
  deployment_regions: ["Caracas"],
  professions: [
    "protección civil",
    "bomberos",
    "guardaparques",
    "grupos de rescate",
  ],
};

/** Equipo médico que viajará a Caracas junto al Seguro Pastor Oropeza. */
export const MEDICAL_VOLUNTEER_CALL: VolunteerCall = {
  id: "equipo-medico-pastor-oropeza",
  slug: "equipo-medico",
  image_url: null,
  phone: "04246734655",
  whatsapp: "584246734655",
  target_regions: ["Lara"],
  deployment_regions: ["Caracas"],
  professions: [
    "estudiantes de medicina",
    "médicos",
    "paramédicos",
    "enfermeros",
  ],
};

/** Estudiantes UNEFM — voluntariado y donación de insumos para Tucacas. */
export const UNEFM_TUCACAS_VOLUNTEER_CALL: VolunteerCall = {
  id: "unefm-tucacas-voluntariado",
  slug: "unefm-tucacas",
  image_url: "/images/volunteers/unefm-voluntariado-tucacas.png",
  target_regions: ["UNEFM", "Coro", "Falcón"],
  deployment_regions: ["Tucacas", "Falcón"],
  professions: ["estudiantes de medicina", "voluntarios", "donantes"],
};

export const VOLUNTEER_CALLS = [
  MEDICAL_VOLUNTEER_CALL,
  UNEFM_TUCACAS_VOLUNTEER_CALL,
  ACARIGUA_TRANSPORT_VOLUNTEER_CALL,
  RESCUER_VOLUNTEER_CALL,
  LARA_TRANSPORT_VOLUNTEER_CALL,
  BARQUISIMETO_CARGO_TRANSPORT_CALL,
] as const;
