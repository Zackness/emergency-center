import type { APIRoute } from "astro";
import { PUBLIC_FORM_RATE_LIMIT, guardPublicWrite, readJsonBody } from "@/lib/api-security";
import { damageReportSchema } from "@/lib/validation/schemas";
import { parseBody, validationErrorResponse } from "@/lib/validation/parse";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const { fetchDamageReportsForPage } = await import("@/lib/data");
    const { filterDamageReports } = await import("@/lib/damage-map/feed");
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

    const result = await fetchDamageReportsForPage();
    const filtered = filterDamageReports(result.items, {
      search,
      severity: severity && severity !== "all" ? (severity as import("@/types").DamageSeverity) : "all",
      state: state && state !== "all" ? state : "all",
    });
    const items = filtered.slice(safeOffset, safeOffset + safeLimit);

    return new Response(
      JSON.stringify({
        items,
        total: filtered.length,
        stats: result.stats,
        meta: result.meta,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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
    const body = await readJsonBody(request);
    const parsed = parseBody(damageReportSchema, body);
    if (!parsed.ok) return validationErrorResponse(parsed.error, parsed.details);

    const { createDamageReport } = await import("@/lib/data");
    const data = parsed.data;

    await createDamageReport({
      title: data.title,
      severity: data.severity,
      state: data.state,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      reporter_name: data.reporter_name,
      reporter_contact: data.reporter_contact,
      source_name: data.source_name,
      source_url: data.source_url,
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
