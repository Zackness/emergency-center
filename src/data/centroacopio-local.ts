import type {
  CentroacopioCenter,
  CentroacopioDelivery,
  CentroacopioSnapshot,
} from "@/lib/help-centers/centroacopio";
import { mapCenterToHelpCenter, mapDeliveryToView } from "@/lib/help-centers/centroacopio";
import type { HelpCenter } from "@/types";
import type { CentroacopioDeliveryView } from "@/lib/help-centers/types";
import snapshot from "@/data/centroacopio.json";

const data = snapshot as CentroacopioSnapshot;

function centerToHelpCenter(row: CentroacopioCenter): HelpCenter {
  const mapped = mapCenterToHelpCenter(row);
  const now = row.createdAt || new Date().toISOString();
  return {
    id: `centroacopio-${row.id}`,
    name: mapped.name,
    description: mapped.description,
    type: mapped.type,
    state: mapped.state,
    city: mapped.city,
    address: mapped.address,
    latitude: mapped.latitude,
    longitude: mapped.longitude,
    phone: mapped.phone,
    email: null,
    schedule: mapped.schedule,
    accepts: mapped.accepts,
    is_verified: mapped.isVerified,
    is_active: mapped.isActive,
    created_at: now,
    updated_at: now,
  };
}

/** Snapshot local (npm run fetch:centroacopio). */
export const LOCAL_CENTROACOPIO_CENTERS: HelpCenter[] = (data.centers ?? []).map(centerToHelpCenter);

export const LOCAL_CENTROACOPIO_DELIVERIES: CentroacopioDeliveryView[] = (data.deliveries ?? []).map(
  mapDeliveryToView
);

export const LOCAL_CENTROACOPIO_FETCHED_AT = data.fetched_at ?? null;
