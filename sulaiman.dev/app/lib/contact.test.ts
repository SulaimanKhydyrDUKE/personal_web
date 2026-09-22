import { afterEach, describe, expect, it, vi } from "vitest"
import { deliverMessage, isDeliveryConfigured, sanitizeContactMessage } from "./contact"

const CONFIG_KEYS = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_WEBHOOK_URL"] as const

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function unconfigured() {
  for (const key of CONFIG_KEYS) vi.stubEnv(key, "")
}

describe("sanitizeContactMessage", () => {
  it("rejects a message with any required field empty", () => {
    expect(sanitizeContactMessage({ senderName: "", senderContact: "a@b.c", message: "hi" })).toBeNull()
    expect(sanitizeContactMessage({ senderName: "A", senderContact: "a@b.c", message: "   " })).toBeNull()
  })

  it("strips control characters and trims", () => {
    const out = sanitizeContactMessage({ senderName: " Ada\u0007 ", senderContact: "ada@x.y", message: "hello\u0000 there" })
    expect(out).toMatchObject({ senderName: "Ada", message: "hello there", page: null })
  })

  it("caps field lengths", () => {
    const out = sanitizeContactMessage({ senderName: "n".repeat(500), senderContact: "c", message: "m".repeat(5000) })
    expect(out?.senderName).toHaveLength(100)
    expect(out?.message).toHaveLength(2000)
  })
})

describe("deliverMessage", () => {
  it("reports not_configured when no channel is set, without sending anything", async () => {
    unconfigured()
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    expect(isDeliveryConfigured()).toBe(false)
    const result = await deliverMessage({ senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })
    expect(result).toEqual({ ok: false, reason: "not_configured" })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("reports failed for an invalid message before checking configuration", async () => {
    unconfigured()
    const result = await deliverMessage({ senderName: "", senderContact: "", message: "" })
    expect(result).toEqual({ ok: false, reason: "failed" })
  })

  it("reports failed when the only channel rejects", async () => {
    unconfigured()
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://hooks.example/test")
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })))
    const result = await deliverMessage({ senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })
    expect(result).toEqual({ ok: false, reason: "failed" })
  })

  it("reports failed when the channel throws", async () => {
    unconfigured()
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://hooks.example/test")
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down") }))
    const result = await deliverMessage({ senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })
    expect(result).toEqual({ ok: false, reason: "failed" })
  })

  it("delivers through the webhook when it accepts", async () => {
    unconfigured()
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://hooks.example/test")
    const fetchSpy = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal("fetch", fetchSpy)
    const result = await deliverMessage({ senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })
    expect(result).toEqual({ ok: true, channel: "webhook" })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("prefers email and falls back to the webhook", async () => {
    unconfigured()
    vi.stubEnv("RESEND_API_KEY", "re_test")
    vi.stubEnv("CONTACT_TO_EMAIL", "me@x.y")
    vi.stubEnv("CONTACT_WEBHOOK_URL", "https://hooks.example/test")
    const calls: string[] = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(url)
        return { ok: !url.includes("resend") }
      }),
    )
    const result = await deliverMessage({ senderName: "Ada", senderContact: "ada@x.y", message: "Hi" })
    expect(result).toEqual({ ok: true, channel: "webhook" })
    expect(calls[0]).toContain("resend")
    expect(calls[1]).toContain("hooks.example")
  })
})
