export type SocialRegistryCategory = "pets" | "missing";

export interface SocialRegistry {
  id: string;
  slug: string;
  name: string;
  handle: string;
  instagram_url: string;
  whatsapp: string;
  whatsapp_intl: string;
  image_url: string;
  category: SocialRegistryCategory;
}

export const SOCIAL_REGISTRIES: SocialRegistry[] = [
  {
    id: "academia-leguau",
    slug: "academia-leguau",
    name: "Academia Leguau",
    handle: "@academialeguau",
    instagram_url: "https://www.instagram.com/academialeguau/",
    whatsapp: "0424-159-65-90",
    whatsapp_intl: "584241596590",
    image_url: "/images/pets/academia-leguau-terremoto.jpg",
    category: "pets",
  },
];

export function getSocialRegistries(category?: SocialRegistryCategory) {
  if (!category) return SOCIAL_REGISTRIES;
  return SOCIAL_REGISTRIES.filter((r) => r.category === category);
}
