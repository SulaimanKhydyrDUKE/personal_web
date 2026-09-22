"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, type FocusEvent } from "react"
import { ArrowUpRightIcon } from "./icons"

export type NavItem = { label: string; href: string; external?: boolean }

function activeElement(nav: HTMLElement | null) {
  return nav?.querySelector<HTMLElement>("[data-active='true']") ?? null
}

function placePill(nav: HTMLElement | null, pill: HTMLElement | null, target: HTMLElement | null) {
  if (!nav || !pill) return
  if (!target) {
    pill.style.opacity = "0"
    return
  }
  const t = target.getBoundingClientRect()
  const n = nav.getBoundingClientRect()
  pill.style.opacity = "1"
  pill.style.transform = `translateX(${t.left - n.left}px)`
  pill.style.width = `${t.width}px`
}

/**
 * Header navigation with a background pill that slides to the hovered item
 * and settles back on the active route when the pointer leaves.
 */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const nav = navRef.current
    const pill = pillRef.current
    if (!nav || !pill) return
    // Jump (don't slide) to the new active item on route change.
    pill.style.transitionDuration = "0ms"
    placePill(nav, pill, activeElement(nav))
    const frame = requestAnimationFrame(() => {
      pill.style.transitionDuration = ""
    })
    const onResize = () => placePill(nav, pill, activeElement(nav))
    window.addEventListener("resize", onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", onResize)
    }
  }, [pathname])

  const settle = () => placePill(navRef.current, pillRef.current, activeElement(navRef.current))
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!navRef.current?.contains(event.relatedTarget as Node | null)) settle()
  }

  const itemClass =
    "relative z-10 select-none rounded-md px-3 py-1.5 transition-colors hover:text-foreground data-[active=true]:text-foreground inline-flex items-center gap-1"

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="relative flex items-center text-sm font-medium text-muted"
      onMouseLeave={settle}
      onBlur={onBlur}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 rounded-md bg-foreground/[0.06] opacity-0 transition-[transform,width,opacity] duration-200 ease-out"
      />
      {items.map((item) => {
        const hover = (event: { currentTarget: HTMLElement }) =>
          placePill(navRef.current, pillRef.current, event.currentTarget)
        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              data-active="false"
              className={itemClass}
              onMouseEnter={hover}
              onFocus={hover}
            >
              {item.label}
              <ArrowUpRightIcon width={12} height={12} className="opacity-60" />
            </a>
          )
        }
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active}
            aria-current={active ? "page" : undefined}
            className={itemClass}
            onMouseEnter={hover}
            onFocus={hover}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
