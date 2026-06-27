export const STAFF_NEEDED_KEYS = [
  "medical",
  "nursing",
  "drivers",
  "logistics",
  "volunteers",
  "interpreters",
  "rescuers",
  "coordinators",
] as const;

export type StaffNeededKey = (typeof STAFF_NEEDED_KEYS)[number];

export function sanitizeStaffNeeded(values: string[] | undefined): StaffNeededKey[] {
  if (!values?.length) return [];
  return values.filter((value): value is StaffNeededKey =>
    STAFF_NEEDED_KEYS.includes(value as StaffNeededKey)
  );
}

export function hasStaffNeeds(center: {
  staff_needed?: string[] | null;
  staff_needed_notes?: string | null;
}): boolean {
  return Boolean(center.staff_needed?.length || center.staff_needed_notes?.trim());
}
