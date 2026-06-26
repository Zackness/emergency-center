const STORAGE_KEY = "community-voter-token";

export function getCommunityVoterToken(): string {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `voter-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(STORAGE_KEY, token);
  return token;
}
