/** Tipos de donación que un centro de acopio puede aceptar. */
export const HELP_CENTER_ACCEPT_KEYS = [
  "water",
  "food",
  "medicine",
  "clothing",
  "hygiene",
  "bathroom_supplies",
  "blankets",
] as const;

export type HelpCenterAcceptKey = (typeof HELP_CENTER_ACCEPT_KEYS)[number];

export function sanitizeHelpCenterAccepts(values: string[] | undefined): HelpCenterAcceptKey[] {
  if (!values?.length) return [];
  return values.filter((value): value is HelpCenterAcceptKey =>
    HELP_CENTER_ACCEPT_KEYS.includes(value as HelpCenterAcceptKey)
  );
}
