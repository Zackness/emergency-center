const DEFAULT_SUPABASE_URL = "https://hqoirxajavaaasvdfjoy.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_4qdzpICdtyX6N_XqiVmuYw_Jv_zYvOq";

export const RED_ESPERANZA_SITE_URL = "https://red-de-esperanza-lime.vercel.app/";

export function getRedEsperanzaConfig() {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  const baseUrl =
    env?.RED_ESPERANZA_SUPABASE_URL ??
    process.env.RED_ESPERANZA_SUPABASE_URL ??
    DEFAULT_SUPABASE_URL;
  const apiKey =
    env?.RED_ESPERANZA_SUPABASE_KEY ??
    process.env.RED_ESPERANZA_SUPABASE_KEY ??
    DEFAULT_SUPABASE_KEY;
  return { baseUrl, apiKey };
}
