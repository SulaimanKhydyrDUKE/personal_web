"use client"

import { readTheme, resolveTheme, setTheme } from "@/app/lib/theme"
import { MoonIcon, SunIcon } from "./icons"

/**
 * Flips between light and dark. The icon is chosen by CSS via the `dark:`
 * variant so the server and client markup match and nothing flashes on load.
 * "System" is still reachable from the command palette.
 */
export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolveTheme(readTheme()) === "dark" ? "light" : "dark")}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground select-none"
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </button>
  )
}
