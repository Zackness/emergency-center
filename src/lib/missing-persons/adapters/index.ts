import { venezuelaTeBuscaAdapter } from "@/lib/missing-persons/adapters/venezuela-te-busca";
import { encuentralosAdapter } from "@/lib/missing-persons/adapters/encuentralos";
import { terremotoVenezuelaAppAdapter } from "@/lib/missing-persons/adapters/terremotovenezuela-app";
import type { SourceAdapter } from "@/lib/missing-persons/types";

export const SOURCE_ADAPTERS: SourceAdapter[] = [
  venezuelaTeBuscaAdapter,
  encuentralosAdapter,
  terremotoVenezuelaAppAdapter,
];

export function getAdapter(slug: string): SourceAdapter | undefined {
  return SOURCE_ADAPTERS.find((a) => a.slug === slug);
}
