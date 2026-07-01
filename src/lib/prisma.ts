import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDev =
  (typeof import.meta !== "undefined" && import.meta.env?.DEV) ||
  process.env.NODE_ENV === "development";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ["error", "warn"] : ["error"],
  });

if (isDev) {
  globalForPrisma.prisma = prisma;
}

export function isDatabaseConfigured(): boolean {
  const url =
    (typeof process !== "undefined" ? process.env.DATABASE_URL : undefined) ??
    (typeof import.meta !== "undefined" ? import.meta.env?.DATABASE_URL : undefined);
  return Boolean(
    url &&
      !url.includes("your-password") &&
      !url.includes("[YOUR-PASSWORD]") &&
      !url.includes("[PASSWORD]")
  );
}
