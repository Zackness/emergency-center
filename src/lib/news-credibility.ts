import { SEED_NEWS } from "@/data/seed";
import { mapNewsItem } from "@/lib/mappers";
import {
  castCommunityVote,
  computeCommunityConfidence,
  fetchCommunityFeedbackBatch,
} from "@/lib/community-feedback";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type {
  CastNewsVoteInput,
  CreateNewsSubmissionInput,
  NewsCredibilityStats,
  NewsFeedQuery,
  NewsItemWithCredibility,
} from "@/types/news";

const seedCommunityNews: NewsItemWithCredibility[] = [];

function emptyStats(): NewsCredibilityStats {
  return computeCommunityConfidence(0, 0, null) as NewsCredibilityStats;
}

function sortNews(
  items: NewsItemWithCredibility[],
  sort: NewsFeedQuery["sort"] = "newest"
) {
  const copy = [...items];
  switch (sort) {
    case "most_credible":
      return copy.sort((a, b) => {
        const aPct = a.credibility.credible_percent ?? -1;
        const bPct = b.credibility.credible_percent ?? -1;
        if (bPct !== aPct) return bPct - aPct;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
    case "most_disputed":
      return copy.sort((a, b) => {
        const aVotes = a.credibility.total_votes;
        const bVotes = b.credibility.total_votes;
        if (aVotes === 0 && bVotes === 0) {
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        }
        if (aVotes === 0) return 1;
        if (bVotes === 0) return -1;
        const aDistance = Math.abs((a.credibility.credible_percent ?? 50) - 50);
        const bDistance = Math.abs((b.credibility.credible_percent ?? 50) - 50);
        if (aDistance !== bDistance) return aDistance - bDistance;
        return bVotes - aVotes;
      });
    case "newest":
    default:
      return copy.sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
  }
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.sort();
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().replace(/\/$/, "").toLowerCase();
  }
}

function mergeSeedNews<T extends { id: string; source_url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const merged: T[] = [];

  for (const item of items) {
    const keys = [item.id, normalizeUrl(item.source_url)];
    if (keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    merged.push(item);
  }

  return merged;
}

export async function fetchNewsFeed(
  query: NewsFeedQuery = {}
): Promise<NewsItemWithCredibility[]> {
  const voterToken = query.voter_token ?? null;

  if (!isDatabaseConfigured()) {
    const base = [...SEED_NEWS, ...seedCommunityNews.map(({ credibility, ...item }) => item)];
    const ids = base.map((item) => item.id);
    const credibilityMap = await fetchCommunityFeedbackBatch("news", ids, voterToken);
    const items = base.map((item) => ({
      ...item,
      credibility: (credibilityMap[item.id] ?? emptyStats()) as NewsCredibilityStats,
    }));
    return sortNews(items, query.sort);
  }

  const rows = await prisma.newsItem.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" },
  });

  const base = mergeSeedNews([
    ...rows.map(mapNewsItem),
    ...SEED_NEWS,
  ]);
  const ids = base.map((item) => item.id);
  const credibilityMap = await fetchCommunityFeedbackBatch("news", ids, voterToken);

  const items = base.map((item) => ({
    ...item,
    credibility: (credibilityMap[item.id] ?? emptyStats()) as NewsCredibilityStats,
  }));

  return sortNews(items, query.sort);
}

export async function createNewsSubmission(data: CreateNewsSubmissionInput) {
  if (!isDatabaseConfigured()) {
    const item: NewsItemWithCredibility = {
      id: `seed-news-${Date.now()}`,
      title: data.title,
      summary: data.summary,
      source: data.source,
      source_url: data.source_url,
      published_at: new Date().toISOString(),
      locale: "both",
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      credibility: emptyStats(),
    };
    seedCommunityNews.unshift(item);
    return item;
  }

  const row = await prisma.newsItem.create({
    data: {
      title: data.title,
      summary: data.summary,
      source: data.source,
      sourceUrl: data.source_url,
      publishedAt: new Date(),
      isVerified: false,
    },
  });

  return {
    ...mapNewsItem(row),
    credibility: emptyStats(),
  };
}

export async function castNewsVote(data: CastNewsVoteInput) {
  return castCommunityVote({
    content_type: "news",
    content_id: data.news_id,
    verdict: data.verdict,
    voter_token: data.voter_token,
  }) as Promise<NewsCredibilityStats>;
}
