"use client"

import type { MouseEvent, ReactNode } from "react"
import { useRef } from "react"

/**
 * Tracks the pointer across a group of cards and writes the position into
 * each card's --x/--y custom properties. The visuals live in globals.css
 * (.spotlight). DOM is updated directly so mousemove never triggers a render.
 */
export function SpotlightGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const cards = ref.current?.querySelectorAll<HTMLElement>("[data-spotlight]")
    if (!cards) return
    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      card.style.setProperty("--x", `${event.clientX - rect.left}px`)
      card.style.setProperty("--y", `${event.clientY - rect.top}px`)
    }
  }

  return (
    <div ref={ref} onMouseMove={onMouseMove} className={`spotlight-group ${className ?? ""}`}>
      {children}
    </div>
  )
}
