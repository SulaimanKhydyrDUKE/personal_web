import type { Metadata } from "next"
import Link from "next/link"
import { GithubIcon, YoutubeIcon } from "../components/icons"
import { site } from "../data/site"

export const metadata: Metadata = {
  title: "Writing",
  description: "Thoughts on technology, education, and building things.",
}

type Post = {
  title: string
  slug: string
  date: string
  formattedDate: string
  excerpt: string
  href: string
}

// Add posts here newest first. Each entry links out to where the piece lives.
const posts: Post[] = []

export default function Writing() {
  return (
    <div className="space-y-8">
      <div className="animate-reveal">
        <h1 className="text-3xl font-bold tracking-tight">Writing</h1>
        <p className="mt-2 text-muted">Thoughts on technology, education, and building things.</p>
      </div>

      <div className="animate-reveal space-y-12 [animation-delay:90ms]">
        {posts.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6">
            <p className="text-sm text-muted">Nothing published here yet. In the meantime, you can find what I&apos;m making on</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
              <a href={site.links.youtube} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5">
                <YoutubeIcon /> YouTube
              </a>
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5">
                <GithubIcon /> GitHub
              </a>
            </div>
          </div>
        )}
        {posts.map((post) => (
          <article key={post.slug} className="group relative flex flex-col items-start">
            <h2 className="text-xl font-semibold tracking-tight">
              <Link href={post.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-muted">
                {post.title}
              </Link>
            </h2>
            <time className="order-first mb-3 flex items-center pl-3.5 text-sm text-muted" dateTime={post.date}>
              <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                <span className="h-4 w-0.5 rounded-full bg-border" />
              </span>
              {post.formattedDate}
            </time>
            <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
            <Link
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline mt-4 flex items-center text-sm font-medium"
            >
              Read article
              <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
