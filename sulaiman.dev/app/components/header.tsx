import Link from "next/link"
import { site } from "@/app/data/site"
import { CommandButton } from "./command-palette"
import { NavLinks, type NavItem } from "./nav-links"
import { ThemeToggle } from "./theme-toggle"

const items: NavItem[] = [
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing" },
  { label: "GitHub", href: site.links.github, external: true },
]

export default function Header() {
  return (
    <header className="mb-12 flex items-center justify-between gap-4">
      <Link href="/" className="font-semibold tracking-tight transition-opacity hover:opacity-70">
        {site.handle}
      </Link>
      <div className="flex items-center">
        <NavLinks items={items} />
        <div className="ml-2 flex items-center gap-0.5 border-l border-border pl-2">
          <CommandButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
