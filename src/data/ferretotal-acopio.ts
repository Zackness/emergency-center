import type { HelpCenter } from "@/types";

/** Listado comunitario post-terremoto 24 jun 2026: venezuelareporta.org/recursos */
export const FERRETOTAL_ACOPIO_SOURCE = "https://venezuelareporta.org/recursos";

export const FERRETOTAL_ACOPIO_DESC =
  "Ferretotal (@ferretotaloficial) habilitó la sede La Trinidad como centro de acopio tras el terremoto del 24 de junio de 2026. Recibe donaciones para canalizar ayuda a zonas afectadas — prioridad en herramientas de rescate, linternas, pilas, guantes y material ferretero, además de agua, alimentos no perecederos e insumos médicos. Listado en venezuelareporta.org; difundido en compilaciones de recursos de emergencia en redes (incl. @thefaria). Confirmar horarios y logística en Instagram @ferretotaloficial.";

const ACCEPTS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

const TIMESTAMP = "2026-06-27T14:00:00Z";

/** Sede La Trinidad — punto de acopio reportado para la emergencia sísmica. */
export const FERRETOTAL_ACOPIO_CENTERS: HelpCenter[] = [
  {
    id: "102",
    name: "Ferretotal La Trinidad — Centro de acopio",
    description: FERRETOTAL_ACOPIO_DESC,
    type: "community",
    state: "Miranda",
    city: "La Trinidad",
    address:
      "Av. Intercomunal La Trinidad–El Hatillo, Granjerías de la Trinidad, etapa Pie de Monte, sector H (200 m después del Centro Médico Docente, mano derecha), Baruta",
    latitude: 10.4275,
    longitude: -66.8645,
    phone: "0212-9422888",
    email: null,
    schedule: "Lun–Sáb 8:30 a.m.–7:00 p.m. (confirmar en @ferretotaloficial)",
    accepts: [...ACCEPTS],
    is_verified: false,
    is_active: true,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];
