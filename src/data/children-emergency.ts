import { getRedAyudaSnapshot } from "@/data/redayuda-resources";
import { NINOS_DE_PIE } from "@/data/ninos-de-pie";

export const NEXOSIGNAL_NINOS = {
  id: "nexosignal-ninos-de-pie",
  organization: NINOS_DE_PIE.organization,
  url: NINOS_DE_PIE.url,
  domain: NINOS_DE_PIE.domain,
  reportUrl: `${NINOS_DE_PIE.url}#reportar`,
} as const;

export const RED_AYUDA_NINOS = {
  id: "red-ayuda-ninos",
  organization: "Red Ayuda Venezuela",
  url: "https://redayudavenezuela.com/ninos",
  platformUrl: "https://redayudavenezuela.com",
} as const;

export function getChildrenEmergencyStats() {
  const snapshot = getRedAyudaSnapshot();
  return {
    redAyudaChildren: snapshot.ninos,
    redAyudaReports: snapshot.denuncias,
    fetchedAt: snapshot.fetched_at,
  };
}
