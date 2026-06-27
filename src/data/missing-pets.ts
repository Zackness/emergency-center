import type { MissingPet } from "@/lib/missing-pets/types";
import snapshot from "@/data/missing-pets.json";
import { importedToMissingPet } from "@/lib/missing-pets/mapper";

const data = snapshot as {
  source: string;
  fetched_at: string;
  count: number;
  items: Array<{
    externalId: string;
    name: string;
    status: "lost" | "found";
    location: string;
    distinctive_marks: string | null;
    contact_phone: string | null;
    photo_url: string | null;
    breed?: string | null;
    pet_type?: "dog" | "cat" | "other" | null;
  }>;
};

/** Copia local sincronizada desde HuellasCAN (npm run fetch:pets). */
export const LOCAL_MISSING_PETS: MissingPet[] = (data.items ?? []).map((item) =>
  importedToMissingPet({ ...item, syncedAt: data.fetched_at })
);
