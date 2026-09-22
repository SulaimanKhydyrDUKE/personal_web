"use client"

import { useState } from "react"
import type { ExperienceItem } from "@/app/data/experience"
import { ArrowUpRightIcon, AwardIcon, ChevronDownIcon } from "./icons"

/**
 * Timeline accordion. Each role expands to its bullets; height animates via
 * the grid-template-rows 0fr → 1fr trick so nothing needs measuring.
 */
export function Experience({ items }: { items: ExperienceItem[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(items.slice(0, 1).map((i) => i.id)))
  const allOpen = open.size === items.length

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">Experience</h2>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(items.map((i) => i.id)))}
          className="link-underline select-none text-sm text-muted transition-colors hover:text-foreground"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <ol className="relative mt-4 ml-1.5 border-l border-border">
        {items.map((item) => {
          const isOpen = open.has(item.id)
          const panelId = `experience-${item.id}`
          return (
            <li key={item.id} className="relative pb-7 pl-6 last:pb-0" data-open={isOpen}>
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-[9px] size-[9px] rounded-full border-2 border-background bg-border transition-colors duration-200 data-[open=true]:bg-accent"
                data-open={isOpen}
              />
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="group -mx-2 flex w-[calc(100%+1rem)] select-none items-start justify-between gap-3 rounded-md px-2 py-1 text-left transition-colors hover:bg-foreground/[0.04]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{item.role}</span>
                    <span className="text-sm text-muted">{item.org}</span>
                  </div>
                  <div className="mt-0.5 text-sm text-muted">{item.summary}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <span className="whitespace-nowrap text-xs tabular-nums text-muted">{item.period}</span>
                  <ChevronDownIcon
                    className="text-muted transition-transform duration-200 group-aria-expanded:rotate-180"
                  />
                </div>
              </button>

              <div
                id={panelId}
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="pt-2 text-xs text-muted">
                    {item.orgHref ? (
                      <a
                        href={item.orgHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline inline-flex items-center gap-0.5 hover:text-foreground"
                      >
                        {item.org}
                        <ArrowUpRightIcon width={11} height={11} />
                      </a>
                    ) : (
                      item.org
                    )}
                    <span> · {item.location}</span>
                  </div>

                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-full bg-border" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {item.highlight && (
                    <a
                      href={item.highlight.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/[0.06] p-3 text-sm transition-colors hover:border-accent/60"
                    >
                      <AwardIcon className="mt-0.5 shrink-0 text-accent" />
                      <span>
                        <span className="font-medium">{item.highlight.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{item.highlight.description}</span>
                      </span>
                    </a>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-foreground/[0.06] px-2 py-0.5 text-xs text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {item.links?.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline inline-flex items-center gap-0.5 text-xs text-muted hover:text-foreground"
                      >
                        {link.label}
                        <ArrowUpRightIcon width={11} height={11} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
