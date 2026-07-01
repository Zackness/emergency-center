import { getVzlaAyudaSnapshot } from "@/data/vzlayuda-resources";
import { DATA_CACHE_SLUGS, getDataCache } from "@/lib/data-cache";
import type { VzlaAyudaSnapshot } from "./types";

/** Recalcula totales desde el arreglo de avisos (evita counts desincronizados en caché). */
export function withComputedVzlaAyudaCounts(snapshot: VzlaAyudaSnapshot): VzlaAyudaSnapshot {
  const avisos = snapshot.avisos ?? [];
  const oferta = avisos.filter((a) => a.tipo === "oferta").length;
  const solicitud = avisos.filter((a) => a.tipo === "solicitud").length;
  return {
    ...snapshot,
    avisos,
    counts: { oferta, solicitud, total: avisos.length },
  };
}

export async function fetchVzlaAyudaSnapshotFeed(): Promise<VzlaAyudaSnapshot> {
  const cached = await getDataCache<VzlaAyudaSnapshot>(DATA_CACHE_SLUGS.VZLAYUDA_AVISOS);
  if (cached?.payload?.avisos?.length) {
    return withComputedVzlaAyudaCounts({
      ...cached.payload,
      fetched_at: cached.payload.fetched_at ?? cached.fetched_at,
    });
  }
  return withComputedVzlaAyudaCounts(getVzlaAyudaSnapshot());
}
