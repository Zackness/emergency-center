/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly DATABASE_URL: string;
  readonly DIRECT_URL: string;
  /** "true" habilita formularios públicos que escriben en la BD (solo servidor). */
  readonly ALLOW_PUBLIC_WRITES?: string;
  readonly SYNC_SECRET?: string;
  readonly SUPABASE_SECRET_KEY?: string;
  readonly TERREMOTO_VZLA_SUPABASE_URL?: string;
  readonly TERREMOTO_VZLA_SUPABASE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
