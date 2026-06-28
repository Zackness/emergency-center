#!/usr/bin/env npx tsx
/**
 * Orquesta el scraping y sincronización de todas las fuentes externas.
 *
 * Fase FETCH (JSON local / snapshots):
 *   - HuellasCAN mascotas
 *   - terremotovenezuela.com edificios
 *   - centroacopio.site acopios + deliveries
 *
 * Fase SYNC (base de datos):
 *   - Desaparecidos (5 APIs ciudadanas)
 *   - Mapa de daños
 *   - Centros de acopio (centroacopio.site)
 *   - Hospitales (catálogo nacional)
 *
 * Uso:
 *   npm run sync:all
 *   npm run sync:all -- --fetch-only
 *   npm run sync:all -- --sync-only
 *   npm run sync:all -- --skip-missing
 *   npm run sync:all -- --skip-hospitals
 *   npm run sync:all -- --dry-run          # solo sync:help-centers en seco
 *
 * Requiere Node 20+, .env con PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY.
 * Para escribir en producción: CONFIRM_PRODUCTION_DB=1
 */
import { spawnSync } from "node:child_process";

type Step = {
  id: string;
  label: string;
  npmScript: string;
  phase: "fetch" | "sync";
  extraArgs?: string[];
  skipFlag?: string;
};

const STEPS: Step[] = [
  {
    id: "redayuda",
    label: "Red Ayuda Venezuela — stats y sismos",
    npmScript: "fetch:redayuda",
    phase: "fetch",
  },
  {
    id: "vzlayuda",
    label: "Vzla Ayuda — ofertas y solicitudes",
    npmScript: "fetch:vzlayuda",
    phase: "fetch",
  },
  {
    id: "pets",
    label: "Mascotas — HuellasCAN",
    npmScript: "fetch:pets",
    phase: "fetch",
  },
  {
    id: "children",
    label: "Niños — NexoSignal + Red Ayuda",
    npmScript: "fetch:children",
    phase: "fetch",
  },
  {
    id: "damage-fetch",
    label: "Mapa daños — snapshot JSON",
    npmScript: "fetch:damage",
    phase: "fetch",
  },
  {
    id: "centroacopio",
    label: "Centros acopio — centroacopio.site",
    npmScript: "fetch:centroacopio",
    phase: "fetch",
  },
  {
    id: "missing",
    label: "Desaparecidos — plataformas externas",
    npmScript: "sync:missing",
    phase: "sync",
    extraArgs: ["--all"],
    skipFlag: "--skip-missing",
  },
  {
    id: "damage",
    label: "Mapa daños — base de datos",
    npmScript: "sync:damage",
    phase: "sync",
    extraArgs: ["--from-file"],
  },
  {
    id: "seed-help-centers",
    label: "Centros acopio — catálogo seed local",
    npmScript: "sync:seed-help-centers",
    phase: "sync",
  },
  {
    id: "help-centers",
    label: "Centros acopio — base de datos",
    npmScript: "sync:help-centers",
    phase: "sync",
    extraArgs: ["--from-file"],
  },
  {
    id: "centroacopio-deliveries",
    label: "Delivery centroacopio — voluntarios",
    npmScript: "sync:centroacopio-deliveries",
    phase: "sync",
    extraArgs: ["--from-file"],
  },
  {
    id: "hospitals",
    label: "Hospitales — catálogo nacional",
    npmScript: "sync:hospitals",
    phase: "sync",
    skipFlag: "--skip-hospitals",
  },
];

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function runStep(step: Step): boolean {
  const extra = [...(step.extraArgs ?? [])];
  if (step.id === "help-centers" && hasFlag("--dry-run")) {
    extra.push("--dry-run");
  }

  const args = ["run", step.npmScript, ...(extra.length ? ["--", ...extra] : [])];
  console.log(`\n${"=".repeat(60)}`);
  console.log(`▶ ${step.label}`);
  console.log(`  npm ${args.join(" ")}`);
  console.log("=".repeat(60));

  const result = spawnSync("npm", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`\n✗ Falló: ${step.label} (código ${result.status ?? "?"})`);
    return false;
  }
  console.log(`\n✓ OK: ${step.label}`);
  return true;
}

async function main() {
  const fetchOnly = hasFlag("--fetch-only");
  const syncOnly = hasFlag("--sync-only");

  if (fetchOnly && syncOnly) {
    console.error("Usa solo uno: --fetch-only o --sync-only");
    process.exit(1);
  }

  const phases = fetchOnly ? ["fetch"] : syncOnly ? ["sync"] : ["fetch", "sync"];
  const selected = STEPS.filter((step) => {
    if (!phases.includes(step.phase)) return false;
    if (step.skipFlag && hasFlag(step.skipFlag)) return false;
    return true;
  });

  console.log("Emergency Center — sincronización completa");
  console.log(`Fases: ${phases.join(", ")}`);
  console.log(`Pasos: ${selected.map((s) => s.id).join(", ")}`);

  const failures: string[] = [];
  for (const step of selected) {
    if (!runStep(step)) failures.push(step.id);
  }

  console.log(`\n${"=".repeat(60)}`);
  if (failures.length) {
    console.error(`Terminado con errores en: ${failures.join(", ")}`);
    process.exit(1);
  }
  console.log("Sincronización completa sin errores.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
