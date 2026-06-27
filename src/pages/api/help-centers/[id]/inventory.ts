import type { APIRoute } from "astro";
import { requireCenterAccess } from "@/lib/auth-center";
import { createInventoryItem, listInventoryItems } from "@/lib/center-dashboard";
import { databaseErrorResponse } from "@/lib/db-errors";

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
    const items = await listInventoryItems(helpCenterId);
    return new Response(JSON.stringify({ items }), {
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

  const body = await request.json();
  const { name, category, unit, quantityOnHand, minimumStock, notes } = body;

  if (!name || !category) {
    return new Response(JSON.stringify({ error: "name and category required" }), {
      status: 400,
    });
  }

  try {
    const item = await createInventoryItem({
      helpCenterId,
      name: String(name),
      category: String(category),
      unit: unit ? String(unit) : "unidad",
      quantityOnHand: quantityOnHand != null ? Number(quantityOnHand) : 0,
      minimumStock: minimumStock != null ? Number(minimumStock) : null,
      notes: notes ?? null,
    });

    return new Response(JSON.stringify({ item }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
};
