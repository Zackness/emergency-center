import type { ZodSchema, ZodError } from "zod";

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: string[] };

function formatZodError(error: ZodError): { message: string; details: string[] } {
  const details = error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "body";
    return `${path}: ${issue.message}`;
  });
  return {
    message: details[0] ?? "Datos inválidos",
    details,
  };
}

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): ParseResult<T> {
  const result = schema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  const { message, details } = formatZodError(result.error);
  return { ok: false, error: message, details };
}

export function validationErrorResponse(
  error: string,
  details?: string[],
  status = 400
): Response {
  return new Response(
    JSON.stringify({ error, details: details ?? undefined }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
