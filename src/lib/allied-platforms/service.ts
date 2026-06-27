import { ALLIED_PLATFORMS } from "@/data/allied-platforms";
import { mapAlliedPlatform } from "@/lib/mappers";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { AlliedPlatformInput } from "@/lib/allied-platforms/utils";
import type { AlliedPlatform } from "@/types";

export async function fetchAlliedPlatforms(options?: { includeInactive?: boolean }): Promise<AlliedPlatform[]> {
  if (!isDatabaseConfigured()) return ALLIED_PLATFORMS;

  try {
    const alliedPlatform = (prisma as { alliedPlatform?: { findMany?: unknown } }).alliedPlatform;
    if (typeof alliedPlatform?.findMany !== "function") return ALLIED_PLATFORMS;

    const rows = await prisma.alliedPlatform.findMany({
      where: options?.includeInactive ? {} : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { domain: "asc" }],
    });

    if (!rows.length) return ALLIED_PLATFORMS;
    return rows.map(mapAlliedPlatform);
  } catch {
    return ALLIED_PLATFORMS;
  }
}

export async function listAlliedPlatformsAdmin(): Promise<AlliedPlatform[]> {
  return fetchAlliedPlatforms({ includeInactive: true });
}

export async function createAlliedPlatform(input: AlliedPlatformInput, createdById?: string) {
  return prisma.alliedPlatform.create({
    data: {
      domain: input.domain!,
      url: input.url,
      descriptionEs: input.description_es,
      descriptionEn: input.description_en,
      color: input.color ?? "blue",
      sortOrder: input.sort_order ?? 0,
      isActive: input.is_active ?? true,
      createdById: createdById ?? null,
    },
  });
}

export async function updateAlliedPlatform(id: string, input: Partial<AlliedPlatformInput>) {
  return prisma.alliedPlatform.update({
    where: { id },
    data: {
      ...(input.domain !== undefined ? { domain: input.domain } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.description_es !== undefined ? { descriptionEs: input.description_es } : {}),
      ...(input.description_en !== undefined ? { descriptionEn: input.description_en } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.sort_order !== undefined ? { sortOrder: input.sort_order } : {}),
      ...(input.is_active !== undefined ? { isActive: input.is_active } : {}),
    },
  });
}

export async function deactivateAlliedPlatform(id: string) {
  return prisma.alliedPlatform.update({
    where: { id },
    data: { isActive: false },
  });
}
