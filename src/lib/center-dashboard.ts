import type { InventoryInboundSource, InventoryMovementType, VolunteerRegistrationStatus } from "@prisma/client";
import { inventoryUrgency } from "@/lib/help-centers/public";
import { sanitizeStaffNeeded } from "@/lib/help-centers/staff-needed";
import type { HelpCenterNeedsSummary } from "@/lib/help-centers/types";
import { mapHelpCenter } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export async function listCenterVolunteers(helpCenterId: string) {
  return prisma.volunteerRegistration.findMany({
    where: { helpCenterId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateVolunteerStatus(
  volunteerId: string,
  helpCenterId: string,
  status: VolunteerRegistrationStatus
) {
  return prisma.volunteerRegistration.updateMany({
    where: { id: volunteerId, helpCenterId },
    data: { status },
  });
}

export async function createCenterVolunteer(
  helpCenterId: string,
  data: {
    name: string;
    nationalId: string;
    phone: string;
    status?: VolunteerRegistrationStatus;
  }
) {
  const center = await prisma.helpCenter.findUnique({
    where: { id: helpCenterId },
    select: { city: true, state: true },
  });

  return prisma.volunteerRegistration.create({
    data: {
      helpCenterId,
      name: data.name.trim(),
      nationalId: data.nationalId,
      city: center?.city?.trim() || "—",
      state: center?.state?.trim() || "—",
      profession: "Voluntario",
      specialty: null,
      vehicle: null,
      availability: "—",
      phone: data.phone.trim(),
      email: "—",
      location: null,
      notes: null,
      status: data.status ?? "active",
      isActive: true,
    },
  });
}

export async function listInventoryItems(helpCenterId: string) {
  return prisma.inventoryItem.findMany({
    where: { helpCenterId, isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      movements: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function createInventoryItem(data: {
  helpCenterId: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand?: number;
  minimumStock?: number | null;
  notes?: string | null;
}) {
  return prisma.inventoryItem.create({
    data: {
      helpCenterId: data.helpCenterId,
      name: data.name,
      category: data.category,
      unit: data.unit,
      quantityOnHand: data.quantityOnHand ?? 0,
      minimumStock: data.minimumStock ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function recordInventoryMovement(data: {
  itemId: string;
  helpCenterId: string;
  type: InventoryMovementType;
  quantity: number;
  donorName?: string | null;
  destination?: string | null;
  notes?: string | null;
  sourceType?: InventoryInboundSource | null;
  invoiceUrl?: string | null;
  recordedById?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findFirst({
      where: { id: data.itemId, helpCenterId: data.helpCenterId, isActive: true },
    });
    if (!item) throw new Error("Item not found");

    let delta = data.quantity;
    if (data.type === "outbound") delta = -Math.abs(data.quantity);
    else if (data.type === "inbound") delta = Math.abs(data.quantity);
    else delta = data.quantity;

    const newQty = item.quantityOnHand + delta;
    if (newQty < 0) throw new Error("Stock insuficiente");

    const movement = await tx.inventoryMovement.create({
      data: {
        itemId: item.id,
        type: data.type,
        quantity: Math.abs(data.quantity),
        donorName: data.donorName ?? null,
        destination: data.destination ?? null,
        notes: data.notes ?? null,
        sourceType: data.sourceType ?? null,
        invoiceUrl: data.invoiceUrl ?? null,
        recordedById: data.recordedById ?? null,
      },
    });

    await tx.inventoryItem.update({
      where: { id: item.id },
      data: { quantityOnHand: newQty },
    });

    return { movement, quantityOnHand: newQty };
  });
}

export async function registerInventoryNeed(
  helpCenterId: string,
  data: {
    name: string;
    category: string;
    unit?: string;
    minimumStock?: number | null;
    notes?: string | null;
  }
) {
  if (!data.name?.trim() || !data.category?.trim()) {
    throw new Error("Nombre y categoría son obligatorios");
  }

  return prisma.inventoryItem.create({
    data: {
      helpCenterId,
      name: data.name.trim(),
      category: data.category.trim(),
      unit: data.unit?.trim() || "unidad",
      quantityOnHand: 0,
      minimumStock: data.minimumStock ?? null,
      notes: data.notes?.trim() || null,
    },
  });
}

export async function fetchInventoryNeedSummaries(
  helpCenterIds: string[]
): Promise<Map<string, HelpCenterNeedsSummary>> {
  const map = new Map<string, HelpCenterNeedsSummary>();
  if (!helpCenterIds.length) return map;

  for (const id of helpCenterIds) {
    map.set(id, { critical: [], low: [], criticalCount: 0, lowCount: 0 });
  }

  const items = await prisma.inventoryItem.findMany({
    where: { helpCenterId: { in: helpCenterIds }, isActive: true },
    select: {
      helpCenterId: true,
      name: true,
      quantityOnHand: true,
      minimumStock: true,
    },
    orderBy: { name: "asc" },
  });

  for (const item of items) {
    const urgency = inventoryUrgency(item);
    if (urgency === "ok") continue;
    const entry = map.get(item.helpCenterId);
    if (!entry) continue;
    if (urgency === "critical") {
      entry.critical.push(item.name);
      entry.criticalCount++;
    } else {
      entry.low.push(item.name);
      entry.lowCount++;
    }
  }

  return map;
}

export async function getPublicHelpCenterBundle(helpCenterId: string) {
  const row = await prisma.helpCenter.findFirst({
    where: { id: helpCenterId, isActive: true, isVerified: true },
  });
  if (!row) return null;

  const items = await prisma.inventoryItem.findMany({
    where: { helpCenterId, isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const movements = await prisma.inventoryMovement.findMany({
    where: {
      invoiceUrl: { not: null },
      item: { helpCenterId, isActive: true },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { item: { select: { name: true } } },
  });

  return {
    center: mapHelpCenter(row),
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantityOnHand: item.quantityOnHand,
      minimumStock: item.minimumStock,
      notes: item.notes,
      urgency: inventoryUrgency(item),
    })),
    invoices: movements.map((movement) => ({
      id: movement.id,
      itemName: movement.item.name,
      quantity: movement.quantity,
      sourceType: movement.sourceType,
      invoiceUrl: movement.invoiceUrl,
      createdAt: movement.createdAt.toISOString(),
    })),
  };
}

export async function createInventoryIntake(
  helpCenterId: string,
  data: {
    mode: "new" | "existing";
    itemId?: string;
    name?: string;
    category?: string;
    unit?: string;
    minimumStock?: number | null;
    quantity: number;
    sourceType: InventoryInboundSource;
    donorName?: string | null;
    invoiceUrl?: string | null;
    notes?: string | null;
    recordedById?: string | null;
  }
) {
  if (data.quantity <= 0) throw new Error("La cantidad debe ser mayor a cero");

  return prisma.$transaction(async (tx) => {
    let itemId = data.itemId;

    if (data.mode === "new") {
      if (!data.name?.trim() || !data.category?.trim()) {
        throw new Error("Nombre y categoría son obligatorios");
      }
      const created = await tx.inventoryItem.create({
        data: {
          helpCenterId,
          name: data.name.trim(),
          category: data.category.trim(),
          unit: data.unit?.trim() || "unidad",
          quantityOnHand: 0,
          minimumStock: data.minimumStock ?? null,
        },
      });
      itemId = created.id;
    }

    if (!itemId) throw new Error("Insumo no encontrado");

    const item = await tx.inventoryItem.findFirst({
      where: { id: itemId, helpCenterId, isActive: true },
    });
    if (!item) throw new Error("Insumo no encontrado");

    const newQty = item.quantityOnHand + Math.abs(data.quantity);
    const movement = await tx.inventoryMovement.create({
      data: {
        itemId: item.id,
        type: "inbound",
        quantity: Math.abs(data.quantity),
        donorName: data.sourceType === "donation" ? data.donorName?.trim() || null : null,
        notes: data.notes?.trim() || null,
        sourceType: data.sourceType,
        invoiceUrl: data.sourceType === "purchase" ? data.invoiceUrl ?? null : null,
        recordedById: data.recordedById ?? null,
      },
    });

    await tx.inventoryItem.update({
      where: { id: item.id },
      data: { quantityOnHand: newQty },
    });

    return { item: { ...item, quantityOnHand: newQty }, movement };
  });
}

export async function getCenterDashboardSummary(helpCenterId: string) {
  const [volunteersPending, volunteersActive, items, itemsWithMin] = await Promise.all([
    prisma.volunteerRegistration.count({
      where: { helpCenterId, status: "pending", isActive: true },
    }),
    prisma.volunteerRegistration.count({
      where: { helpCenterId, status: "active", isActive: true },
    }),
    prisma.inventoryItem.count({ where: { helpCenterId, isActive: true } }),
    prisma.inventoryItem.findMany({
      where: { helpCenterId, isActive: true, minimumStock: { not: null } },
      select: { quantityOnHand: true, minimumStock: true },
    }),
  ]);

  const lowStock = itemsWithMin.filter(
    (i) => i.minimumStock != null && i.quantityOnHand <= i.minimumStock
  ).length;

  return { volunteersPending, volunteersActive, items, lowStock };
}

const ACCEPT_KEYS = ["water", "food", "medicine", "clothing", "hygiene", "blankets"] as const;

export async function getHelpCenterForManagement(helpCenterId: string) {
  return prisma.helpCenter.findFirst({
    where: { id: helpCenterId, isActive: true },
  });
}

export async function updateHelpCenterDetails(
  helpCenterId: string,
  data: {
    name?: string;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    schedule?: string | null;
    address?: string;
    city?: string;
    state?: string;
    accepts?: string[];
    staffNeeded?: string[];
    staffNeededNotes?: string | null;
  }
) {
  const accepts =
    data.accepts?.filter((item) =>
      ACCEPT_KEYS.includes(item as (typeof ACCEPT_KEYS)[number])
    ) ?? undefined;
  const staffNeeded =
    data.staffNeeded !== undefined ? sanitizeStaffNeeded(data.staffNeeded) : undefined;

  return prisma.helpCenter.update({
    where: { id: helpCenterId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
      ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
      ...(data.schedule !== undefined ? { schedule: data.schedule?.trim() || null } : {}),
      ...(data.address !== undefined ? { address: data.address.trim() } : {}),
      ...(data.city !== undefined ? { city: data.city.trim() } : {}),
      ...(data.state !== undefined ? { state: data.state.trim() } : {}),
      ...(accepts !== undefined ? { accepts } : {}),
      ...(staffNeeded !== undefined ? { staffNeeded } : {}),
      ...(data.staffNeededNotes !== undefined
        ? { staffNeededNotes: data.staffNeededNotes?.trim() || null }
        : {}),
    },
  });
}
