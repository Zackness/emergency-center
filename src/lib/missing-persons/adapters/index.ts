import { venezuelaTeBuscaAdapter } from "@/lib/missing-persons/adapters/venezuela-te-busca";
import { encuentralosAdapter } from "@/lib/missing-persons/adapters/encuentralos";
import type { SourceAdapter } from "@/lib/missing-persons/types";

export const SOURCE_ADAPTERS: SourceAdapter[] = [
  venezuelaTeBuscaAdapter,
  encuentralosAdapter,
];

export function getAdapter(slug: string): SourceAdapter | undefined {
  return SOURCE_ADAPTERS.find((a) => a.slug === slug);
}
