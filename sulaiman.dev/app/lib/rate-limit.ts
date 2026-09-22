/**
 * Small in-memory sliding-window limiter. State is per server instance, so on
 * serverless hosting it bounds abuse per instance rather than globally; that is
 * enough to stop a single client from hammering the chat endpoint.
 */
const buckets = new Map<string, number[]>()
const MAX_TRACKED_KEYS = 5000

export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfterSeconds: number }

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }): RateLimitResult {
  const now = Date.now()
  const cutoff = now - windowMs
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff)

  if (hits.length >= limit) {
    buckets.set(key, hits)
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) }
  }

  hits.push(now)
  buckets.set(key, hits)

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, v] of buckets) {
      if (v.every((t) => t <= cutoff)) buckets.delete(k)
    }
  }
  return { ok: true, remaining: limit - hits.length }
}
