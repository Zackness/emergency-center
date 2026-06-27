type RateLimitOptions = {
  namespace: string;
  max: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

const JSON_CONTENT_TYPE = "application/json";
const DEFAULT_JSON_BODY_LIMIT = 64 * 1024;

export const PUBLIC_FORM_RATE_LIMIT = {
  max: 12,
  windowMs: 10 * 60 * 1000,
};

export const VOTE_RATE_LIMIT = {
  max: 60,
  windowMs: 10 * 60 * 1000,
};

export const AUTH_RATE_LIMIT = {
  max: 8,
  windowMs: 10 * 60 * 1000,
};

export const UPLOAD_RATE_LIMIT = {
  max: 8,
  windowMs: 10 * 60 * 1000,
};

function jsonError(message: string, status: number, extraHeaders?: HeadersInit) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": JSON_CONTENT_TYPE,
      ...extraHeaders,
    },
  });
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("fly-client-ip") ||
    "unknown"
  );
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function cleanupExpiredBuckets(now: number) {
  if (rateLimitBuckets.size < 5000) return;

  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}

export function rejectCrossOrigin(request: Request): Response | null {
  if (sameOrigin(request)) return null;
  return jsonError("Cross-origin requests are not allowed", 403);
}

export function rejectLargeRequest(
  request: Request,
  maxBytes: number
): Response | null {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return null;

  const bytes = Number(contentLength);
  if (!Number.isFinite(bytes) || bytes <= maxBytes) return null;

  return jsonError("Request body too large", 413);
}

export function rateLimit(
  request: Request,
  { namespace, max, windowMs }: RateLimitOptions
): Response | null {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const key = `${namespace}:${getClientIp(request)}`;
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;

  if (current.count <= max) return null;

  const retryAfter = Math.ceil((current.resetAt - now) / 1000);
  return jsonError("Too many requests", 429, {
    "Retry-After": String(Math.max(1, retryAfter)),
  });
}

function publicWritesEnabled(): boolean {
  const flag =
    (typeof import.meta !== "undefined" && import.meta.env?.ALLOW_PUBLIC_WRITES) ||
    process.env.ALLOW_PUBLIC_WRITES ||
    "";
  return flag === "true" || flag === "1";
}

export function rejectIfPublicWritesDisabled(): Response | null {
  if (publicWritesEnabled()) return null;
  return jsonError("Public submissions are disabled", 503);
}

export function guardRequest(
  request: Request,
  options: RateLimitOptions & { maxBodyBytes?: number }
): Response | null {
  return (
    rejectCrossOrigin(request) ||
    rejectLargeRequest(request, options.maxBodyBytes ?? DEFAULT_JSON_BODY_LIMIT) ||
    rateLimit(request, options)
  );
}

export function guardPublicWrite(
  request: Request,
  options: RateLimitOptions & { maxBodyBytes?: number }
): Response | null {
  return (
    rejectIfPublicWritesDisabled() ||
    guardRequest(request, options)
  );
}

export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxBytes = DEFAULT_JSON_BODY_LIMIT
): Promise<T> {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new Error("Request body too large");
  }

  return JSON.parse(text) as T;
}
