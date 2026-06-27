function extractRefFromSupabaseUrl(url: string): string | null {
  const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

function databaseUrlTargetsRef(databaseUrl: string, projectRef: string): boolean {
  return (
    databaseUrl.includes(projectRef) ||
    databaseUrl.includes(`db.${projectRef}.supabase.co`) ||
    databaseUrl.includes(`postgres.${projectRef}`)
  );
}

/** Ref del proyecto Supabase de producción (desde env, no hardcodeado en git). */
export function getConfiguredProductionRef(): string | null {
  const explicit = process.env.SUPABASE_PROJECT_REF?.trim();
  if (explicit) return explicit;

  return extractRefFromSupabaseUrl(process.env.PUBLIC_SUPABASE_URL ?? "");
}

/**
 * Bloquea scripts locales que apuntan a la BD de producción sin confirmación explícita.
 * Los contribuidores deben usar su propio proyecto Supabase.
 */
export function assertSafeDatabaseTarget(context: string): void {
  if (process.env.CONFIRM_PRODUCTION_DB === "1") return;

  const productionRef = getConfiguredProductionRef();
  if (!productionRef) return;

  const databaseUrl = process.env.DATABASE_URL ?? "";
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? "";

  const targetsProduction =
    databaseUrlTargetsRef(databaseUrl, productionRef) ||
    databaseUrlTargetsRef(supabaseUrl, productionRef);

  if (!targetsProduction) return;

  console.error(
    `[db-guard] ${context}: escritura bloqueada contra producción (${productionRef}).`
  );
  console.error(
    "Tu .env apunta al Supabase de producción. Opciones:"
  );
  console.error(
    "  1) Usar tu propio proyecto Supabase en .env (recomendado para desarrollo)"
  );
  console.error(
    "  2) Si es intencional escribir en producción: CONFIRM_PRODUCTION_DB=1 npm run sync:missing"
  );
  console.error(
    "  3) Disparar sync en el sitio desplegado: npm run sync:missing:remote"
  );
  process.exit(1);
}
