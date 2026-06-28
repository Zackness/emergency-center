import type { HelpCenter } from "@/types";

const ACCEPTS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

const TIMESTAMP = "2026-06-27T16:00:00Z";

const CDMX_ANZURES_DESC =
  "Centro de acopio en Ciudad de México para enviar ayuda a Venezuela tras los terremotos del 24 de junio de 2026. Difundido en redes para recibir insumos humanitarios y equipo de apoyo a rescatistas (cascos, guantes, herramientas, linternas, material médico y artículos de primera necesidad). Confirma horario y necesidades al llegar.";

/** Acopio internacional — CDMX, colonia Anzures. */
export const CDMX_ACOPIO_CENTERS: HelpCenter[] = [
  {
    id: "103",
    name: "Centro de acopio CDMX — Anzures (ayuda a Venezuela)",
    description: CDMX_ANZURES_DESC,
    type: "community",
    state: "México",
    city: "Ciudad de México",
    address: "Calle Buffon 38, colonia Anzures, alcaldía Miguel Hidalgo, Ciudad de México",
    latitude: 19.4243,
    longitude: -99.1778,
    phone: null,
    email: null,
    schedule: "Confirmar horario en el punto de acopio",
    accepts: [...ACCEPTS],
    is_verified: false,
    is_active: true,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];
