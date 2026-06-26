import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import { getCommunityVoterToken } from "@/lib/community-voter-token";
import type {
  CommunityComment,
  CommunityConfidenceLevel,
  CommunityContentType,
  CommunityCredibilityStats,
  CommunityVoteVerdict,
} from "@/types/community-feedback";

interface CommunityFeedbackProps {
  contentType: CommunityContentType;
  contentId: string;
  locale: "es" | "en";
  labels: Record<string, string>;
  confidenceLabels: Record<CommunityConfidenceLevel, string>;
  compact?: boolean;
}

function confidenceClass(level: CommunityConfidenceLevel) {
  switch (level) {
    case "likely_credible":
      return "bg-success-muted text-success";
    case "likely_false":
      return "bg-emergency-muted text-emergency";
    case "disputed":
      return "bg-warning-muted text-warning";
    default:
      return "bg-surface-muted text-ink-secondary";
  }
}

function formatDate(dateStr: string, locale: "es" | "en") {
  return new Date(dateStr).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunityFeedback({
  contentType,
  contentId,
  locale,
  labels,
  confidenceLabels,
  compact = false,
}: CommunityFeedbackProps) {
  const [open, setOpen] = useState(!compact);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [credibility, setCredibility] = useState<CommunityCredibilityStats | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");

  async function loadFeedback() {
    setLoading(true);
    setError("");
    try {
      const voterToken = getCommunityVoterToken();
      const params = new URLSearchParams({
        content_type: contentType,
        content_id: contentId,
        voter_token: voterToken,
      });
      const res = await fetch(`/api/community/feedback?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setCredibility(data.credibility);
      setComments(data.comments ?? []);
      setCommentCount(data.comment_count ?? 0);
    } catch {
      setError(labels.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) loadFeedback();
  }, [contentType, contentId, open]);

  async function handleVote(verdict: CommunityVoteVerdict) {
    setVoting(true);
    setError("");
    try {
      const res = await fetch("/api/community/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          verdict,
          voter_token: getCommunityVoterToken(),
        }),
      });
      if (!res.ok) throw new Error("vote failed");
      const data = await res.json();
      setCredibility(data.credibility);
    } catch {
      setError(labels.voteError);
    } finally {
      setVoting(false);
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          body: commentBody,
          author_name: authorName.trim() || null,
          voter_token: getCommunityVoterToken(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "comment failed");
      }
      const data = await res.json();
      setComments((current) => [data.comment, ...current]);
      setCommentCount((count) => count + 1);
      setCommentBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.commentError);
    } finally {
      setSubmitting(false);
    }
  }

  const stats = credibility ?? {
    credible_count: 0,
    false_count: 0,
    total_votes: 0,
    credible_percent: null,
    confidence: "unrated" as const,
    user_verdict: null,
  };
  const percent = stats.credible_percent ?? 0;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <MessageSquare className="h-4 w-4 text-accent" />
          {labels.sectionTitle}
          {stats.total_votes > 0 && (
            <span className={`badge text-xs ${confidenceClass(stats.confidence)}`}>
              {confidenceLabels[stats.confidence]}
            </span>
          )}
          {commentCount > 0 && (
            <span className="text-xs text-ink-muted">
              · {commentCount} {labels.commentsCount}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-ink-secondary transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          {error && (
            <p className="rounded-xl bg-emergency-muted px-3 py-2 text-xs text-emergency">{error}</p>
          )}

          {loading ? (
            <p className="text-sm text-ink-secondary">{labels.loading}</p>
          ) : (
            <>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">{labels.credibilityTitle}</span>
                  {stats.total_votes > 0 ? (
                    <span className="text-ink-secondary">
                      {labels.crediblePercent.replace("{percent}", String(percent))} ·{" "}
                      {labels.votes}: {stats.total_votes}
                    </span>
                  ) : (
                    <span className="text-ink-muted">{labels.noVotes}</span>
                  )}
                </div>

                {stats.total_votes > 0 && (
                  <div className="mb-3 h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-success transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}

                <p className="mb-3 text-xs text-ink-muted">{labels.voteHint}</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn-secondary text-xs ${
                      stats.user_verdict === "credible"
                        ? "!border-success !bg-success-muted !text-success"
                        : ""
                    }`}
                    disabled={voting}
                    onClick={() => handleVote("credible")}
                  >
                    {labels.voteCredible}
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary text-xs ${
                      stats.user_verdict === "false"
                        ? "!border-emergency !bg-emergency-muted !text-emergency"
                        : ""
                    }`}
                    disabled={voting}
                    onClick={() => handleVote("false")}
                  >
                    {labels.voteFalse}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink">
                  {labels.commentsTitle} ({commentCount})
                </h4>

                {comments.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-muted">{labels.noComments}</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {comments.map((comment) => (
                      <li
                        key={comment.id}
                        className="rounded-xl border border-border bg-surface-muted/50 px-3 py-2.5"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                          <span className="font-medium text-ink-secondary">
                            {comment.author_name ?? labels.anonymous}
                          </span>
                          {comment.is_registered && (
                            <span className="badge bg-accent-muted text-accent text-[10px]">
                              {labels.registered}
                            </span>
                          )}
                          <span>{formatDate(comment.created_at, locale)}</span>
                        </div>
                        <p className="mt-1 text-sm text-ink-secondary whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleComment} className="mt-4 space-y-3">
                  <p className="text-xs text-ink-muted">{labels.commentHint}</p>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    placeholder={labels.authorPlaceholder}
                    className="input text-sm"
                    maxLength={80}
                  />
                  <textarea
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    placeholder={labels.commentPlaceholder}
                    className="input min-h-[88px] text-sm"
                    maxLength={2000}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-secondary text-xs"
                    disabled={submitting || commentBody.trim().length < 3}
                  >
                    {submitting ? labels.submitting : labels.submitComment}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
