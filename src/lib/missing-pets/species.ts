export type MissingPetSpecies = "dog" | "cat" | "other";

const DOG_RE =
  /\b(perro|perra|perritos?|perritas?|cachorros?|cachorras?|canin[oa]s?|pitbull|golden\s*retriever|labrador|husky|chihuahua|poodle|beagle|rottweiler|dog)\b/i;

const CAT_RE =
  /\b(gato|gata|gatitos?|gatitas?|michi|michu|neko|felin[oa]s?|siam[eo]s?|persa|carey|cat)\b/i;

export function inferPetSpecies(fields: {
  name?: string | null;
  location?: string | null;
  distinctive_marks?: string | null;
  breed?: string | null;
}): MissingPetSpecies {
  const text = [fields.name, fields.location, fields.distinctive_marks, fields.breed]
    .filter(Boolean)
    .join(" ");

  if (CAT_RE.test(text)) return "cat";
  if (DOG_RE.test(text)) return "dog";
  return "other";
}

export async function fetchPetSpeciesFromDetail(externalId: string): Promise<MissingPetSpecies | null> {
  try {
    const response = await fetch(`https://www.huellascan.com/terremoto/${externalId}`, {
      headers: {
        "User-Agent": "EmergencyCenter/1.0 (+https://emergency-center.local)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return null;
    const html = await response.text();
    const match =
      html.match(/pet_type&quot;:&quot;(dog|cat|other)&quot;/) ??
      html.match(/"pet_type":"(dog|cat|other)"/);
    return (match?.[1] as MissingPetSpecies | undefined) ?? null;
  } catch {
    return null;
  }
}

export function resolvePetSpecies(
  fields: {
    name: string;
    location: string;
    distinctive_marks: string | null;
    breed?: string | null;
    pet_type?: MissingPetSpecies | null;
  },
  preferStored = true
): MissingPetSpecies {
  if (preferStored && fields.pet_type) return fields.pet_type;
  return inferPetSpecies(fields);
}
