import type { APIRoute } from "astro";
import type { DamageSeverity } from "@/types";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";

export const prerender = false;

const VALID_SEVERITIES: DamageSeverity[] = ["collapsed", "damaged", "evacuated"];

export const GET: APIRoute = async ({ url }) => {
  try {
    const { queryDamageReportsFromDb } = await import("@/lib/data");
    const search = url.searchParams.get("search") ?? undefined;
    const severity = url.searchParams.get("severity") ?? undefined;
    const state = url.searchParams.get("state") ?? undefined;
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");
    const parsedLimit = Number(limit ?? "500");
    const parsedOffset = Number(offset ?? "0");
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(10000, Math.max(1, parsedLimit))
      : 10000;
    const safeOffset = Number.isFinite(parsedOffset) ? Math.max(0, parsedOffset) : 0;

    const result = await queryDamageReportsFromDb({
      search,
      severity: severity && severity !== "all" ? severity : undefined,
      state: state && state !== "all" ? state : undefined,
      limit: safeLimit,
      offset: safeOffset,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const blocked = guardPublicWrite(request, {
    namespace: "damage-reports:create",
    ...PUBLIC_FORM_RATE_LIMIT,
  });
  if (blocked) return blocked;

  try {
    const body = await readJsonBody<Record<string, any>>(request);
    const { createDamageReport } = await import("@/lib/data");

    const required = ["title", "state", "city", "latitude", "longitude"];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return new Response(
          JSON.stringify({ error: `Missing field: ${field}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const severity: DamageSeverity = VALID_SEVERITIES.includes(body.severity)
      ? body.severity
      : "damaged";

    await createDamageReport({
      title: body.title,
      severity,
      state: body.state,
      city: body.city,
      address: body.address ?? null,
      latitude,
      longitude,
      description: body.description ?? null,
      reporter_name: body.reporter_name ?? null,
      reporter_contact: body.reporter_contact ?? null,
      source_name: body.source_name ?? null,
      source_url: body.source_url ?? null,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
