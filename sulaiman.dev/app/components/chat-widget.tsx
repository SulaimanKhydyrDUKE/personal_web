"use client"

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { MessageIcon, SendIcon, StopIcon, XIcon } from "./icons"

const OPEN_EVENT = "chat:open"
const STORAGE_KEY = "chat:transcript"
const MAX_INPUT = 4000

const SUGGESTIONS = [
  "What is Sulaiman working on right now?",
  "Tell me about the HotMobile demo.",
  "I'd like to leave Sulaiman a message.",
]

/** Open the chat from anywhere (header, command palette, contact button). */
export function openChat() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

type ChatMessage =
  | { id: string; role: "user" | "assistant"; text: string }
  | { id: string; role: "notice"; text: string; tone: "ok" | "error" }

type StreamEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string; status: "start" | "ok" | "error" }
  | { type: "error"; message: string }
  | { type: "done" }

let counter = 0
const nextId = () => `m${Date.now().toString(36)}-${(counter += 1).toString(36)}`

function loadTranscript(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : []
  } catch {
    return []
  }
}

function saveTranscript(messages: ChatMessage[]) {
  try {
    if (messages.length === 0) sessionStorage.removeItem(STORAGE_KEY)
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Storage unavailable (private mode); the conversation still works for this page.
  }
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1" aria-label="Assistant is typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-pulse rounded-full bg-muted"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

/**
 * Floating assistant. Talks to /api/chat, which streams newline-delimited JSON
 * events; tool events become inline notices so the visitor can see whether a
 * message actually reached Sulaiman.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [restored, setRestored] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const panelId = useId()

  // Restore this tab's conversation after hydration, then keep it in sync.
  useEffect(() => {
    setMessages(loadTranscript())
    setRestored(true)
  }, [])
  useEffect(() => {
    if (restored) saveTranscript(messages)
  }, [messages, restored])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages, open])

  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const stop = () => abortRef.current?.abort()

  const reset = () => {
    stop()
    setMessages([])
    setInput("")
    inputRef.current?.focus()
  }

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!text || busy) return

    const userMessage: ChatMessage = { id: nextId(), role: "user", text }
    const history = [...messages, userMessage]
    let assistantId = nextId()
    setMessages([...history, { id: assistantId, role: "assistant", text: "" }])
    setInput("")
    if (inputRef.current) inputRef.current.style.height = ""
    setBusy(true)

    const controller = new AbortController()
    abortRef.current = controller

    const appendText = (delta: string) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId && m.role === "assistant" ? { ...m, text: m.text + delta } : m)))
    const pushNotice = (text: string, tone: "ok" | "error") => {
      const nextAssistant = nextId()
      setMessages((prev) => [
        ...prev.filter((m) => !(m.role === "assistant" && m.text === "")),
        { id: nextId(), role: "notice", text, tone },
        { id: nextAssistant, role: "assistant", text: "" },
      ])
      assistantId = nextAssistant
    }
    const handle = (event: StreamEvent) => {
      switch (event.type) {
        case "text":
          appendText(event.text)
          break
        case "tool":
          if (event.status === "ok") pushNotice("Message delivered to Sulaiman.", "ok")
          else if (event.status === "error") pushNotice("The message couldn't be delivered.", "error")
          break
        case "error":
          pushNotice(event.message, "error")
          break
        case "done":
          break
      }
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => m.role !== "notice").map((m) => ({ role: m.role, content: m.text })),
          page: window.location.pathname,
        }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) {
        const detail = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(detail?.error ?? "The assistant is unavailable right now.")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let newline = buffer.indexOf("\n")
        while (newline >= 0) {
          const line = buffer.slice(0, newline).trim()
          buffer = buffer.slice(newline + 1)
          if (line) {
            try {
              handle(JSON.parse(line) as StreamEvent)
            } catch {
              // Skip a malformed line rather than dropping the whole reply.
            }
          }
          newline = buffer.indexOf("\n")
        }
      }
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError"
      if (!aborted) pushNotice(error instanceof Error ? error.message : "Something went wrong.", "error")
    } finally {
      // Drop any bubble that never received text (e.g. after a stop or an error).
      setMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.text === "")))
      setBusy(false)
      abortRef.current = null
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void send(input)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void send(input)
    }
  }

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = ""
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  const waiting = busy && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.text === ""

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close chat" : "Chat with Sulaiman's assistant"}
        className="fixed bottom-5 right-5 z-40 inline-flex size-12 select-none items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <XIcon width={20} height={20} /> : <MessageIcon width={20} height={20} />}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation()
              close()
            }
          }}
          className="fixed bottom-20 right-5 z-40 flex max-h-[min(34rem,calc(100dvh-6.5rem))] w-[min(24rem,calc(100vw-2.5rem))] animate-pop flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/25"
        >
          <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-sm font-semibold">
                Ask about Sulaiman
              </h2>
              <p className="mt-0.5 text-xs text-muted">Answers come from this site. It can also pass a message to him.</p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="link-underline shrink-0 select-none text-xs text-muted transition-colors hover:text-foreground"
              >
                New chat
              </button>
            )}
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  Hi, I can answer questions about Sulaiman&apos;s work, or take a message for him.
                </p>
                <ul className="space-y-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => void send(suggestion)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-foreground/30 hover:bg-foreground/[0.03]"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {messages.map((m) => {
              if (m.role === "notice") {
                return (
                  <p key={m.id} className={`text-center text-xs ${m.tone === "ok" ? "text-accent" : "text-muted"}`}>
                    {m.text}
                  </p>
                )
              }
              if (m.role === "assistant" && m.text === "") return null
              const isUser = m.role === "user"
              return (
                <div
                  key={m.id}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isUser ? "ml-auto rounded-br-md bg-foreground text-background" : "mr-auto rounded-bl-md bg-foreground/[0.06]"
                  }`}
                >
                  {m.text}
                </div>
              )
            })}
            {waiting && <TypingDots />}
          </div>

          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-foreground/[0.02] px-3 py-2 transition-colors focus-within:border-foreground/30">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={MAX_INPUT}
                onChange={(event) => {
                  setInput(event.target.value)
                  autoGrow(event.target)
                }}
                onKeyDown={onKeyDown}
                placeholder="Ask a question or leave a message…"
                aria-label="Message"
                className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-base leading-6 outline-none placeholder:text-muted sm:text-sm"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop"
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <StopIcon width={14} height={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send"
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background transition-opacity disabled:opacity-30"
                >
                  <SendIcon width={14} height={14} />
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted">Powered by Claude. Please don&apos;t share anything sensitive.</p>
          </form>
        </div>
      )}
    </>
  )
}
