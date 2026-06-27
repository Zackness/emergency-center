import type { APIRoute } from "astro";
import { readJsonBody } from "@/lib/api-security";
import { listHelpCentersForAdmin, updateHelpCenterAdmin } from "@/lib/admin/help-centers";
import { requireAdmin } from "@/lib/auth-admin";
import { isDatabaseConfigured } from "@/lib/prisma";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(request, cookies);
  if (!auth.ok) return json({ error: "Unauthorized" }, auth.status);

  if (!isDatabaseConfigured()) {
    return json({ error: "Database not configured" }, 503);
  }

  try {
    const items = await listHelpCentersForAdmin();
    return json({ items });
  } catch {
    return json({ error: "Internal server error" }, 500);
  }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(request, cookies);
  if (!auth.ok) return json({ error: "Unauthorized" }, auth.status);

  if (!isDatabaseConfigured()) {
    return json({ error: "Database not configured" }, 503);
  }

  try {
    const body = await readJsonBody<{
      id?: string;
      is_verified?: boolean;
      is_active?: boolean;
      coordinator_email?: string;
    }>(request);

    if (!body.id) return json({ error: "Missing id" }, 400);

    const item = await updateHelpCenterAdmin(body.id, {
      is_verified: body.is_verified,
      is_active: body.is_active,
      coordinator_email: body.coordinator_email,
    });

    if (!item) return json({ error: "Not found" }, 404);
    return json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "USER_NOT_FOUND") {
      return json({ error: "No hay un usuario registrado con ese correo" }, 404);
    }
    if (message === "INVALID_EMAIL") {
      return json({ error: "Correo inválido" }, 400);
    }
    return json({ error: "Internal server error" }, 500);
  }
};
