import { ALLIED_PLATFORMS } from "@/data/allied-platforms";
import { mapAlliedPlatform } from "@/lib/mappers";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { AlliedPlatformInput } from "@/lib/allied-platforms/utils";
import type { AlliedPlatform } from "@/types";

export async function fetchAlliedPlatforms(options?: {
  includeInactive?: boolean;
}): Promise<AlliedPlatform[]> {
  if (!isDatabaseConfigured()) return ALLIED_PLATFORMS;

  try {
    const rows = await prisma.alliedPlatform.findMany({
      where: options?.includeInactive ? {} : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { domain: "asc" }],
    });
    return rows.map(mapAlliedPlatform);
  } catch (err) {
    console.error("[allied-platforms] Error cargando desde BD:", err);
    return [];
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

/** Inserta o actualiza plataformas del catálogo local en la BD (por dominio). */
export async function upsertAlliedPlatformCatalog(
  platforms: AlliedPlatform[]
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const [index, platform] of platforms.entries()) {
    const domain = platform.domain.trim().toLowerCase();
    const existing = await prisma.alliedPlatform.findFirst({
      where: { domain: { equals: domain, mode: "insensitive" } },
    });

    const data = {
      domain: platform.domain,
      url: platform.url,
      descriptionEs: platform.description.es,
      descriptionEn: platform.description.en,
      color: platform.color,
      sortOrder: platform.sort_order ?? (index + 1) * 10,
      isActive: platform.is_active ?? true,
    };

    if (existing) {
      await prisma.alliedPlatform.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.alliedPlatform.create({ data });
      created += 1;
    }
  }

  return { created, updated };
}
