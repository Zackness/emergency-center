import { RED_AYUDA_NINOS } from "@/data/children-emergency";

const LIST_URL = "https://redayudavenezuela.com/api/ninos/list";
const FETCH_TIMEOUT_MS = 30_000;

export interface RedAyudaNinoCaso {
  id: string;
  protegido: boolean;
  codigo: string | null;
  edad: string | null;
  estado_custodia: string | null;
  created_at: string;
  title: string;
  photo_url: string | null;
}

interface RedAyudaListResponse {
  ok?: boolean;
  casos?: RedAyudaNinoCaso[];
  error?: string;
}

export async function fetchRedAyudaNinosRecords(): Promise<RedAyudaNinoCaso[]> {
  const res = await fetch(LIST_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
      "User-Agent": "EmergencyCenter/1.0 (+https://github.com/Zackness/emergency-center)",
    },
    body: JSON.stringify({ code: "" }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  const data = (await res.json()) as RedAyudaListResponse;
  if (!res.ok) {
    throw new Error(data.error ?? `Red Ayuda ninos/list ${res.status}`);
  }

  return (data.casos ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export const REDAYUDA_NINOS_SOURCE = {
  name: RED_AYUDA_NINOS.organization,
  url: RED_AYUDA_NINOS.url,
} as const;
