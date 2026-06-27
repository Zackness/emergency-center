import type { APIRoute } from "astro";
import { requireCenterAccess } from "@/lib/auth-center";
import {
  createCenterVolunteer,
  getCenterDashboardSummary,
  listCenterVolunteers,
  updateVolunteerStatus,
} from "@/lib/center-dashboard";
import { databaseErrorResponse } from "@/lib/db-errors";
import { normalizeNationalId } from "@/lib/missing-persons/normalize";
import type { VolunteerRegistrationStatus } from "@prisma/client";

export const prerender = false;

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const helpCenterId = params.id;
  if (!helpCenterId) {
    return new Response(JSON.stringify({ error: "Missing center id" }), { status: 400 });
  }

  const access = await requireCenterAccess(request, cookies, helpCenterId);
  if (!access.ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: access.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const [volunteers, summary] = await Promise.all([
      listCenterVolunteers(helpCenterId),
      getCenterDashboardSummary(helpCenterId),
    ]);

    return new Response(JSON.stringify({ volunteers, summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const helpCenterId = params.id;
  if (!helpCenterId) {
    return new Response(JSON.stringify({ error: "Missing center id" }), { status: 400 });
  }

  const access = await requireCenterAccess(request, cookies, helpCenterId);
  if (!access.ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: access.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { volunteerId, status } = body as {
    volunteerId?: string;
    status?: VolunteerRegistrationStatus;
  };

  if (!volunteerId || !status) {
    return new Response(JSON.stringify({ error: "volunteerId and status required" }), {
      status: 400,
    });
  }

  if (!["pending", "active", "inactive"].includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
  }

  try {
    const result = await updateVolunteerStatus(volunteerId, helpCenterId, status);
    if (result.count === 0) {
      return new Response(JSON.stringify({ error: "Volunteer not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
};

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const helpCenterId = params.id;
  if (!helpCenterId) {
    return new Response(JSON.stringify({ error: "Missing center id" }), { status: 400 });
  }

  const access = await requireCenterAccess(request, cookies, helpCenterId);
  if (!access.ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: access.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await request.json()) as Record<string, string | undefined>;

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const nationalId = normalizeNationalId(body.nationalId);

    if (!name) {
      return new Response(JSON.stringify({ error: "El nombre es obligatorio" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!nationalId || nationalId.length < 6) {
      return new Response(JSON.stringify({ error: "La cédula de identidad no es válida" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!phone) {
      return new Response(JSON.stringify({ error: "El teléfono es obligatorio" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const status =
      body.status === "pending" || body.status === "inactive" ? body.status : "active";

    const volunteer = await createCenterVolunteer(helpCenterId, {
      name,
      nationalId,
      phone,
      status,
    });

    return new Response(JSON.stringify({ volunteer }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
};
