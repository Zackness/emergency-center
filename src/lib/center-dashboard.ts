import type { InventoryMovementType, VolunteerRegistrationStatus } from "@prisma/client";
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
