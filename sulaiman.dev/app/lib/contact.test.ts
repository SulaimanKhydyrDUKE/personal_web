import { afterEach, describe, expect, it, vi } from "vitest"
import { deliverMessage, renderEmail, sanitizeOutgoing } from "./contact"

const CONFIG_KEYS = ["SMTP_USER", "SMTP_PASS", "RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_WEBHOOK_URL"] as const

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function unconfigured() {
  for (const key of CONFIG_KEYS) vi.stubEnv(key, "")
}

describe("sanitizeOutgoing", () => {
  it("rejects a message with any required field empty", () => {
    expect(sanitizeOutgoing({ kind: "message", senderName: "", senderContact: "a@b.c", message: "hi" })).toBeNull()
    expect(sanitizeOutgoing({ kind: "message", senderName: "A", senderContact: "a@b.c", message: "   " })).toBeNull()
  })

  it("strips control characters and folds names onto one line", () => {
    const out = sanitizeOutgoing({ kind: "message", senderName: "Ada\r\nLovelace\u0007", senderContact: "ada@x.y", message: "hello\u0000 there" })
    expect(out).toMatchObject({ senderName: "Ada Lovelace", message: "hello there" })
  })
})

describe("renderEmail", () => {
  it("keeps the subject header single-line and only sets reply-to for real addresses", () => {
    const m = sanitizeOutgoing({ kind: "message", senderName: "Ada", senderContact: "@ada", message: "Hi" })
    const email = renderEmail(m!)
    expect(email.subject).not.toMatch(/[\r\n]/)
    expect(email.replyTo).toBeUndefined()
    const withEmail = renderEmail(sanitizeOutgoing({ kind: "message", senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })!)
    expect(withEmail.replyTo).toBe("ada@x.y")
  })
})

describe("deliverMessage", () => {
  it("reports not_configured when no channel is set, without sending anything", async () => {
    unconfigured()
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const result = await deliverMessage({ kind: "message", senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })
    expect(result).toEqual({ ok: false, reason: "not_configured" })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("reports invalid before checking configuration", async () => {
    unconfigured()
    const result = await deliverMessage({ kind: "message", senderName: "", senderContact: "", message: "" })
    expect(result).toEqual({ ok: false, reason: "invalid" })
  })

  it("reports failed when the only channel errors", async () => {
    unconfigured()
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://hooks.example/test")
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })))
    const result = await deliverMessage({ kind: "notification", subject: "Test", summary: "Something" })
    expect(result).toEqual({ ok: false, reason: "failed" })
  })

  it("delivers through the webhook when it accepts", async () => {
    unconfigured()
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://hooks.example/test")
    const fetchSpy = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal("fetch", fetchSpy)
    const result = await deliverMessage({ kind: "message", senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })
    expect(result).toEqual({ ok: true, channel: "webhook" })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
