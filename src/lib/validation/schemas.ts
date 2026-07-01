import { z } from "zod";
import {
  sanitizeAge,
  sanitizeEmail,
  sanitizeLatitude,
  sanitizeLongitude,
  sanitizeNationalId,
  sanitizePhone,
  sanitizeStorageImageUrl,
  sanitizeText,
  sanitizeUrl,
  sanitizeVoterToken,
} from "@/lib/sanitize";

const text = (max: number) =>
  z
    .unknown()
    .transform((v) => sanitizeText(v, max))
    .refine((v): v is string => v !== null, "Campo requerido");

const optionalText = (max: number) =>
  z
    .unknown()
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null ? null : sanitizeText(v, max)));

const email = () =>
  z
    .unknown()
    .transform((v) => sanitizeEmail(v))
    .refine((v): v is string => v !== null, "Email inválido");

const optionalEmail = () =>
  z
    .unknown()
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null ? null : sanitizeEmail(v)));

const phone = () =>
  z
    .unknown()
    .transform((v) => sanitizePhone(v))
    .refine((v): v is string => v !== null, "Teléfono inválido");

const optionalPhone = () =>
  z
    .unknown()
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null ? null : sanitizePhone(v)));

const url = () =>
  z
    .unknown()
    .transform((v) => sanitizeUrl(v))
    .refine((v): v is string => v !== null, "URL inválida");

const optionalUrl = () =>
  z
    .unknown()
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null ? null : sanitizeUrl(v)));

const storageImageUrl = () =>
  z
    .unknown()
    .transform((v) => sanitizeStorageImageUrl(v))
    .refine((v): v is string => v !== null, "URL de imagen inválida");

const latitude = () =>
  z
    .unknown()
    .transform((v) => sanitizeLatitude(v))
    .refine((v): v is number => v !== null, "Latitud inválida");

const longitude = () =>
  z
    .unknown()
    .transform((v) => sanitizeLongitude(v))
    .refine((v): v is number => v !== null, "Longitud inválida");

const optionalAge = () =>
  z
    .unknown()
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null || v === "" ? null : sanitizeAge(v)));

const optionalNationalId = () =>
  z
    .unknown()
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null ? null : sanitizeNationalId(v)));

const voterToken = () =>
  z
    .unknown()
    .transform((v) => sanitizeVoterToken(v))
    .refine((v): v is string => v !== null, "Token de votante inválido");

export const missingPersonSchema = z.object({
  full_name: text(200),
  national_id: optionalNationalId(),
  age: optionalAge(),
  gender: optionalText(30),
  state: text(80),
  city: text(80),
  last_seen_location: optionalText(300),
  last_seen_at: optionalText(40),
  description: optionalText(2000),
  photo_url: optionalUrl(),
  contact_name: text(120),
  contact_phone: phone(),
  contact_email: optionalEmail(),
  external_source_slug: optionalText(80),
  external_url: optionalUrl(),
});

export const damageReportSchema = z.object({
  title: text(200),
  severity: z.enum(["collapsed", "damaged", "evacuated"]).optional().default("damaged"),
  state: text(80),
  city: text(80),
  address: optionalText(300),
  latitude: latitude(),
  longitude: longitude(),
  description: optionalText(2000),
  reporter_name: optionalText(120),
  reporter_contact: optionalPhone(),
  source_name: optionalText(120),
  source_url: optionalUrl(),
});

export const companyRegistrationSchema = z.object({
  companyName: text(200),
  contactName: text(120),
  phone: phone(),
  email: email(),
  state: text(80),
  city: text(80),
  resources: z
    .array(z.string())
    .min(1, "Selecciona al menos un recurso")
    .max(20)
    .transform((arr) =>
      arr
        .map((r) => sanitizeText(r, 100))
        .filter((r): r is string => r !== null)
    ),
  description: optionalText(2000),
});

export const volunteerRegistrationSchema = z.object({
  name: text(120),
  city: text(80),
  state: text(80),
  profession: text(120),
  specialty: optionalText(120),
  vehicle: optionalText(80),
  availability: text(200),
  phone: phone(),
  email: email(),
  location: optionalText(200),
  notes: optionalText(1000),
  help_center_id: optionalText(40),
});

export const newsSubmissionSchema = z.object({
  title: text(200),
  summary: text(1000),
  source: text(120),
  source_url: url(),
});

export const featureSuggestionSchema = z.object({
  title: text(200),
  description: text(2000),
  category: optionalText(80),
  contact_name: optionalText(120),
  contact_email: optionalEmail(),
});

const HELP_CATEGORIES = [
  "estructural",
  "salud",
  "transporte",
  "oficios",
  "alimentos",
  "alojamiento",
  "negocio",
  "exterior",
  "mascotas",
  "comunicacion",
  "materiales",
] as const;

export const communityHelpSchema = z.object({
  kind: z.enum(["offer", "request"]),
  title: text(60),
  description: optionalText(280),
  category: z.enum(HELP_CATEGORIES).optional().nullable(),
  state: text(80),
  city: text(80),
  zone: optionalText(120),
  contact_name: text(120),
  contact_phone: phone(),
});

const COMMUNITY_CONTENT_TYPES = [
  "help_center",
  "hospital",
  "shelter",
  "agency",
  "damage_report",
  "missing_person",
  "news",
  "solidarity_company",
  "external_link",
] as const;

export const communityVoteSchema = z.object({
  content_type: z.enum(COMMUNITY_CONTENT_TYPES),
  content_id: z.unknown().transform((v) => String(v).trim().slice(0, 64)),
  verdict: z.enum(["credible", "false"]),
  voter_token: voterToken(),
});

export const communityCommentSchema = z.object({
  content_type: z.enum(COMMUNITY_CONTENT_TYPES),
  content_id: z.unknown().transform((v) => String(v).trim().slice(0, 64)),
  body: z
    .unknown()
    .transform((v) => sanitizeText(v, 2000))
    .refine((v): v is string => v !== null && v.length >= 3, "Comentario demasiado corto")
    .refine((v) => v.length <= 2000, "Comentario demasiado largo"),
  author_name: optionalText(120),
  voter_token: z
    .unknown()
    .optional()
    .nullable()
    .transform((v) => (v === undefined || v === null ? null : sanitizeVoterToken(v))),
});

const HELP_CENTER_TYPES = ["church", "community", "university", "government", "ngo"] as const;

export const helpCenterRegistrationSchema = z
  .object({
    registration_type: z.enum(["own", "third_party"]),
    name: text(200),
    description: optionalText(2000),
    type: z.enum(HELP_CENTER_TYPES),
    state: text(80),
    city: text(80),
    address: text(300),
    latitude: latitude(),
    longitude: longitude(),
    phone: optionalPhone(),
    email: optionalEmail(),
    schedule: optionalText(200),
    accepts: z.array(z.string()).min(1, "Selecciona al menos un tipo de donación"),
    reporter_name: optionalText(120),
    reporter_phone: optionalPhone(),
    image_url: storageImageUrl(),
  })
  .refine(
    (data) => data.registration_type !== "third_party" || Boolean(data.reporter_name),
    { message: "Nombre del reportante requerido", path: ["reporter_name"] }
  );
