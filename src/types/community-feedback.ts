export type CommunityContentType =
  | "help_center"
  | "hospital"
  | "shelter"
  | "agency"
  | "damage_report"
  | "missing_person"
  | "news"
  | "solidarity_company"
  | "external_link";

export type CommunityVoteVerdict = "credible" | "false";

export type CommunityConfidenceLevel =
  | "unrated"
  | "likely_credible"
  | "likely_false"
  | "disputed";

export interface CommunityCredibilityStats {
  credible_count: number;
  false_count: number;
  total_votes: number;
  credible_percent: number | null;
  confidence: CommunityConfidenceLevel;
  user_verdict: CommunityVoteVerdict | null;
}

export interface CommunityComment {
  id: string;
  content_type: CommunityContentType;
  content_id: string;
  body: string;
  author_name: string | null;
  is_registered: boolean;
  created_at: string;
}

export interface CommunityFeedback {
  credibility: CommunityCredibilityStats;
  comments: CommunityComment[];
  comment_count: number;
}

export interface CastCommunityVoteInput {
  content_type: CommunityContentType;
  content_id: string;
  verdict: CommunityVoteVerdict;
  voter_token: string;
  profile_id?: string | null;
}

export interface CreateCommunityCommentInput {
  content_type: CommunityContentType;
  content_id: string;
  body: string;
  author_name?: string | null;
  voter_token?: string | null;
  profile_id?: string | null;
  profile_name?: string | null;
}

export interface CommunityFeedbackQuery {
  content_type: CommunityContentType;
  content_id: string;
  voter_token?: string | null;
  comment_limit?: number;
}
