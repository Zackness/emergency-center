import type { APIRoute } from "astro";
import { getPublicHelpCenterBundle } from "@/lib/center-dashboard";
import { databaseErrorResponse } from "@/lib/db-errors";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const helpCenterId = params.id;
  if (!helpCenterId) {
    return new Response(JSON.stringify({ error: "Missing center id" }), { status: 400 });
  }

  try {
    const bundle = await getPublicHelpCenterBundle(helpCenterId);
    if (!bundle) {
      return new Response(JSON.stringify({ error: "Center not found or not verified" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(bundle), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return databaseErrorResponse(error);
  }
};
