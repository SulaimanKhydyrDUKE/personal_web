import Anthropic from "@anthropic-ai/sdk"
import type { NextRequest } from "next/server"
import { NOTIFY_TOOL, SEND_MESSAGE_TOOL, buildSystemPrompt } from "@/app/lib/chat-context"
import { deliverMessage, type DeliveryResult } from "@/app/lib/contact"
import { rateLimit } from "@/app/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

const MODEL = process.env.CHAT_MODEL ?? "claude-opus-5"
const MAX_MESSAGES = 40
const MAX_MESSAGE_CHARS = 4000
const MAX_TOTAL_CHARS = 40_000
/** Model turns per request: a reply, plus room for a tool call and its follow-up. */
const MAX_TURNS = 4
const RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 }
/** Emails a single visitor can trigger, and the instance-wide ceiling, per hour. */
const EMAIL_LIMIT_PER_IP = { limit: 3, windowMs: 60 * 60 * 1000 }
const EMAIL_LIMIT_GLOBAL = { limit: 40, windowMs: 60 * 60 * 1000 }
/** How much of the conversation rides along with a heads-up email. */
const TRANSCRIPT_MESSAGES = 10
const TRANSCRIPT_CHARS_PER_MESSAGE = 700

// Built once per server instance; it is the cached prefix of every request.
const SYSTEM_PROMPT = buildSystemPrompt()

const sendMessageTool = {
  name: SEND_MESSAGE_TOOL,
  description:
    "Email Sulaiman a message written by the website visitor, in their own words. Call only after you have the visitor's name, a way to reply, and the message text, and the visitor has confirmed what they want sent.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      sender_name: { type: "string", description: "The visitor's name as they gave it." },
      sender_contact: { type: "string", description: "An email address or other handle Sulaiman can reply to." },
      message: { type: "string", description: "The message to deliver, in the visitor's own words." },
    },
    required: ["sender_name", "sender_contact", "message"],
    additionalProperties: false,
  },
} satisfies Anthropic.Beta.BetaTool

const notifyTool = {
  name: NOTIFY_TOOL,
  description:
    "Email Sulaiman a heads-up that you write yourself, when a conversation contains something he would want to see promptly (hiring or collaboration interest, an availability question the facts cannot answer, a broken-site report, anything time-sensitive). The recent conversation is attached automatically. At most once per conversation. Do not use it for questions the facts already answer or for small talk.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      subject: { type: "string", description: "A specific subject line, under 100 characters." },
      summary: {
        type: "string",
        description: "What the visitor said, what they want, and why it matters to Sulaiman. Include any contact details or names they volunteered.",
      },
      visitor_contact: {
        type: "string",
        description: "The visitor's email or handle if they gave one; an empty string otherwise.",
      },
    },
    required: ["subject", "summary", "visitor_contact"],
    additionalProperties: false,
  },
} satisfies Anthropic.Beta.BetaTool

type IncomingMessage = { role: "user" | "assistant"; content: string }
type ParsedBody = { messages: IncomingMessage[]; page: string | null }

/** Server → client events, one JSON object per line. */
type ChatEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string; status: "start" | "ok" | "error" }
  | { type: "error"; message: string }
  | { type: "done" }

function parseBody(body: unknown): ParsedBody | null {
  if (!body || typeof body !== "object") return null
  const raw = (body as { messages?: unknown; page?: unknown }).messages
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null

  const messages: IncomingMessage[] = []
  let total = 0
  for (const item of raw) {
    if (!item || typeof item !== "object") return null
    const { role, content } = item as { role?: unknown; content?: unknown }
    if (role !== "user" && role !== "assistant") return null
    if (typeof content !== "string") return null
    const text = content.trim()
    if (!text || text.length > MAX_MESSAGE_CHARS) return null
    total += text.length
    if (total > MAX_TOTAL_CHARS) return null
    messages.push({ role, content: text })
  }
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") return null

  const pageRaw = (body as { page?: unknown }).page
  const page = typeof pageRaw === "string" && pageRaw.startsWith("/") ? pageRaw.slice(0, 200) : null
  return { messages, page }
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

function json(data: unknown, status: number, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } })
}

function describeError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return NOT_CONFIGURED_MESSAGE
  if (error instanceof Anthropic.RateLimitError) return "The assistant is busy right now. Please try again in a minute."
  if (error instanceof Anthropic.APIConnectionError) return "Couldn't reach the assistant. Please try again."
  if (error instanceof Anthropic.APIError) return "The assistant hit an error. Please try again."
  return "Something went wrong. Please try again."
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError"
}

/** Plain-text excerpt of the conversation for heads-up emails. */
function transcriptExcerpt(messages: IncomingMessage[]): string {
  return messages
    .slice(-TRANSCRIPT_MESSAGES)
    .map((m) => {
      const text = m.content.length > TRANSCRIPT_CHARS_PER_MESSAGE ? `${m.content.slice(0, TRANSCRIPT_CHARS_PER_MESSAGE)}…` : m.content
      return `${m.role === "user" ? "Visitor" : "Assistant"}: ${text}`
    })
    .join("\n\n")
}

function str(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function describeDelivery(result: DeliveryResult, what: string): { ok: boolean; content: string } {
  if (result.ok) return { ok: true, content: `Delivered by ${result.channel}. Sulaiman will see the ${what}.` }
  if (result.reason === "not_configured") {
    return { ok: false, content: `Email delivery is not set up on this deployment. The ${what} was NOT sent.` }
  }
  if (result.reason === "invalid") return { ok: false, content: `The ${what} was empty or malformed and was NOT sent.` }
  return { ok: false, content: `Delivery failed. The ${what} was NOT sent.` }
}

type ToolContext = { ip: string; page: string | null; transcript: string }

async function runTool(use: Anthropic.Beta.BetaToolUseBlock, ctx: ToolContext): Promise<{ ok: boolean; content: string }> {
  if (use.name !== SEND_MESSAGE_TOOL && use.name !== NOTIFY_TOOL) {
    return { ok: false, content: `Unknown tool ${use.name}.` }
  }

  // Both tools send email, so both share the per-visitor and instance-wide caps.
  const perIp = rateLimit(`email:${ctx.ip}`, EMAIL_LIMIT_PER_IP)
  const global = rateLimit("email:global", EMAIL_LIMIT_GLOBAL)
  if (!perIp.ok || !global.ok) {
    return { ok: false, content: "Email limit reached for now. Nothing was sent; suggest LinkedIn instead." }
  }

  const input = use.input as Record<string, unknown>
  if (use.name === SEND_MESSAGE_TOOL) {
    const result = await deliverMessage({
      kind: "message",
      senderName: str(input.sender_name),
      senderContact: str(input.sender_contact),
      message: str(input.message),
      page: ctx.page,
    })
    return describeDelivery(result, "message and the reply contact")
  }

  const result = await deliverMessage({
    kind: "notification",
    subject: str(input.subject),
    summary: str(input.summary),
    visitorContact: str(input.visitor_contact) || null,
    transcript: ctx.transcript,
    page: ctx.page,
  })
  return describeDelivery(result, "heads-up")
}

export const NOT_CONFIGURED_MESSAGE = "The assistant isn't configured on this deployment yet."

export async function POST(request: NextRequest) {
  // Say so plainly instead of letting the SDK throw a 500 from the constructor.
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: NOT_CONFIGURED_MESSAGE }, 503)

  const ip = clientIp(request)
  const limit = rateLimit(`chat:${ip}`, RATE_LIMIT)
  if (!limit.ok) {
    return json(
      { error: "Too many messages in a short time. Please try again in a few minutes." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    )
  }

  let parsed: ParsedBody | null = null
  try {
    parsed = parseBody(await request.json())
  } catch {
    parsed = null
  }
  if (!parsed) return json({ error: "Invalid request." }, 400)

  const toolContext: ToolContext = { ip, page: parsed.page, transcript: transcriptExcerpt(parsed.messages) }
  const client = new Anthropic()
  const messages: Anthropic.Beta.BetaMessageParam[] = parsed.messages.map((m) => ({ role: m.role, content: m.content }))
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      try {
        for (let turn = 0; turn < MAX_TURNS; turn += 1) {
          const run = client.beta.messages.stream(
            {
              model: MODEL,
              max_tokens: 4096,
              betas: ["server-side-fallback-2026-07-01"],
              fallbacks: "default",
              output_config: { effort: "low" },
              system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
              tools: [sendMessageTool, notifyTool],
              messages,
            },
            { signal: request.signal },
          )
          run.on("text", (delta) => emit({ type: "text", text: delta }))
          const message = await run.finalMessage()

          if (message.stop_reason === "refusal") {
            emit({ type: "error", message: "I can't help with that one, but I'm happy to answer questions about Sulaiman." })
            break
          }
          if (message.stop_reason === "pause_turn") {
            messages.push({ role: "assistant", content: message.content })
            continue
          }
          if (message.stop_reason !== "tool_use") break

          const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use")
          messages.push({ role: "assistant", content: message.content })

          const results: Anthropic.Beta.BetaToolResultBlockParam[] = []
          for (const use of toolUses) {
            emit({ type: "tool", name: use.name, status: "start" })
            const outcome = await runTool(use, toolContext)
            emit({ type: "tool", name: use.name, status: outcome.ok ? "ok" : "error" })
            results.push({ type: "tool_result", tool_use_id: use.id, content: outcome.content, is_error: !outcome.ok })
          }
          messages.push({ role: "user", content: results })
        }
        emit({ type: "done" })
      } catch (error) {
        if (!isAbort(error)) {
          console.error("[chat]", error instanceof Error ? `${error.name}: ${error.message}` : "unknown error")
          try {
            emit({ type: "error", message: describeError(error) })
          } catch {
            // The client went away; nothing left to tell.
          }
        }
      } finally {
        try {
          controller.close()
        } catch {
          // Already closed.
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  })
}
