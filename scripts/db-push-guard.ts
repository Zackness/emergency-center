#!/usr/bin/env npx tsx
import { spawnSync } from "node:child_process";
import { assertSafeDatabaseTarget } from "../src/lib/db-guard";

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    // .env ausente o ya cargado.
  }
}

loadEnv();
assertSafeDatabaseTarget("db:push");

const result = spawnSync("npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
