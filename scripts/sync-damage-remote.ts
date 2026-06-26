#!/usr/bin/env npx tsx
/**
 * Dispara sync del mapa de daños en el sitio desplegado (Vercel).
 * Útil si prefieres que el servidor ejecute Prisma directamente.
 *
 * Requiere: SYNC_SECRET, PUBLIC_SITE_URL
 *
 * Uso: npm run sync:damage:remote
 */
function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

function siteBaseUrl(): string {
  const explicit = process.env.PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  throw new Error("Define PUBLIC_SITE_URL en .env (URL del sitio en Vercel).");
}

async function main() {
  loadEnv();

  const secret = process.env.SYNC_SECRET;
  if (!secret) {
    console.error("Falta SYNC_SECRET en .env");
    process.exit(1);
  }

  const url = `${siteBaseUrl()}/api/damage-reports/sync`;
  console.log(`POST ${url}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, text);
    process.exit(1);
  }

  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
