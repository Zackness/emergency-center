import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const checks = await Promise.all([
    prisma.alliedPlatform.findFirst({ where: { domain: { contains: "donarseguro", mode: "insensitive" } }, select: { domain: true } }),
    prisma.helpCenter.findFirst({ where: { name: { contains: "GEM & We Love" } }, select: { name: true, isVerified: true } }),
    prisma.helpCenter.findFirst({ where: { name: { contains: "Daniel Dhers" } }, select: { name: true } }),
    prisma.helpCenter.findFirst({ where: { city: { equals: "Carora", mode: "insensitive" } }, select: { name: true, city: true } }),
    prisma.$queryRaw`SELECT COUNT(*)::bigint AS count FROM help_centers WHERE is_verified = true AND is_active = true`,
  ]);

  console.log(JSON.stringify({
    donarseguro: checks[0]?.domain ?? null,
    gemWeLove: checks[1]?.name ?? null,
    danielDhers: checks[2]?.name ?? null,
    caroraSample: checks[3]?.name ?? null,
    verifiedActiveCenters: Number(checks[4][0]?.count ?? 0),
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
