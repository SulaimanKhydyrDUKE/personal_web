/**
 * The chat route with the Anthropic SDK replaced by a controllable fake.
 * Nothing here touches the network.
 */
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type FakeMessage = { stop_reason: string; content: unknown[] }
type Impl = (params: { messages: unknown[] }) => { text?: string; message: FakeMessage; throws?: Error }

const state: { impl: Impl | null } = { impl: null }

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {}
  class AuthenticationError extends APIError {}
  class RateLimitError extends APIError {}
  class APIConnectionError extends APIError {}
  class Anthropic {
    static APIError = APIError
    static AuthenticationError = AuthenticationError
    static RateLimitError = RateLimitError
    static APIConnectionError = APIConnectionError
    beta = {
      messages: {
        stream: (params: { messages: unknown[] }) => {
          const step = state.impl!(params)
          let onText: ((delta: string) => void) | null = null
          return {
            on(event: string, cb: (delta: string) => void) {
              if (event === "text") onText = cb
              return this
            },
            async finalMessage() {
              if (step.throws) throw step.throws
              if (step.text && onText) onText(step.text)
              return step.message
            },
          }
        },
      },
    }
  }
  return { default: Anthropic }
})

import { NOT_CONFIGURED_MESSAGE, POST } from "./route"

let ipCounter = 0
function request(body: unknown, ip = `10.0.0.${(ipCounter += 1)}`) {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

async function events(res: Response) {
  const text = await res.text()
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { type: string; text?: string; message?: string })
}

const ask = { messages: [{ role: "user", content: "What is Sulaiman working on?" }] }

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key")
  state.impl = () => ({ text: "He is building things.", message: { stop_reason: "end_turn", content: [] } })
})
afterEach(() => vi.unstubAllEnvs())

describe("POST /api/chat", () => {
  it("answers 503 with a plain message when the key is absent, before doing anything else", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "")
    const res = await POST(request(ask))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: NOT_CONFIGURED_MESSAGE })
  })

  it("rejects malformed bodies with 400", async () => {
    expect((await POST(request("not json"))).status).toBe(400)
    expect((await POST(request({ messages: [] }))).status).toBe(400)
    expect((await POST(request({ messages: [{ role: "assistant", content: "hi" }] }))).status).toBe(400)
    expect((await POST(request({ messages: [{ role: "user", content: "x".repeat(5000) }] }))).status).toBe(400)
  })

  it("streams text then done as newline-delimited JSON", async () => {
    const res = await POST(request(ask))
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("application/x-ndjson")
    const got = await events(res)
    expect(got).toEqual([{ type: "text", text: "He is building things." }, { type: "done" }])
  })

  it("turns an SDK authentication failure into a readable error event, not a crash", async () => {
    const sdk = await import("@anthropic-ai/sdk")
    // The real constructor takes (status, error, message, headers); the fake takes a message.
    const AuthError = sdk.default.AuthenticationError as unknown as new (message: string) => Error
    state.impl = () => ({ message: { stop_reason: "end_turn", content: [] }, throws: new AuthError("bad key") })
    const got = await events(await POST(request(ask)))
    expect(got).toEqual([{ type: "error", message: NOT_CONFIGURED_MESSAGE }])
  })

  it("passes a refusal through as an error event", async () => {
    state.impl = () => ({ message: { stop_reason: "refusal", content: [] } })
    const got = await events(await POST(request(ask)))
    expect(got[0]).toMatchObject({ type: "error" })
    expect(got.at(-1)).toEqual({ type: "done" })
  })

  it("rate-limits a single visitor after 20 requests in the window", async () => {
    const ip = "10.9.9.9"
    let last: Response | null = null
    for (let i = 0; i < 21; i += 1) last = await POST(request(ask, ip))
    expect(last!.status).toBe(429)
    expect(last!.headers.get("retry-after")).toMatch(/^\d+$/)
  })
})
