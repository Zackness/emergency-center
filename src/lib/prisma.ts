import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: import.meta.env.DEV ? ["error", "warn"] : ["error"],
  });

if (import.meta.env.DEV) {
  globalForPrisma.prisma = prisma;
}

export function isDatabaseConfigured(): boolean {
  const url =
    (typeof process !== "undefined" ? process.env.DATABASE_URL : undefined) ??
    import.meta.env.DATABASE_URL;
  return Boolean(
    url &&
      !url.includes("your-password") &&
      !url.includes("[YOUR-PASSWORD]") &&
      !url.includes("[PASSWORD]")
  );
}
