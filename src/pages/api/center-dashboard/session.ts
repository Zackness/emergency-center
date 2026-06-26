import type { APIRoute } from "astro";
import { getManagedHelpCenterIds, getSessionUser } from "@/lib/auth-center";
import { fetchHelpCenters } from "@/lib/data";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const user = await getSessionUser(request, cookies);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const centerIds = await getManagedHelpCenterIds(user.id);
  const allCenters = await fetchHelpCenters();
  const centers = allCenters
    .filter((c) => centerIds.includes(c.id))
    .map((c) => ({ id: c.id, name: c.name, city: c.city, state: c.state }));

  return new Response(JSON.stringify({ userId: user.id, email: user.email, centers }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
