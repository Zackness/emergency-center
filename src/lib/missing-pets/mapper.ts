import type { MissingPet, MissingPetSpecies } from "./types";
import { inferPetState } from "./huellascan";
import { resolvePetSpecies } from "./species";

export function importedToMissingPet(item: {
  externalId: string;
  name: string;
  status: "lost" | "found";
  location: string;
  distinctive_marks: string | null;
  contact_phone: string | null;
  photo_url: string | null;
  breed?: string | null;
  pet_type?: MissingPetSpecies | null;
  syncedAt: string;
}): MissingPet {
  const { city, state } = inferPetState(item.location);
  const now = item.syncedAt;
  return {
    id: `pet-huellascan-${item.externalId}`,
    name: item.name,
    status: item.status,
    species: resolvePetSpecies({
      name: item.name,
      location: item.location,
      distinctive_marks: item.distinctive_marks,
      breed: item.breed ?? null,
      pet_type: item.pet_type ?? null,
    }),
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
