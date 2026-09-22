import Anthropic from "@anthropic-ai/sdk"
import type { NextRequest } from "next/server"
import { SEND_MESSAGE_TOOL, buildSystemPrompt } from "@/app/lib/chat-context"
import { deliverMessage } from "@/app/lib/contact"
import { rateLimit } from "@/app/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

const MODEL = process.env.CHAT_MODEL ?? "claude-opus-5"
const MAX_MESSAGES = 40
const MAX_MESSAGE_CHARS = 4000
const MAX_TOTAL_CHARS = 40_000
/** Model turns per request: a reply, plus room for one tool call and its follow-up. */
const MAX_TURNS = 4
const RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 }

// Built once per server instance; it is the cached prefix of every request.
const SYSTEM_PROMPT = buildSystemPrompt()

const sendMessageTool = {
  name: SEND_MESSAGE_TOOL,
  description:
    "Send a message from the website visitor to Sulaiman. Call only after you have the visitor's name, a way to reply, and the message text, and the visitor has confirmed what they want sent.",
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
  if (error instanceof Anthropic.AuthenticationError) return "The assistant isn't configured on this deployment yet."
  if (error instanceof Anthropic.RateLimitError) return "The assistant is busy right now. Please try again in a minute."
  if (error instanceof Anthropic.APIConnectionError) return "Couldn't reach the assistant. Please try again."
  if (error instanceof Anthropic.APIError) return "The assistant hit an error. Please try again."
  return "Something went wrong. Please try again."
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError"
}

async function runTool(use: Anthropic.Beta.BetaToolUseBlock, page: string | null) {
  if (use.name !== SEND_MESSAGE_TOOL) {
    return { ok: false, content: `Unknown tool ${use.name}.` }
  }
  const input = use.input as { sender_name?: unknown; sender_contact?: unknown; message?: unknown }
  const result = await deliverMessage({
    senderName: typeof input.sender_name === "string" ? input.sender_name : "",
    senderContact: typeof input.sender_contact === "string" ? input.sender_contact : "",
    message: typeof input.message === "string" ? input.message : "",
    page,
  })
  if (result.ok) return { ok: true, content: "Delivered. Sulaiman will see the message and the reply contact." }
  if (result.reason === "not_configured") {
    return { ok: false, content: "Message delivery is not set up on this deployment. The message was NOT sent." }
  }
  return { ok: false, content: "Delivery failed. The message was NOT sent." }
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(`chat:${clientIp(request)}`, RATE_LIMIT)
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
  const { page } = parsed

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
              tools: [sendMessageTool],
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
            const outcome = await runTool(use, page)
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
