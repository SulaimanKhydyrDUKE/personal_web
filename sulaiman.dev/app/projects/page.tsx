import type { Metadata } from "next"
import type { CSSProperties } from "react"
import { ArrowUpRightIcon } from "../components/icons"
import { SpotlightGroup } from "../components/spotlight"
import { projects, type Project } from "../data/projects"

export const metadata: Metadata = {
  title: "Projects",
  description: "A selection of things Sulaiman has built, from 3D body reconstruction to a compiler.",
}

export default function Projects() {
  return (
    <div className="space-y-8">
      <div className="animate-reveal">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="mt-2 text-muted">A selection of things I&apos;ve built, from 3D body reconstruction to a compiler.</p>
      </div>
      <SpotlightGroup className="grid gap-4">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}
      </SpotlightGroup>
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const className =
    "spotlight group block animate-reveal rounded-xl border border-border bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/20"
  const style = { animationDelay: `${80 + index * 70}ms` } as CSSProperties
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{project.title}</h2>
          {project.period && <div className="mt-0.5 text-xs tabular-nums text-muted">{project.period}</div>}
        </div>
        {project.href && (
          <ArrowUpRightIcon
            width={20}
            height={20}
            className="shrink-0 text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        )}
      </div>
      <p className="mt-3 leading-relaxed text-muted">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-foreground/[0.06] px-2 py-1 text-xs font-medium text-muted">
            {tag}
          </span>
        ))}
      </div>
    </>
  )
  return project.href ? (
    <a href={project.href} target="_blank" rel="noopener noreferrer" data-spotlight style={style} className={className}>
      {content}
    </a>
  ) : (
    <div data-spotlight style={style} className={className}>
      {content}
    </div>
  )
}
