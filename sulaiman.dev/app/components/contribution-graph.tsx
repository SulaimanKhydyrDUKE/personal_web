"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import type { ContributionDay, ContributionStats } from "@/app/lib/github"
import { ArrowUpRightIcon } from "./icons"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" }

function utcDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`)
}

function formatDate(iso: string) {
  return utcDate(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** Group a flat, sorted list of days into Sunday-first columns of seven. */
function toWeeks(days: ContributionDay[]) {
  const weeks: (ContributionDay | null)[][] = []
  let week: (ContributionDay | null)[] = []
  const leading = utcDate(days[0].date).getUTCDay()
  for (let i = 0; i < leading; i += 1) week.push(null)
  for (const day of days) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

/** Column index + label wherever a new month begins, skipping crowded pairs. */
function monthLabels(weeks: (ContributionDay | null)[][]) {
  const labels: { column: number; text: string }[] = []
  let previousMonth = -1
  weeks.forEach((week, column) => {
    const first = week.find((d): d is ContributionDay => d !== null)
    if (!first) return
    const month = utcDate(first.date).getUTCMonth()
    if (month !== previousMonth) {
      labels.push({ column, text: MONTHS[month] })
      previousMonth = month
    }
  })
  return labels.filter((label, i) => {
    const next = labels[i + 1]
    return !next || next.column - label.column >= 3
  })
}

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

function Stat({ label, value, detail }: { label: string; value: number; detail?: string }) {
  const shown = useCountUp(value)
  return (
    <div className="min-w-0">
      <div className="text-2xl font-semibold tabular-nums tracking-tight">{shown}</div>
      <div className="truncate text-xs text-muted">
        {label}
        {detail && <span className="text-muted/70"> · {detail}</span>}
      </div>
    </div>
  )
}

type Tooltip = { day: ContributionDay; x: number; y: number }

export function ContributionGraph({
  login,
  days,
  stats,
}: {
  login: string
  days: ContributionDay[]
  stats: ContributionStats
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  const weeks = toWeeks(days)
  const labels = monthLabels(weeks)

  const showTooltip = (day: ContributionDay, cell: HTMLElement) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const c = cell.getBoundingClientRect()
    const w = wrapper.getBoundingClientRect()
    setTooltip({ day, x: c.left - w.left + c.width / 2, y: c.top - w.top })
  }

  return (
    <div ref={wrapperRef} className="relative rounded-xl border border-border p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">GitHub activity</h2>
        <a
          href={`https://github.com/${login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          @{login}
          <ArrowUpRightIcon width={12} height={12} />
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="contributions" detail="past year" value={stats.total} />
        <Stat label="day streak" detail="current" value={stats.currentStreak} />
        <Stat label="day streak" detail="longest" value={stats.longestStreak} />
        <Stat
          label="busiest day"
          detail={stats.busiest ? utcDate(stats.busiest.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : undefined}
          value={stats.busiest?.count ?? 0}
        />
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <div
          className="grid min-w-[640px] gap-[2px]"
          style={{
            gridTemplateColumns: `1.25rem repeat(${weeks.length}, minmax(0, 1fr))`,
            gridTemplateRows: "auto repeat(7, auto)",
          }}
          role="img"
          aria-label={`${stats.total} contributions in the past year`}
          onMouseLeave={() => setTooltip(null)}
        >
          {labels.map((label) => (
            <span
              key={label.column}
              aria-hidden="true"
              className="mb-1 whitespace-nowrap text-[10px] leading-none text-muted"
              style={{ gridColumn: label.column + 2, gridRow: 1 }}
            >
              {label.text}
            </span>
          ))}
          {Object.entries(WEEKDAY_LABELS).map(([row, text]) => (
            <span
              key={row}
              aria-hidden="true"
              className="self-center pr-1 text-[10px] leading-none text-muted"
              style={{ gridColumn: 1, gridRow: Number(row) + 2 }}
            >
              {text}
            </span>
          ))}
          {weeks.map((week, column) =>
            week.map((day, row) =>
              day ? (
                <a
                  key={day.date}
                  href={`https://github.com/${login}?tab=overview&from=${day.date}&to=${day.date}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  data-level={day.level}
                  aria-label={`${day.count} contributions on ${formatDate(day.date)}`}
                  className="contrib block aspect-square w-full animate-cell-in rounded-[2px]"
                  style={{ gridColumn: column + 2, gridRow: row + 2, animationDelay: `${column * 6}ms` } as CSSProperties}
                  onMouseEnter={(event) => showTooltip(day, event.currentTarget)}
                />
              ) : null,
            ),
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span>{stats.activeDays} active days · updated hourly</span>
        <span className="inline-flex items-center gap-1" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} data-level={level} className="contrib inline-block size-2.5 rounded-[2px]" />
          ))}
          More
        </span>
      </div>

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 animate-fade-in whitespace-nowrap rounded-md border border-border bg-background px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, calc(-100% - 8px))" }}
        >
          <span className="font-medium tabular-nums">
            {tooltip.day.count === 0 ? "No" : tooltip.day.count} contribution{tooltip.day.count === 1 ? "" : "s"}
          </span>
          <span className="text-muted"> on {formatDate(tooltip.day.date)}</span>
        </div>
      )}
    </div>
  )
}
