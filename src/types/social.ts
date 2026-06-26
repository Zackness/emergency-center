export type SocialPlatform =
  | "instagram"
  | "twitter"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "whatsapp"
  | "telegram";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  handle?: string | null;
}

export function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];

  const allowed: SocialPlatform[] = [
    "instagram",
    "twitter",
    "facebook",
    "youtube",
    "tiktok",
    "whatsapp",
    "telegram",
  ];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.platform !== "string" || typeof record.url !== "string") return [];
    if (!allowed.includes(record.platform as SocialPlatform)) return [];
    return [
      {
        platform: record.platform as SocialPlatform,
        url: record.url,
        handle: typeof record.handle === "string" ? record.handle : null,
      },
    ];
  });
}
