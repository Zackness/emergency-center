import type { HelpCenter } from "@/types";

export const BOMBEROS_VALENCIA_SOURCE = "https://www.bomberosvalencia.gob.ve";

export const BOMBEROS_VALENCIA_ACOPIO_DESC =
  "Centro de acopio habilitado en la Estación Central del Instituto Autónomo Municipal Cuerpo de Bomberos de Valencia (IAMCBV), sede principal en Zona Industrial Municipal Norte. Recibe donaciones de insumos para emergencia y terremoto: agua, alimentos no perecederos, medicinas, material médico, linternas, pilas, guantes, herramientas y artículos de higiene. Coordinación oficial de bomberos municipales. Emergencias: 911. Fuente: bomberosvalencia.gob.ve.";

const ACCEPTS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

const TIMESTAMP = "2026-06-28T12:00:00Z";

/** Estación Central Tcnel. (B) Rafael Anselmo Mújica Muñoz — sede principal IAM Bomberos Valencia. */
export const BOMBEROS_VALENCIA_ACOPIO_CENTERS: HelpCenter[] = [
  {
    id: "104",
    name: "Bomberos de Valencia — Centro de acopio (sede principal)",
    description: BOMBEROS_VALENCIA_ACOPIO_DESC,
    type: "government",
    state: "Carabobo",
    city: "Valencia",
    address:
      "Estación Central Tcnel. (B) Rafael Anselmo Mújica Muñoz, Zona Industrial Municipal Norte, Av. Ernesto L. Branger (Av. 61), Parroquia Rafael Urdaneta, Valencia",
    latitude: 10.1958,
    longitude: -67.9514,
    phone: "0241-8324615",
    email: null,
    schedule: "Confirmar horario de recepción de donaciones en sitio · Emergencias 911",
    accepts: [...ACCEPTS],
    is_verified: true,
    is_active: true,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];
