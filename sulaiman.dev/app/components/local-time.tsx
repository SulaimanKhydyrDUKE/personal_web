"use client"

import { useSyncExternalStore } from "react"
import { site } from "@/app/data/site"

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: site.timeZone,
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
})

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000)
  return () => window.clearInterval(id)
}
const getSeconds = () => Math.floor(Date.now() / 1000)
const getServerSeconds = () => null

/** Wall-clock time in a zone as a UTC timestamp, for offset comparisons. */
function wallClock(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value)
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"))
}

function offsetNote(now: Date) {
  const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (!visitorZone) return null
  const hours = (wallClock(now, site.timeZone) - wallClock(now, visitorZone)) / 3_600_000
  const rounded = Math.round(hours * 2) / 2
  if (rounded === 0) return "same time as you"
  const abs = Math.abs(rounded)
  const unit = abs === 1 ? "hour" : "hours"
  return `${abs} ${unit} ${rounded > 0 ? "ahead of" : "behind"} you`
}

/**
 * "It's 3:42 PM for me" — a small sign the page is alive. Renders a placeholder
 * on the server and starts ticking after hydration.
 */
export function LocalTime() {
  const seconds = useSyncExternalStore(subscribe, getSeconds, getServerSeconds)
  const now = seconds === null ? null : new Date(seconds * 1000)
  const note = now ? offsetNote(now) : null

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-pulse rounded-full bg-emerald-400/60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span>{site.location}</span>
      <span aria-hidden="true">·</span>
      <time className="tabular-nums" dateTime={now?.toISOString()}>
        {now ? timeFormat.format(now) : "--:--:-- --"}
      </time>
      {note && <span className="text-muted/70">({note})</span>}
    </span>
  )
}
