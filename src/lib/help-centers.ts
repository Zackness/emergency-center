import type { HelpCenter } from "@/types";

const PLACEHOLDER = "/images/help-centers/placeholder.svg";

export function getHelpCenterImages(center: HelpCenter): string[] {
  if (center.image_urls?.length) return center.image_urls;
  if (center.image_url) return [center.image_url];
  return [PLACEHOLDER];
}
