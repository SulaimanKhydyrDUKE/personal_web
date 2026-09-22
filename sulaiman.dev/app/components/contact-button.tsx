"use client"

import { openChat } from "./chat-widget"
import { MessageIcon } from "./icons"

/** Opens the chat assistant; usable from server components. */
export function ContactButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => openChat()} className={className}>
      <MessageIcon /> Send a message
    </button>
  )
}
