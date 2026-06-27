import type { APIRoute } from "astro";
import { requireCenterAccess } from "@/lib/auth-center";
import { createInventoryIntake, registerInventoryNeed } from "@/lib/center-dashboard";
import { databaseErrorResponse } from "@/lib/db-errors";
import type { InventoryInboundSource } from "@prisma/client";

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

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const mode =
      body.mode === "existing"
        ? "existing"
        : body.mode === "new"
          ? "new"
          : body.mode === "need"
            ? "need"
            : null;
    const sourceType = body.sourceType as InventoryInboundSource | undefined;
    const quantity = body.quantity != null ? Number(body.quantity) : 0;

    if (!mode) {
      return new Response(JSON.stringify({ error: "mode must be new, existing or need" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (mode === "need") {
      const name = typeof body.name === "string" ? body.name : "";
      const category = typeof body.category === "string" ? body.category : "";
      if (!name.trim() || !category.trim()) {
        return new Response(JSON.stringify({ error: "name and category required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const item = await registerInventoryNeed(helpCenterId, {
        name,
        category,
        unit: typeof body.unit === "string" ? body.unit : undefined,
        minimumStock:
          body.minimumStock != null && body.minimumStock !== ""
            ? Number(body.minimumStock)
            : null,
        notes: typeof body.notes === "string" ? body.notes : null,
      });

      return new Response(JSON.stringify({ item }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (sourceType !== "donation" && sourceType !== "purchase") {
      return new Response(JSON.stringify({ error: "sourceType must be donation or purchase" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return new Response(JSON.stringify({ error: "quantity must be greater than 0" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const itemId = typeof body.itemId === "string" ? body.itemId : undefined;
    if (mode === "existing" && !itemId) {
      return new Response(JSON.stringify({ error: "itemId required for existing mode" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await createInventoryIntake(helpCenterId, {
      mode,
      itemId,
      name: typeof body.name === "string" ? body.name : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      unit: typeof body.unit === "string" ? body.unit : undefined,
      minimumStock:
        body.minimumStock != null && body.minimumStock !== ""
          ? Number(body.minimumStock)
          : null,
      quantity,
      sourceType,
      donorName: typeof body.donorName === "string" ? body.donorName : null,
      invoiceUrl: typeof body.invoiceUrl === "string" ? body.invoiceUrl : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      recordedById: access.user.id,
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && !error.message.includes("database")) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return databaseErrorResponse(error);
  }
};
