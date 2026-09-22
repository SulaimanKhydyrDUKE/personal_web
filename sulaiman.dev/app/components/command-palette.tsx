"use client"

import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { publications } from "@/app/data/experience"
import { projects } from "@/app/data/projects"
import { site } from "@/app/data/site"
import { setTheme, useTheme } from "@/app/lib/theme"
import { openChat } from "./chat-widget"
import {
  AwardIcon,
  BriefcaseIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  FolderIcon,
  GithubIcon,
  HomeIcon,
  LinkIcon,
  LinkedinIcon,
  MessageIcon,
  MonitorIcon,
  MoonIcon,
  PenIcon,
  SearchIcon,
  SunIcon,
  YoutubeIcon,
} from "./icons"

const OPEN_EVENT = "command-palette:open"

/** Open the palette from anywhere (e.g. the header button). */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

type Command = {
  id: string
  label: string
  group: string
  hint?: string
  keywords?: string
  icon: ReactNode
  /** Return "keep-open" to leave the palette open after running. */
  perform: () => void | "keep-open"
}

// ---- Platform-aware shortcut label (⌘ vs Ctrl), hydration-safe -------------

const noSubscribe = () => () => {}
const isMacClient = () => /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)
const isMacServer = () => true

export function useModifierKey() {
  return useSyncExternalStore(noSubscribe, isMacClient, isMacServer) ? "⌘" : "Ctrl"
}

export function Kbd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-foreground/[0.04] px-1 font-sans text-[10px] font-medium text-muted ${className}`}
    >
      {children}
    </kbd>
  )
}

export function ShortcutHint() {
  const mod = useModifierKey()
  return (
    <span className="inline-flex items-center gap-1">
      <Kbd>{mod}</Kbd>
      <Kbd>K</Kbd>
    </span>
  )
}

export function CommandButton() {
  const mod = useModifierKey()
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label="Open command menu"
      className="inline-flex h-8 select-none items-center gap-1.5 rounded-md px-2 text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
    >
      <SearchIcon />
      <span className="hidden items-center gap-0.5 sm:inline-flex">
        <Kbd>{mod}</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  )
}

// ---- Matching ---------------------------------------------------------------

function isSubsequence(needle: string, haystack: string) {
  let i = 0
  for (const ch of haystack) {
    if (ch === needle[i]) i += 1
    if (i === needle.length) return true
  }
  return needle.length === 0
}

function score(command: Command, query: string) {
  if (!query) return 1
  const label = command.label.toLowerCase()
  const haystack = `${label} ${command.group} ${command.hint ?? ""} ${command.keywords ?? ""}`.toLowerCase()
  if (label.startsWith(query)) return 4
  if (label.includes(query)) return 3
  if (haystack.includes(query)) return 2
  if (isSubsequence(query, label)) return 1
  return 0
}

// ---- Palette ----------------------------------------------------------------

export function CommandPalette() {
  const router = useRouter()
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<Element | null>(null)
  const listId = useId()

  const openPalette = useCallback(() => {
    returnFocusRef.current = document.activeElement
    setQuery("")
    setActive(0)
    setCopiedId(null)
    setOpen(true)
  }, [])
  const closePalette = useCallback(() => {
    setOpen(false)
    const el = returnFocusRef.current
    if (el instanceof HTMLElement) el.focus()
  }, [])

  const commands = useMemo<Command[]>(() => {
    const external = (url: string) => () => {
      window.open(url, "_blank", "noopener,noreferrer")
    }
    const themeHint = (value: typeof theme) => (theme === value ? "Active" : undefined)
    return [
      { id: "home", group: "Navigate", label: "Home", icon: <HomeIcon />, perform: () => router.push("/") },
      { id: "projects", group: "Navigate", label: "Projects", icon: <FolderIcon />, perform: () => router.push("/projects") },
      { id: "writing", group: "Navigate", label: "Writing", keywords: "blog posts articles", icon: <PenIcon />, perform: () => router.push("/writing") },
      { id: "experience", group: "Navigate", label: "Experience", keywords: "resume work jobs internships lab", icon: <BriefcaseIcon />, perform: () => router.push("/#experience") },
      { id: "publications", group: "Navigate", label: "Publications", keywords: "papers demo hotmobile award", icon: <AwardIcon />, perform: () => router.push("/#publications") },
      ...publications.map<Command>((pub) => ({
        id: `pub:${pub.doi}`,
        group: "Publications",
        label: pub.title.replace(/^Demo: /, ""),
        hint: pub.award ? `${pub.venue.split(",")[0] ?? pub.venue} · ${pub.award}` : pub.venue,
        keywords: pub.authors.join(" "),
        icon: <AwardIcon />,
        perform: external(pub.href),
      })),
      ...projects.map<Command>((p) => ({
        id: `project:${p.title}`,
        group: "Projects",
        label: p.title,
        hint: p.tags.join(" · "),
        keywords: p.description,
        icon: <CodeIcon />,
        perform: p.href ? external(p.href) : () => router.push("/projects"),
      })),
      { id: "github", group: "Links", label: "GitHub", hint: `@${site.githubLogin}`, icon: <GithubIcon />, perform: external(site.links.github) },
      { id: "linkedin", group: "Links", label: "LinkedIn", icon: <LinkedinIcon />, perform: external(site.links.linkedin) },
      { id: "youtube", group: "Links", label: "YouTube", icon: <YoutubeIcon />, perform: external(site.links.youtube) },
      { id: "lab", group: "Links", label: "Duke I3T Lab profile", keywords: "gorlatova research", icon: <LinkIcon />, perform: external(site.links.lab) },
      { id: "source", group: "Links", label: "View site source", hint: site.repo.name, keywords: "code repository", icon: <LinkIcon />, perform: external(`https://github.com/${site.repo.owner}/${site.repo.name}`) },
      {
        id: "message",
        group: "Actions",
        label: "Message Sulaiman",
        hint: "via the assistant",
        keywords: "contact email chat hire collaborate say hi",
        icon: <MessageIcon />,
        perform: () => openChat(),
      },
      {
        id: "copy-url",
        group: "Actions",
        label: "Copy page URL",
        keywords: "share link clipboard",
        icon: <CopyIcon />,
        perform: () => {
          void navigator.clipboard?.writeText(window.location.href)
          return "keep-open"
        },
      },
      { id: "theme:light", group: "Theme", label: "Light", hint: themeHint("light"), icon: <SunIcon />, perform: () => setTheme("light") },
      { id: "theme:dark", group: "Theme", label: "Dark", hint: themeHint("dark"), icon: <MoonIcon />, perform: () => setTheme("dark") },
      { id: "theme:system", group: "Theme", label: "System", hint: themeHint("system"), keywords: "auto", icon: <MonitorIcon />, perform: () => setTheme("system") },
    ]
  }, [router, theme])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return commands
      .map((command, index) => ({ command, index, score: score(command, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((r) => r.command)
  }, [commands, query])

  const groups = useMemo(() => {
    const map = new Map<string, Command[]>()
    for (const command of results) {
      const list = map.get(command.group) ?? []
      list.push(command)
      map.set(command.group, list)
    }
    return [...map.entries()]
  }, [results])

  const run = (command: Command | undefined) => {
    if (!command) return
    const outcome = command.perform()
    if (outcome === "keep-open") {
      setCopiedId(command.id)
      window.setTimeout(() => setCopiedId(null), 1500)
      return
    }
    closePalette()
  }

  // Global shortcuts and the custom open event.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (open) closePalette()
        else openPalette()
      } else if (event.key === "Escape" && open) {
        closePalette()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener(OPEN_EVENT, openPalette)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener(OPEN_EVENT, openPalette)
    }
  }, [open, openPalette, closePalette])

  // Lock page scroll and focus the input while open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Keep the active row visible during keyboard navigation.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[data-active='true']")
      ?.scrollIntoView({ block: "nearest" })
  }, [active, results])

  if (!open) return null

  const activeCommand = results[active]
  const optionId = (command: Command) => `${listId}-${command.id}`

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]">
      <div
        className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]"
        onMouseDown={closePalette}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="relative w-full max-w-lg animate-pop overflow-hidden rounded-xl border border-border bg-background shadow-2xl shadow-black/20"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            run(activeCommand)
          }}
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <SearchIcon className="shrink-0 text-muted" />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setActive((i) => (results.length ? (i + 1) % results.length : 0))
                } else if (event.key === "ArrowUp") {
                  event.preventDefault()
                  setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
                } else if (event.key === "Home") {
                  event.preventDefault()
                  setActive(0)
                } else if (event.key === "End") {
                  event.preventDefault()
                  setActive(Math.max(0, results.length - 1))
                }
              }}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeCommand ? optionId(activeCommand) : undefined}
              aria-autocomplete="list"
              placeholder="Type a command or search…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted sm:text-sm"
            />
            <Kbd>esc</Kbd>
          </div>

          <div ref={listRef} id={listId} role="listbox" className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted">No results for “{query}”</p>
            )}
            {groups.map(([group, items]) => (
              <div key={group} role="group" aria-label={group}>
                <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                  {group}
                </div>
                {items.map((command) => {
                  const index = results.indexOf(command)
                  const isActive = index === active
                  const copied = copiedId === command.id
                  return (
                    <div
                      key={command.id}
                      id={optionId(command)}
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      onMouseMove={() => setActive(index)}
                      onClick={() => run(command)}
                      className="flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm data-[active=true]:bg-foreground/[0.06]"
                    >
                      <span className="shrink-0 text-muted">{copied ? <CheckIcon className="text-emerald-500" /> : command.icon}</span>
                      <span className="flex-1 truncate">{copied ? "Copied" : command.label}</span>
                      {command.hint && <span className="shrink-0 text-xs text-muted">{command.hint}</span>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
            <span className="inline-flex items-center gap-1"><Kbd>↵</Kbd> select</span>
            <span className="inline-flex items-center gap-1"><Kbd>esc</Kbd> close</span>
          </div>
        </form>
      </div>
    </div>
  )
}
