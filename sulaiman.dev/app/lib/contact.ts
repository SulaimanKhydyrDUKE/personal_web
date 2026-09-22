/**
 * Delivers a visitor's message to Sulaiman. Runs server-side only.
 *
 * Channels, tried in order:
 *  1. Email via Resend when RESEND_API_KEY and CONTACT_TO_EMAIL are set.
 *  2. A JSON webhook (Discord, Slack, or anything that accepts POST) when
 *     CONTACT_WEBHOOK_URL is set.
 * With neither configured the message is not sent and the caller is told so.
 */
export type ContactMessage = {
  senderName: string
  senderContact: string
  message: string
  page?: string | null
}

export type DeliveryResult =
  | { ok: true; channel: "email" | "webhook" }
  | { ok: false; reason: "not_configured" | "failed" }

const LIMITS = { senderName: 100, senderContact: 200, message: 2000 } as const
const TIMEOUT_MS = 10_000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Drops control characters except tab, newline, and carriage return. */
function stripControlChars(value: string): string {
  let out = ""
  for (const ch of value) {
    const code = ch.charCodeAt(0)
    const isControl = (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127
    if (!isControl) out += ch
  }
  return out
}

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return ""
  return stripControlChars(value).trim().slice(0, max)
}

export function sanitizeContactMessage(input: ContactMessage): ContactMessage | null {
  const senderName = clean(input.senderName, LIMITS.senderName)
  const senderContact = clean(input.senderContact, LIMITS.senderContact)
  const message = clean(input.message, LIMITS.message)
  if (!senderName || !senderContact || !message) return null
  const page = clean(input.page ?? "", 200) || null
  return { senderName, senderContact, message, page }
}

export function isDeliveryConfigured(): boolean {
  return Boolean((process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) || process.env.CONTACT_WEBHOOK_URL)
}

function renderPlainText(m: ContactMessage): string {
  const lines = [
    `From: ${m.senderName}`,
    `Reply to: ${m.senderContact}`,
    m.page ? `Sent from: ${m.page}` : null,
    "",
    m.message,
  ]
  return lines.filter((line): line is string => line !== null).join("\n")
}

async function sendEmail(m: ContactMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  if (!apiKey || !to) return false
  const from = process.env.CONTACT_FROM_EMAIL ?? "sulaiman.dev <onboarding@resend.dev>"
  const body: Record<string, unknown> = {
    from,
    to: [to],
    subject: `New message from ${m.senderName} via sulaiman.dev`,
    text: renderPlainText(m),
  }
  if (EMAIL_PATTERN.test(m.senderContact)) body.reply_to = m.senderContact

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  return res.ok
}

async function sendWebhook(m: ContactMessage): Promise<boolean> {
  const url = process.env.CONTACT_WEBHOOK_URL
  if (!url) return false
  const text = `New message via sulaiman.dev\n${renderPlainText(m)}`
  // `content` is what Discord reads and `text` is what Slack reads; each ignores the other keys.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text.slice(0, 1900), text, ...m }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  return res.ok
}

export async function deliverMessage(input: ContactMessage): Promise<DeliveryResult> {
  const message = sanitizeContactMessage(input)
  if (!message) return { ok: false, reason: "failed" }
  if (!isDeliveryConfigured()) return { ok: false, reason: "not_configured" }

  try {
    if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
      if (await sendEmail(message)) return { ok: true, channel: "email" }
    }
    if (process.env.CONTACT_WEBHOOK_URL) {
      if (await sendWebhook(message)) return { ok: true, channel: "webhook" }
    }
  } catch {
    // Network failure or timeout: fall through to the failed result.
  }
  return { ok: false, reason: "failed" }
}
