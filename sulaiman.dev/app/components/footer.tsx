import { site } from "@/app/data/site"
import { formatRelative, getLatestCommit } from "@/app/lib/github"
import { ShortcutHint } from "./command-palette"

export default async function Footer() {
  const commit = await getLatestCommit()
  return (
    <footer className="mt-24 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          Press <ShortcutHint /> to navigate
        </span>
        {commit && (
          <a
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            title={commit.message}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            Updated {formatRelative(commit.date)}
            <span className="font-mono text-xs text-muted/80">{commit.sha.slice(0, 7)}</span>
          </a>
        )}
      </div>
    </footer>
  )
}
