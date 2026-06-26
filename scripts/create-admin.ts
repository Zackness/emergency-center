#!/usr/bin/env npx tsx
/**
 * Crea o promueve un usuario a administrador en Supabase Auth + profiles.
 *
 * Uso:
 *   npm run admin:create -- opsuale@gmail.com
 *   npm run admin:create -- opsuale@gmail.com --invite
 */
import { randomBytes } from "node:crypto";
import { assertSafeDatabaseTarget } from "@/lib/db-guard";

function loadEnv() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    // .env ausente o ya cargado.
  }
}

function authHeaders(secret: string) {
  return {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

async function findUserByEmail(baseUrl: string, secret: string, email: string) {
  const url = `${baseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: authHeaders(secret) });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`No se pudo buscar usuario (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { users?: Array<{ id: string; email?: string }> };
  return data.users?.[0] ?? null;
}

async function createUser(
  baseUrl: string,
  secret: string,
  email: string,
  options: { invite: boolean }
) {
  if (options.invite) {
    const res = await fetch(`${baseUrl}/auth/v1/invite`, {
      method: "POST",
      headers: authHeaders(secret),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`No se pudo invitar usuario (${res.status}): ${body}`);
    }
    return findUserByEmail(baseUrl, secret, email);
  }

  const password = randomBytes(16).toString("base64url");
  const res = await fetch(`${baseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders(secret),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Administrador" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`No se pudo crear usuario (${res.status}): ${body}`);
  }

  const user = (await res.json()) as { id: string; email?: string };
  console.log("\nUsuario creado. Contraseña temporal (cámbiala al entrar):");
  console.log(password);
  console.log("");
  return user;
}

async function ensureProfile(baseUrl: string, secret: string, userId: string, email: string) {
  const headers = {
    ...authHeaders(secret),
    Prefer: "resolution=merge-duplicates,return=representation",
  };

  const res = await fetch(`${baseUrl}/rest/v1/profiles`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: userId,
      email,
      full_name: "Administrador",
      role: "admin",
    }),
  });

  if (res.ok) return;

  const patch = await fetch(`${baseUrl}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      email,
      role: "admin",
    }),
  });

  if (!patch.ok) {
    const body = await patch.text();
    throw new Error(`No se pudo actualizar perfil (${patch.status}): ${body}`);
  }
}

async function main() {
  loadEnv();
  assertSafeDatabaseTarget("admin:create");

  const emailArg = process.argv[2];
  const invite = process.argv.includes("--invite");

  if (!emailArg || !emailArg.includes("@")) {
    console.error("Uso: npm run admin:create -- correo@ejemplo.com [--invite]");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const url = process.env.PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    console.error("Faltan PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env");
    process.exit(1);
  }

  const baseUrl = url.replace(/\/$/, "");

  let user = await findUserByEmail(baseUrl, secret, email);
  if (user) {
    console.log(`Usuario existente: ${user.email ?? email}`);
  } else {
    console.log(`Creando usuario ${email}...`);
    user = await createUser(baseUrl, secret, email, { invite });
  }

  if (!user?.id) {
    console.error("No se obtuvo el ID del usuario.");
    process.exit(1);
  }

  await ensureProfile(baseUrl, secret, user.id, email);
  console.log(`Listo: ${email} es administrador. Entra en /admin`);
  if (invite) {
    console.log("Se envió invitación por correo para establecer contraseña.");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
