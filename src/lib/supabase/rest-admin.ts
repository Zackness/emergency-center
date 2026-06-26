function loadEnvFile() {
  try {
    (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile?.(".env");
  } catch {
    /* ya cargado */
  }
}

export interface SupabaseRestAdmin {
  baseUrl: string;
  headers: Record<string, string>;
}

export function getSupabaseRestAdmin(): SupabaseRestAdmin {
  loadEnvFile();
  const url = process.env.PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error(
      "Faltan PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env (API REST de Supabase)."
    );
  }

  return {
    baseUrl: `${url.replace(/\/$/, "")}/rest/v1`,
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
  };
}

export async function restSelectPage<T>(
  admin: SupabaseRestAdmin,
  table: string,
  select: string,
  offset: number,
  pageSize: number,
  extraQuery = ""
): Promise<T[]> {
  const query = extraQuery ? `&${extraQuery}` : "";
  const res = await fetch(
    `${admin.baseUrl}/${table}?select=${encodeURIComponent(select)}${query}`,
    {
      headers: {
        ...admin.headers,
        Range: `${offset}-${offset + pageSize - 1}`,
        "Range-Unit": "items",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`REST SELECT ${table} (${res.status}): ${await res.text()}`);
  }

  return (await res.json()) as T[];
}

export async function restSelectAll<T>(
  admin: SupabaseRestAdmin,
  table: string,
  select: string,
  pageSize = 1000,
  extraQuery = ""
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;

  for (;;) {
    const batch = await restSelectPage<T>(admin, table, select, offset, pageSize, extraQuery);
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}

export async function restPost(
  admin: SupabaseRestAdmin,
  table: string,
  body: Record<string, unknown> | Record<string, unknown>[],
  options?: { onConflict?: string; merge?: boolean }
): Promise<void> {
  const params = new URLSearchParams();
  if (options?.onConflict) params.set("on_conflict", options.onConflict);

  const prefer = ["return=minimal"];
  if (options?.merge) prefer.unshift("resolution=merge-duplicates");

  const res = await fetch(`${admin.baseUrl}/${table}?${params}`, {
    method: "POST",
    headers: {
      ...admin.headers,
      Prefer: prefer.join(","),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`REST POST ${table} (${res.status}): ${await res.text()}`);
  }
}

export async function restPatch(
  admin: SupabaseRestAdmin,
  table: string,
  filterQuery: string,
  body: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${admin.baseUrl}/${table}?${filterQuery}`, {
    method: "PATCH",
    headers: {
      ...admin.headers,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`REST PATCH ${table} (${res.status}): ${await res.text()}`);
  }
}
