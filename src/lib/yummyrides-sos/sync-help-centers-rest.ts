import { extractHelpCenterMarker } from "@/lib/help-centers/centroacopio";
import {
  getSupabaseRestAdmin,
  restPatch,
  restPost,
  restSelectAll,
} from "@/lib/supabase/rest-admin";
import { yummyCenterToHelpCenterPayload } from "./normalize";
import type { YummyHelpCenter } from "./types";

interface HelpCenterRow {
  id: string;
  name: string;
  address: string;
  description: string | null;
}

function normalizeKey(name: string, address: string): string {
  return `${name.trim().toLowerCase()}|${address.trim().toLowerCase()}`;
}

export async function syncYummyHelpCentersRest(centers: YummyHelpCenter[]): Promise<{
  created: number;
  updated: number;
}> {
  const admin = getSupabaseRestAdmin();
  const existing = await restSelectAll<HelpCenterRow>(
    admin,
    "help_centers",
    "id,name,address,description"
  );

  const byMarker = new Map<string, HelpCenterRow>();
  const byNameAddress = new Map<string, HelpCenterRow>();

  for (const row of existing) {
    const marker = extractHelpCenterMarker(row.description);
    if (marker) byMarker.set(`${marker.source}:${marker.id}`, row);
    byNameAddress.set(normalizeKey(row.name, row.address), row);
  }

  let created = 0;
  let updated = 0;

  for (const center of centers) {
    const payload = yummyCenterToHelpCenterPayload(center);
    const byId = byMarker.get(`yummyrides-sos:${center.id}`);

    if (byId) {
      await restPatch(admin, "help_centers", `id=eq.${byId.id}`, payload);
      updated += 1;
      continue;
    }

    const collision = byNameAddress.get(normalizeKey(payload.name, payload.address));
    if (collision) {
      const mergedDescription = [collision.description, payload.description]
        .filter(Boolean)
        .join("\n");
      await restPatch(admin, "help_centers", `id=eq.${collision.id}`, {
        description: mergedDescription,
        phone: payload.phone,
        accepts: payload.accepts,
      });
      updated += 1;
      continue;
    }

    await restPost(admin, "help_centers", payload);
    created += 1;
  }

  return { created, updated };
}
