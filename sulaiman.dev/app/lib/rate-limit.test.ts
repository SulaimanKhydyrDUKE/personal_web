import { describe, expect, it } from "vitest"
import { rateLimit } from "./rate-limit"

describe("rateLimit", () => {
  it("allows up to the limit inside the window, then refuses with a retry hint", () => {
    const key = `test:${Math.random()}`
    const opts = { limit: 3, windowMs: 60_000 }
    expect(rateLimit(key, opts)).toEqual({ ok: true, remaining: 2 })
    expect(rateLimit(key, opts)).toEqual({ ok: true, remaining: 1 })
    expect(rateLimit(key, opts)).toEqual({ ok: true, remaining: 0 })
    const refused = rateLimit(key, opts)
    expect(refused.ok).toBe(false)
    if (!refused.ok) expect(refused.retryAfterSeconds).toBeGreaterThanOrEqual(1)
  })

  it("keeps keys independent", () => {
    const opts = { limit: 1, windowMs: 60_000 }
    expect(rateLimit(`a:${Math.random()}`, opts).ok).toBe(true)
    expect(rateLimit(`b:${Math.random()}`, opts).ok).toBe(true)
  })
})
