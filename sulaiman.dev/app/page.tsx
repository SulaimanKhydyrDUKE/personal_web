import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { ContactButton } from "./components/contact-button"
import { ContributionSection, ContributionSkeleton } from "./components/contribution-section"
import { Experience } from "./components/experience"
import {
  ArrowUpRightIcon,
  AwardIcon,
  GithubIcon,
  GraduationIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "./components/icons"
import { LocalTime } from "./components/local-time"
import { education, experience, honors, publications, skills } from "./data/experience"
import { projects } from "./data/projects"
import { site } from "./data/site"

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="flex animate-reveal items-start gap-5">
        <Image
          src="/profilephoto.png"
          alt={site.name}
          width={96}
          height={96}
          priority
          className="size-20 shrink-0 rounded-full sm:size-24"
        />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{site.name}</h1>
          <p className="mt-3 text-lg text-muted">{site.tagline}</p>
          <div className="mt-4 space-y-1.5">
            <LocalTime />
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground/80">Now</span> · {site.now}
            </p>
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground/80">Member</span> ·{" "}
              <a href={site.links.lab} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-foreground">
                Duke I3T Lab
              </a>{" "}
              (Intelligent Interactive Internet of Things), led by Prof. Maria Gorlatova
            </p>
          </div>
        </div>
      </section>

      <section className="animate-reveal [animation-delay:90ms]">
        <Suspense fallback={<ContributionSkeleton />}>
          <ContributionSection />
        </Suspense>
      </section>

      <section id="experience" className="scroll-mt-24 animate-reveal [animation-delay:180ms]">
        <Experience items={experience} />
      </section>

      <section id="publications" className="scroll-mt-24 animate-reveal [animation-delay:270ms]">
        <h2 className="text-xl font-semibold">Publications</h2>
        <ul className="mt-3 space-y-3">
          {publications.map((pub) => (
            <li key={pub.doi}>
              <a
                href={pub.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-foreground/[0.04]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{pub.title}</div>
                  <ArrowUpRightIcon className="mt-1 shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div className="mt-1 text-sm text-muted">
                  {pub.authors.map((author, i) => (
                    <span key={author}>
                      <span className={author.startsWith("Sulaiman") ? "text-foreground" : undefined}>{author}</span>
                      {i < pub.authors.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span>{pub.venue}</span>
                  {pub.award && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 font-medium text-accent">
                      <AwardIcon width={12} height={12} /> {pub.award}
                    </span>
                  )}
                  <span className="font-mono">doi:{pub.doi}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pub.summary}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="work" className="scroll-mt-24 animate-reveal [animation-delay:360ms]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Selected work</h2>
          <Link href="/projects" className="link-underline text-sm text-muted transition-colors hover:text-foreground">
            All projects
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {projects.slice(0, 5).map((project) => {
            const inner = (
              <>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{project.title}</div>
                  <div className="truncate text-sm text-muted">{project.summary}</div>
                </div>
                <span className="hidden text-xs text-muted sm:block">{project.period ?? project.tags[0]}</span>
                {project.href && (
                  <ArrowUpRightIcon className="shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                )}
              </>
            )
            const className = "group -mx-2 flex items-center gap-4 rounded-md px-2 py-3 transition-colors hover:bg-foreground/[0.04]"
            return (
              <li key={project.title}>
                {project.href ? (
                  <a href={project.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {inner}
                  </a>
                ) : (
                  <Link href="/projects" className={className}>
                    {inner}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section id="education" className="grid scroll-mt-24 animate-reveal gap-10 [animation-delay:450ms] sm:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Education</h2>
          <div className="mt-3 flex items-start gap-3">
            <GraduationIcon className="mt-1 shrink-0 text-muted" />
            <div>
              <a href={education.href} target="_blank" rel="noopener noreferrer" className="link-underline font-medium">
                {education.school}
              </a>
              <div className="text-sm text-muted">{education.degree}</div>
              <div className="text-xs text-muted">
                {education.period} · {education.location}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {education.coursework.map((course) => (
              <span key={course} className="rounded-md bg-foreground/[0.06] px-2 py-0.5 text-xs text-muted">
                {course}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Honors</h2>
          <ul className="mt-3 space-y-3">
            {honors.map((honor) => (
              <li key={honor.title} className="flex items-start gap-3">
                <AwardIcon className="mt-1 shrink-0 text-muted" />
                <div>
                  <div className="font-medium">{honor.title}</div>
                  <div className="text-sm text-muted">{honor.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="skills" className="scroll-mt-24 animate-reveal [animation-delay:540ms]">
        <h2 className="text-xl font-semibold">Skills</h2>
        <dl className="mt-3 space-y-2">
          {skills.map((row) => (
            <div key={row.group} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <dt className="w-32 shrink-0 text-xs font-medium uppercase tracking-wider text-muted">{row.group}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {row.items.map((item) => (
                  <span key={item} className="rounded-md bg-foreground/[0.06] px-2 py-0.5 text-xs text-muted">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="animate-reveal [animation-delay:630ms]">
        <h2 className="text-xl font-semibold">Elsewhere</h2>
        <nav className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium" aria-label="Social links">
          <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5">
            <GithubIcon /> GitHub
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5">
            <LinkedinIcon /> LinkedIn
          </a>
          <a href={site.links.youtube} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5">
            <YoutubeIcon /> YouTube
          </a>
          <ContactButton className="link-underline inline-flex select-none items-center gap-1.5" />
        </nav>
      </section>
    </div>
  )
}
