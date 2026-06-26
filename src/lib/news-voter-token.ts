import { getCommunityVoterToken } from "@/lib/community-voter-token";

/** @deprecated Use getCommunityVoterToken */
export function getNewsVoterToken(): string {
  return getCommunityVoterToken();
}
