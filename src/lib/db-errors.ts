import { Prisma } from "@prisma/client";

export function isDatabaseConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1001") {
    return true;
  }
  if (error instanceof Error) {
    return (
      error.message.includes("Can't reach database server") ||
      error.message.includes("Connection refused") ||
      error.message.includes("ECONNREFUSED")
    );
  }
  return false;
}

export function databaseErrorResponse(error: unknown): Response {
  const message = isDatabaseConnectionError(error)
    ? "No se pudo conectar con la base de datos. Verifica DATABASE_URL en .env y que el proyecto Supabase esté activo."
    : "Error al acceder a los datos.";

  return new Response(
    JSON.stringify({ error: message, code: "DATABASE_UNAVAILABLE" }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}
