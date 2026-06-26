import { venezuelaTeBuscaAdapter } from "@/lib/missing-persons/adapters/venezuela-te-busca";
import { encuentralosAdapter } from "@/lib/missing-persons/adapters/encuentralos";
import { terremotoVenezuelaAppAdapter } from "@/lib/missing-persons/adapters/terremotovenezuela-app";
import { venezuelaReportaAdapter } from "@/lib/missing-persons/adapters/venezuela-reporta";
import { desaparecidosTerremotoAdapter } from "@/lib/missing-persons/adapters/desaparecidos-terremoto";
import type { SourceAdapter } from "@/lib/missing-persons/types";

export const SOURCE_ADAPTERS: SourceAdapter[] = [
  venezuelaTeBuscaAdapter,
  encuentralosAdapter,
  terremotoVenezuelaAppAdapter,
  venezuelaReportaAdapter,
  desaparecidosTerremotoAdapter,
];

export function getAdapter(slug: string): SourceAdapter | undefined {
  return SOURCE_ADAPTERS.find((a) => a.slug === slug);
}
