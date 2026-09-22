"use client"

import { useSyncExternalStore } from "react"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "theme"
const listeners = new Set<() => void>()

/**
 * Runs before first paint (inlined in the root layout) so the correct theme is
 * on <html> before any CSS applies. Keep in sync with resolveTheme().
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=t==="light"||t==="dark"?t:d?"dark":"light";var e=document.documentElement;e.setAttribute("data-theme",r);e.style.colorScheme=r}catch(e){}})();`

export function readTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === "light" || value === "dark" ? value : "system"
  } catch {
    return "system"
  }
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== "system") return theme
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this page.
  }
  applyTheme(theme)
  for (const listener of listeners) listener()
}

export function applyTheme(theme: Theme = readTheme()) {
  const resolved = resolveTheme(theme)
  const root = document.documentElement
  if (root.dataset.theme === resolved) return
  // Switching themes should not animate every element that has a transition.
  withoutTransitions(() => {
    root.dataset.theme = resolved
    root.style.colorScheme = resolved
  })
}

function withoutTransitions(update: () => void) {
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  update()
  // Force a style flush so the no-transition rule is applied before removal.
  void window.getComputedStyle(document.body).opacity
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const onMedia = () => {
    if (readTheme() === "system") applyTheme("system")
    onChange()
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      applyTheme()
      onChange()
    }
  }
  media.addEventListener("change", onMedia)
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    media.removeEventListener("change", onMedia)
    window.removeEventListener("storage", onStorage)
  }
}

const getServerTheme = (): Theme => "system"

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerTheme)
  return { theme, setTheme }
}
