#!/usr/bin/env npx tsx
/**
 * Dispara sync de desaparecidos en el sitio desplegado (Vercel).
 * Útil cuando DATABASE_URL / pooler :6543 no es alcanzable desde tu PC.
 *
 * Requiere en .env:
 *   SYNC_SECRET
 *   PUBLIC_SITE_URL=https://tu-dominio.vercel.app
 *
 * Uso:
 *   npm run sync:missing:remote
 *   npm run sync:missing:remote -- --source=venezuela-te-busca
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

  const base = siteBaseUrl();
  const body: Record<string, unknown> = { fetchAll: true };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--source=")) {
      body.sourceSlugs = arg.replace("--source=", "").split(",");
      delete body.fetchAll;
    }
    if (arg === "--quick") body.limit = 500;
  }

  const url = `${base}/api/missing-persons/sync`;
  console.log(`POST ${url}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
