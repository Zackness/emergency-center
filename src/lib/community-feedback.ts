import type { CommunityContentType, CommunityVoteVerdict } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import type {
  CastCommunityVoteInput,
  CommunityComment,
  CommunityConfidenceLevel,
  CommunityCredibilityStats,
  CommunityFeedback,
  CommunityFeedbackQuery,
  CreateCommunityCommentInput,
} from "@/types/community-feedback";

const MIN_VOTES_FOR_LABEL = 3;

type VoteStoreKey = `${CommunityContentType}:${string}`;
type SeedVoteStore = Map<VoteStoreKey, Map<string, CommunityVoteVerdict>>;
type SeedCommentStore = Map<VoteStoreKey, CommunityComment[]>;

const seedVoteStore: SeedVoteStore = new Map();
const seedCommentStore: SeedCommentStore = new Map();

function storeKey(contentType: CommunityContentType, contentId: string): VoteStoreKey {
  return `${contentType}:${contentId}`;
}

function emptyStats(userVerdict: CommunityVoteVerdict | null = null): CommunityCredibilityStats {
  return {
    credible_count: 0,
    false_count: 0,
    total_votes: 0,
    credible_percent: null,
    confidence: "unrated",
    user_verdict: userVerdict,
  };
}

export function computeCommunityConfidence(
  credibleCount: number,
  falseCount: number,
  userVerdict: CommunityVoteVerdict | null = null
): CommunityCredibilityStats {
  const total = credibleCount + falseCount;
  if (total === 0) return emptyStats(userVerdict);

  const crediblePercent = Math.round((credibleCount / total) * 100);
  let confidence: CommunityConfidenceLevel = "disputed";

  if (total >= MIN_VOTES_FOR_LABEL) {
    if (crediblePercent >= 70) confidence = "likely_credible";
    else if (crediblePercent <= 30) confidence = "likely_false";
  }

  return {
    credible_count: credibleCount,
    false_count: falseCount,
    total_votes: total,
    credible_percent: crediblePercent,
    confidence,
    user_verdict: userVerdict,
  };
}

function getSeedVotes(
  contentType: CommunityContentType,
  contentId: string,
  voterToken?: string | null
): CommunityCredibilityStats {
  const votes = seedVoteStore.get(storeKey(contentType, contentId)) ?? new Map();
  let credible = 0;
  let falseCount = 0;
  let userVerdict: CommunityVoteVerdict | null = null;

  for (const [token, verdict] of votes.entries()) {
    if (verdict === "credible") credible += 1;
    else falseCount += 1;
    if (voterToken && token === voterToken) userVerdict = verdict;
  }

  return computeCommunityConfidence(credible, falseCount, userVerdict);
}

function getSeedComments(
  contentType: CommunityContentType,
  contentId: string,
  limit = 20
): CommunityComment[] {
  const comments = seedCommentStore.get(storeKey(contentType, contentId)) ?? [];
  return comments.slice(0, limit);
}

export async function fetchCommunityFeedback(
  query: CommunityFeedbackQuery
): Promise<CommunityFeedback> {
  const commentLimit = query.comment_limit ?? 20;
  const voterToken = query.voter_token ?? null;

  if (!isDatabaseConfigured()) {
    const comments = getSeedComments(query.content_type, query.content_id, commentLimit);
    const allComments = seedCommentStore.get(storeKey(query.content_type, query.content_id)) ?? [];
    return {
      credibility: getSeedVotes(query.content_type, query.content_id, voterToken),
      comments,
      comment_count: allComments.length,
    };
  }

  const aggregates = await prisma.communityCredibilityVote.groupBy({
    by: ["verdict"],
    where: {
      contentType: query.content_type,
      contentId: query.content_id,
    },
    _count: { _all: true },
  });

  let credible = 0;
  let falseCount = 0;
  for (const row of aggregates) {
    if (row.verdict === "credible") credible = row._count._all;
    else falseCount = row._count._all;
  }

  let userVerdict: CommunityVoteVerdict | null = null;
  if (voterToken) {
    const userVote = await prisma.communityCredibilityVote.findUnique({
      where: {
        contentType_contentId_voterToken: {
          contentType: query.content_type,
          contentId: query.content_id,
          voterToken,
        },
      },
    });
    userVerdict = userVote?.verdict ?? null;
  }

  const [comments, commentCount] = await Promise.all([
    prisma.communityComment.findMany({
      where: {
        contentType: query.content_type,
        contentId: query.content_id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: commentLimit,
      include: {
        profile: { select: { fullName: true } },
      },
    }),
    prisma.communityComment.count({
      where: {
        contentType: query.content_type,
        contentId: query.content_id,
        isActive: true,
      },
    }),
  ]);

  return {
    credibility: computeCommunityConfidence(credible, falseCount, userVerdict),
    comments: comments.map((row) => ({
      id: row.id,
      content_type: query.content_type,
      content_id: query.content_id,
      body: row.body,
      author_name: row.profile?.fullName ?? row.authorName,
      is_registered: Boolean(row.profileId),
      created_at: row.createdAt.toISOString(),
    })),
    comment_count: commentCount,
  };
}

export async function castCommunityVote(data: CastCommunityVoteInput) {
  if (!data.voter_token?.trim()) {
    throw new Error("Missing voter token");
  }

  if (!isDatabaseConfigured()) {
    const key = storeKey(data.content_type, data.content_id);
    const votes = seedVoteStore.get(key) ?? new Map<string, CommunityVoteVerdict>();
    votes.set(data.voter_token, data.verdict);
    seedVoteStore.set(key, votes);
    return getSeedVotes(data.content_type, data.content_id, data.voter_token);
  }

  await prisma.communityCredibilityVote.upsert({
    where: {
      contentType_contentId_voterToken: {
        contentType: data.content_type,
        contentId: data.content_id,
        voterToken: data.voter_token,
      },
    },
    create: {
      contentType: data.content_type,
      contentId: data.content_id,
      verdict: data.verdict,
      voterToken: data.voter_token,
      profileId: data.profile_id ?? null,
    },
    update: {
      verdict: data.verdict,
      profileId: data.profile_id ?? null,
    },
  });

  const aggregates = await prisma.communityCredibilityVote.groupBy({
    by: ["verdict"],
    where: {
      contentType: data.content_type,
      contentId: data.content_id,
    },
    _count: { _all: true },
  });

  let credible = 0;
  let falseCount = 0;
  for (const row of aggregates) {
    if (row.verdict === "credible") credible = row._count._all;
    else falseCount = row._count._all;
  }

  return computeCommunityConfidence(credible, falseCount, data.verdict);
}

export async function createCommunityComment(data: CreateCommunityCommentInput) {
  const body = data.body?.trim();
  if (!body || body.length < 3) {
    throw new Error("Comment too short");
  }
  if (body.length > 2000) {
    throw new Error("Comment too long");
  }

  const authorName =
    data.profile_name?.trim() ||
    data.author_name?.trim() ||
    null;

  if (!isDatabaseConfigured()) {
    const comment: CommunityComment = {
      id: `seed-comment-${Date.now()}`,
      content_type: data.content_type,
      content_id: data.content_id,
      body,
      author_name: authorName ?? (data.profile_id ? "Usuario registrado" : "Anónimo"),
      is_registered: Boolean(data.profile_id),
      created_at: new Date().toISOString(),
    };
    const key = storeKey(data.content_type, data.content_id);
    const existing = seedCommentStore.get(key) ?? [];
    seedCommentStore.set(key, [comment, ...existing]);
    return comment;
  }

  const row = await prisma.communityComment.create({
    data: {
      contentType: data.content_type,
      contentId: data.content_id,
      body,
      authorName,
      voterToken: data.voter_token ?? null,
      profileId: data.profile_id ?? null,
    },
    include: {
      profile: { select: { fullName: true } },
    },
  });

  return {
    id: row.id,
    content_type: data.content_type,
    content_id: data.content_id,
    body: row.body,
    author_name: row.profile?.fullName ?? row.authorName ?? "Anónimo",
    is_registered: Boolean(row.profileId),
    created_at: row.createdAt.toISOString(),
  };
}

export async function fetchCommunityFeedbackBatch(
  contentType: CommunityContentType,
  contentIds: string[],
  voterToken?: string | null
): Promise<Record<string, CommunityCredibilityStats>> {
  const result: Record<string, CommunityCredibilityStats> = {};
  if (!contentIds.length) return result;

  if (!isDatabaseConfigured()) {
    for (const id of contentIds) {
      result[id] = getSeedVotes(contentType, id, voterToken);
    }
    return result;
  }

  const aggregates = await prisma.communityCredibilityVote.groupBy({
    by: ["contentId", "verdict"],
    where: {
      contentType,
      contentId: { in: contentIds },
    },
    _count: { _all: true },
  });

  const countsById = new Map<string, { credible: number; false: number }>();
  for (const id of contentIds) {
    countsById.set(id, { credible: 0, false: 0 });
  }
  for (const row of aggregates) {
    const current = countsById.get(row.contentId) ?? { credible: 0, false: 0 };
    if (row.verdict === "credible") current.credible = row._count._all;
    else current.false = row._count._all;
    countsById.set(row.contentId, current);
  }

  let userVotes: { contentId: string; verdict: CommunityVoteVerdict }[] = [];
  if (voterToken) {
    userVotes = await prisma.communityCredibilityVote.findMany({
      where: {
        contentType,
        contentId: { in: contentIds },
        voterToken,
      },
      select: { contentId: true, verdict: true },
    });
  }
  const userVoteById = new Map(userVotes.map((v) => [v.contentId, v.verdict]));

  for (const id of contentIds) {
    const counts = countsById.get(id) ?? { credible: 0, false: 0 };
    result[id] = computeCommunityConfidence(
      counts.credible,
      counts.false,
      userVoteById.get(id) ?? null
    );
  }

  return result;
}
