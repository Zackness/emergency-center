import type { NewsItem } from "@/types";

export type NewsVoteVerdict = "credible" | "false";

export type NewsConfidenceLevel =
  | "unrated"
  | "likely_credible"
  | "disputed"
  | "likely_false";

export interface NewsCredibilityStats {
  credible_count: number;
  false_count: number;
  total_votes: number;
  credible_percent: number | null;
  confidence: NewsConfidenceLevel;
  user_verdict: NewsVoteVerdict | null;
}

export interface NewsItemWithCredibility extends NewsItem {
  credibility: NewsCredibilityStats;
}

export interface NewsFeedQuery {
  sort?: "newest" | "most_credible" | "most_disputed";
  voter_token?: string | null;
}

export interface CreateNewsSubmissionInput {
  title: string;
  summary: string;
  source: string;
  source_url: string;
}

export interface CastNewsVoteInput {
  news_id: string;
  verdict: NewsVoteVerdict;
  voter_token: string;
}
