import type { MissingPet } from "./types";
import { inferPetState } from "./huellascan";

export function importedToMissingPet(item: {
  externalId: string;
  name: string;
  status: "lost" | "found";
  location: string;
  distinctive_marks: string | null;
  contact_phone: string | null;
  photo_url: string | null;
  syncedAt: string;
}): MissingPet {
  const { city, state } = inferPetState(item.location);
  const now = item.syncedAt;
  return {
    id: `pet-huellascan-${item.externalId}`,
    name: item.name,
    status: item.status,
    location: item.location,
    city,
    state,
    distinctive_marks: item.distinctive_marks,
    contact_phone: item.contact_phone,
    photo_url: item.photo_url,
    source_name: "HuellasCAN — Terremoto",
    source_url: `https://www.huellascan.com/terremoto/${item.externalId}`,
    external_id: item.externalId,
    reported_at: now,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
}
