import type { APIRoute } from "astro";
import { requireCenterAccess } from "@/lib/auth-center";
import { recordInventoryMovement } from "@/lib/center-dashboard";
import type { InventoryMovementType } from "@prisma/client";

export const prerender = false;

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
  const { itemId, type, quantity, donorName, destination, notes } = body as {
    itemId?: string;
    type?: InventoryMovementType;
    quantity?: number;
    donorName?: string;
    destination?: string;
    notes?: string;
  };

  if (!itemId || !type || quantity == null) {
    return new Response(JSON.stringify({ error: "itemId, type and quantity required" }), {
      status: 400,
    });
  }

  if (!["inbound", "outbound", "adjustment"].includes(type)) {
    return new Response(JSON.stringify({ error: "Invalid movement type" }), { status: 400 });
  }

  try {
    const result = await recordInventoryMovement({
      itemId,
      helpCenterId,
      type,
      quantity: Number(quantity),
      donorName: donorName ?? null,
      destination: destination ?? null,
      notes: notes ?? null,
      recordedById: access.user.id,
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
