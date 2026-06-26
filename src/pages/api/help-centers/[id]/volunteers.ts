import type { APIRoute } from "astro";
import { requireCenterAccess } from "@/lib/auth-center";
import {
  getCenterDashboardSummary,
  listCenterVolunteers,
  updateVolunteerStatus,
} from "@/lib/center-dashboard";
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

  const [volunteers, summary] = await Promise.all([
    listCenterVolunteers(helpCenterId),
    getCenterDashboardSummary(helpCenterId),
  ]);

  return new Response(JSON.stringify({ volunteers, summary }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
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

  const result = await updateVolunteerStatus(volunteerId, helpCenterId, status);
  if (result.count === 0) {
    return new Response(JSON.stringify({ error: "Volunteer not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
