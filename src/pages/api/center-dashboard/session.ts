import type { APIRoute } from "astro";
import { getManagedHelpCenterIds, getSessionUser } from "@/lib/auth-center";
import { getCenterDashboardSummary } from "@/lib/center-dashboard";
import { fetchHelpCenters } from "@/lib/data";
import { databaseErrorResponse } from "@/lib/db-errors";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const user = await getSessionUser(request, cookies);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const centerIds = await getManagedHelpCenterIds(user.id);
    const allCenters = await fetchHelpCenters();
    const managed = allCenters.filter((c) => centerIds.includes(c.id));

    const centers = await Promise.all(
      managed.map(async (c) => {
        const summary = await getCenterDashboardSummary(c.id);
        return {
          id: c.id,
          name: c.name,
          city: c.city,
          state: c.state,
          address: c.address,
          isVerified: c.is_verified,
          isActive: c.is_active,
          volunteersPending: summary.volunteersPending,
          volunteersActive: summary.volunteersActive,
          items: summary.items,
          lowStock: summary.lowStock,
        };
      })
    );

    return new Response(
      JSON.stringify({ userId: user.id, email: user.email, centers }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return databaseErrorResponse(error);
  }
};
