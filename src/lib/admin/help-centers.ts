import { mapHelpCenter } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export interface AdminHelpCenterRow {
  id: string;
  name: string;
  description: string | null;
  type: string;
  state: string;
  city: string;
  address: string;
  phone: string | null;
  email: string | null;
  schedule: string | null;
  accepts: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  coordinators: { id: string; email: string; fullName: string | null }[];
}

export async function listHelpCentersForAdmin(): Promise<AdminHelpCenterRow[]> {
  const rows = await prisma.helpCenter.findMany({
    orderBy: [{ isVerified: "asc" }, { updatedAt: "desc" }],
    include: {
      coordinators: {
        include: {
          profile: { select: { id: true, email: true, fullName: true } },
        },
      },
    },
  });

  return rows.map((row) => {
    const mapped = mapHelpCenter(row);
    return {
      id: mapped.id,
      name: mapped.name,
      description: mapped.description,
      type: mapped.type,
      state: mapped.state,
      city: mapped.city,
      address: mapped.address,
      phone: mapped.phone,
      email: mapped.email,
      schedule: mapped.schedule,
      accepts: mapped.accepts,
      is_verified: mapped.is_verified,
      is_active: mapped.is_active,
      created_at: mapped.created_at,
      updated_at: mapped.updated_at,
      coordinators: row.coordinators.map((c) => ({
        id: c.profile.id,
        email: c.profile.email,
        fullName: c.profile.fullName,
      })),
    };
  });
}

export async function updateHelpCenterAdmin(
  id: string,
  data: {
    is_verified?: boolean;
    is_active?: boolean;
    coordinator_email?: string;
  }
) {
  if (data.coordinator_email !== undefined) {
    const email = data.coordinator_email.trim().toLowerCase();
    if (!email) {
      throw new Error("INVALID_EMAIL");
    }

    const profile = await prisma.profile.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (!profile) {
      throw new Error("USER_NOT_FOUND");
    }

    await prisma.helpCenterCoordinator.upsert({
      where: {
        profileId_helpCenterId: { profileId: profile.id, helpCenterId: id },
      },
      create: { profileId: profile.id, helpCenterId: id },
      update: {},
    });
  }

  const updates: { isVerified?: boolean; isActive?: boolean } = {};
  if (data.is_verified !== undefined) updates.isVerified = data.is_verified;
  if (data.is_active !== undefined) updates.isActive = data.is_active;

  if (Object.keys(updates).length > 0) {
    await prisma.helpCenter.update({ where: { id }, data: updates });
  }

  const rows = await listHelpCentersForAdmin();
  return rows.find((c) => c.id === id) ?? null;
}
