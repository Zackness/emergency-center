export interface PetVeterinaryAid {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  handle: string;
  instagram_url: string;
  phone: string;
  phone_intl: string;
  image_url: string;
}

export const PET_VETERINARY_AID: PetVeterinaryAid[] = [
  {
    id: "vetcity-maracay",
    slug: "vetcity-maracay",
    name: "VETCITY",
    city: "Maracay",
    state: "Aragua",
    handle: "@vetcity.mcy",
    instagram_url: "https://www.instagram.com/vetcity.mcy/",
    phone: "0424-3414790",
    phone_intl: "584243414790",
    image_url: "/images/pets/vetcity-maracay.jpg",
  },
];

export function getPetVeterinaryAid(slug?: string) {
  if (!slug) return PET_VETERINARY_AID;
  return PET_VETERINARY_AID.filter((s) => s.slug === slug);
}
