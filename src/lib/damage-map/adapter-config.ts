const DEFAULT_SUPABASE_URL = "https://jckifxsdlnsvbztxydes.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_i7iEDrCVZcSt0k3RGFrY4g_WrtZBB4w";

export function getTerremotoVzlaConfig() {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  const baseUrl =
    env?.TERREMOTO_VZLA_SUPABASE_URL ??
    process.env.TERREMOTO_VZLA_SUPABASE_URL ??
    DEFAULT_SUPABASE_URL;
  const apiKey =
    env?.TERREMOTO_VZLA_SUPABASE_KEY ??
    process.env.TERREMOTO_VZLA_SUPABASE_KEY ??
    DEFAULT_SUPABASE_KEY;
  return { baseUrl, apiKey };
}

export const DAMAGE_MAP_EXTERNAL_SOURCE = "terremotovenezuela" as const;
