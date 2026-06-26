#!/usr/bin/env npx tsx
/**
 * Sincroniza el catálogo nacional de hospitales y clínicas a Supabase.
 *
 * Usa la API REST (HTTPS) con la clave de servicio, por lo que funciona
 * aunque los puertos de Postgres (5432/6543) estén bloqueados.
 *
 * Deduplica por nombre normalizado: no vuelve a insertar hospitales que ya
 * existen en la base (p. ej. los registros verificados de HUC y Vargas).
 *
 * Uso:
 *   npm run sync:hospitals
 *   npm run sync:hospitals -- --dry-run
 */
import { VENEZUELA_HOSPITALS, HOSPITALS_TOTAL_COUNT } from "@/data/hospitals";

function loadEnv() {
  try {
    // Node 20.12+: carga variables desde .env sin dependencias externas.
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    // .env ausente o ya cargado; continuamos con el entorno existente.
  }
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const BATCH_SIZE = 500;

async function main() {
  loadEnv();

  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    console.error(
      "Faltan PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env. No se puede sincronizar."
    );
    process.exit(1);
  }

  const restUrl = `${url.replace(/\/$/, "")}/rest/v1/hospitals`;
  const baseHeaders = {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };

  console.log(`Catálogo local: ${HOSPITALS_TOTAL_COUNT} centros.`);

  const existingNames = new Set<string>();
  let offset = 0;
  const pageSize = 1000;
  for (;;) {
    const res = await fetch(`${restUrl}?select=name`, {
      headers: {
        ...baseHeaders,
        Range: `${offset}-${offset + pageSize - 1}`,
        "Range-Unit": "items",
      },
    });
    if (!res.ok) {
      console.error(`Error leyendo hospitales existentes: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    const data = (await res.json()) as { name: string }[];
    if (!data.length) break;
    for (const row of data) existingNames.add(normalizeName(row.name));
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`En la base ya hay ${existingNames.size} hospitales.`);

  const toInsert = VENEZUELA_HOSPITALS.filter(
    (h) => !existingNames.has(normalizeName(h.name))
  ).map((h) => ({
    name: h.name,
    state: h.state,
    city: h.city,
    address: h.address,
    latitude: h.latitude,
    longitude: h.longitude,
    phone: h.phone,
    status: h.status,
    services: h.services,
    notes: h.notes,
    social_links: h.social_links,
    is_verified: h.is_verified,
    is_active: h.is_active,
  }));

  const skipped = VENEZUELA_HOSPITALS.length - toInsert.length;
  console.log(`Nuevos por insertar: ${toInsert.length} (omitidos por duplicado: ${skipped}).`);

  if (dryRun) {
    console.log("Modo --dry-run: no se insertó nada.");
    return;
  }

  let inserted = 0;
  const errors: string[] = [];

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const batchNum = i / BATCH_SIZE + 1;
    const res = await fetch(restUrl, {
      method: "POST",
      headers: { ...baseHeaders, Prefer: "return=minimal" },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const detail = await res.text();
      errors.push(`Lote ${batchNum}: ${res.status} ${detail}`);
      console.error(`  ✗ Lote ${batchNum} falló: ${res.status} ${detail}`);
    } else {
      inserted += batch.length;
      console.log(`  ✓ Lote ${batchNum}: ${batch.length} insertados (acumulado ${inserted}).`);
    }
  }

  const countRes = await fetch(`${restUrl}?select=id`, {
    method: "HEAD",
    headers: { ...baseHeaders, Prefer: "count=exact", "Range-Unit": "items", Range: "0-0" },
  });
  const contentRange = countRes.headers.get("content-range");
  const total = contentRange?.split("/")?.[1] ?? "?";

  console.log("\nResumen:");
  console.log(`  Insertados: ${inserted}`);
  console.log(`  Omitidos (duplicados): ${skipped}`);
  console.log(`  Total en la base ahora: ${total}`);
  if (errors.length) {
    console.log(`  Errores (${errors.length}):`, errors.slice(0, 5));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
