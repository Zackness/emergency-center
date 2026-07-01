import type { APIRoute } from "astro";
import {
  PUBLIC_API_CATALOG,
  guardPublicApiRead,
  publicApiCorsHeaders,
  publicApiJson,
  publicApiOptions,
} from "@/lib/public-api";

export const prerender = false;

export const OPTIONS: APIRoute = async ({ request }) => publicApiOptions(request);

export const GET: APIRoute = async ({ request }) => {
  const blocked = guardPublicApiRead(request);
  if (blocked) return blocked;

  return publicApiJson(request, PUBLIC_API_CATALOG);
};
