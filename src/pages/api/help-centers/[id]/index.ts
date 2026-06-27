import type { APIRoute } from "astro";
import { readJsonBody } from "@/lib/api-security";
import { requireCenterAccess } from "@/lib/auth-center";
import {
  getHelpCenterForManagement,
  updateHelpCenterDetails,
} from "@/lib/center-dashboard";
import { mapHelpCenter } from "@/lib/mappers";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const helpCenterId = params.id;
  if (!helpCenterId) return json({ error: "Missing center id" }, 400);

  const access = await requireCenterAccess(request, cookies, helpCenterId);
  if (!access.ok) return json({ error: "Unauthorized" }, access.status);

  const row = await getHelpCenterForManagement(helpCenterId);
  if (!row) return json({ error: "Not found" }, 404);

  return json({ center: mapHelpCenter(row) });
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const helpCenterId = params.id;
  if (!helpCenterId) return json({ error: "Missing center id" }, 400);

  const access = await requireCenterAccess(request, cookies, helpCenterId);
  if (!access.ok) return json({ error: "Unauthorized" }, access.status);

  try {
    const body = await readJsonBody<Record<string, unknown>>(request);

    if (typeof body.name === "string" && !body.name.trim()) {
      return json({ error: "Name is required" }, 400);
    }

    const accepts = Array.isArray(body.accepts)
      ? body.accepts.filter((v): v is string => typeof v === "string")
      : undefined;

    if (accepts && accepts.length === 0) {
      return json({ error: "Select at least one accepted donation type" }, 400);
    }

    const staffNeeded = Array.isArray(body.staff_needed)
      ? body.staff_needed.filter((v): v is string => typeof v === "string")
      : undefined;

    const row = await updateHelpCenterDetails(helpCenterId, {
      name: typeof body.name === "string" ? body.name : undefined,
      description:
        typeof body.description === "string" || body.description === null
          ? (body.description as string | null)
          : undefined,
      phone:
        typeof body.phone === "string" || body.phone === null
          ? (body.phone as string | null)
          : undefined,
      email:
        typeof body.email === "string" || body.email === null
          ? (body.email as string | null)
          : undefined,
      schedule:
        typeof body.schedule === "string" || body.schedule === null
          ? (body.schedule as string | null)
          : undefined,
      address: typeof body.address === "string" ? body.address : undefined,
      city: typeof body.city === "string" ? body.city : undefined,
      state: typeof body.state === "string" ? body.state : undefined,
      accepts,
      staffNeeded,
      staffNeededNotes:
        typeof body.staff_needed_notes === "string" || body.staff_needed_notes === null
          ? (body.staff_needed_notes as string | null)
          : undefined,
    });

    return json({ center: mapHelpCenter(row) });
  } catch {
    return json({ error: "Internal server error" }, 500);
  }
};
