import type { APIRoute } from "astro";
import { readJsonBody } from "@/lib/api-security";
import { requireAdmin } from "@/lib/auth-admin";
import {
  createAlliedPlatform,
  fetchAlliedPlatforms,
  listAlliedPlatformsAdmin,
} from "@/lib/allied-platforms/service";
import { parseAlliedPlatformInput } from "@/lib/allied-platforms/utils";
import { mapAlliedPlatform } from "@/lib/mappers";
import { isDatabaseConfigured } from "@/lib/prisma";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: APIRoute = async ({ request, cookies, url }) => {
  const includeInactive = url.searchParams.get("include_inactive") === "1";

  if (includeInactive) {
    const auth = await requireAdmin(request, cookies);
    if (!auth.ok) return json({ error: "Unauthorized" }, auth.status);

    const items = await listAlliedPlatformsAdmin();
    return json({ items });
  }

  const items = await fetchAlliedPlatforms();
  return json({ items });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(request, cookies);
  if (!auth.ok) return json({ error: "Unauthorized" }, auth.status);

  if (!isDatabaseConfigured()) {
    return json({ error: "Database not configured" }, 503);
  }

  try {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const input = parseAlliedPlatformInput(body);
    if (!input) return json({ error: "Invalid payload" }, 400);

    const row = await createAlliedPlatform(input, auth.user.id);
    return json({ item: mapAlliedPlatform(row) }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("Unique constraint")) {
      return json({ error: "Ya existe una plataforma con ese dominio" }, 409);
    }
    return json({ error: "Internal server error" }, 500);
  }
};
