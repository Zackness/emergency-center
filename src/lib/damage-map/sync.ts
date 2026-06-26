import type { PrismaClient } from "@prisma/client";
import { DAMAGE_MAP_EXTERNAL_SOURCE, fetchExternalBuildings } from "./adapter";
import type { DamageSyncResult } from "./types";

export async function syncDamageBuildings(prisma: PrismaClient): Promise<DamageSyncResult> {
  const buildings = await fetchExternalBuildings();
  const result: DamageSyncResult = {
    fetched: buildings.length,
    created: 0,
    updated: 0,
    skipped: 0,
  };

  for (const building of buildings) {
    const descriptionParts: string[] = [];
    if (building.zone) descriptionParts.push(`Zona: ${building.zone}`);
    const description = descriptionParts.length ? descriptionParts.join(" · ") : null;

    const existing = await prisma.damageReport.findFirst({
      where: {
        externalSource: DAMAGE_MAP_EXTERNAL_SOURCE,
        externalReference: building.externalId,
      },
      select: { id: true },
    });

    const data = {
      title: building.title,
      severity: building.severity,
      state: building.state,
      city: building.city,
      address: building.address,
      zone: building.zone,
      latitude: building.latitude,
      longitude: building.longitude,
      description,
      sourceName: "Terremoto Venezuela — Mapa de Daños",
      sourceUrl: building.sourceUrl,
      imageUrls: building.imageUrls,
      externalReference: building.externalId,
      externalSource: DAMAGE_MAP_EXTERNAL_SOURCE,
      sourceSyncedAt: new Date(building.sourceSyncedAt),
      isVerified: building.isVerified,
      isActive: true,
    };

    if (existing) {
      await prisma.damageReport.update({
        where: { id: existing.id },
        data,
      });
      result.updated += 1;
    } else {
      await prisma.damageReport.create({ data });
      result.created += 1;
    }
  }

  return result;
}
