import { site } from "@/app/data/site"

export type ContributionLevel = 0 | 1 | 2 | 3 | 4

export type ContributionDay = {
  date: string // YYYY-MM-DD
  count: number
  level: ContributionLevel
}

export type ContributionStats = {
  total: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  busiest: ContributionDay | null
}

export type Contributions = {
  days: ContributionDay[]
  stats: ContributionStats
  source: "graphql" | "public"
}

export type LatestCommit = {
  sha: string
  url: string
  date: string
  message: string
}

const REVALIDATE_SECONDS = 3600

const GRAPHQL_LEVELS: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": site.handle,
  }
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/**
 * Past-year contribution calendar. Uses the GraphQL API when GITHUB_TOKEN is
 * set, and falls back to a public mirror of the same data otherwise, so the
 * graph renders even without secrets configured.
 */
export async function getContributions(
  login: string = site.githubLogin,
): Promise<Contributions | null> {
  const fromGraphQL = await fetchCalendarGraphQL(login)
  if (fromGraphQL) {
    return { days: fromGraphQL, stats: computeStats(fromGraphQL), source: "graphql" }
  }
  const fromPublic = await fetchCalendarPublic(login)
  if (fromPublic) {
    return { days: fromPublic, stats: computeStats(fromPublic), source: "public" }
  }
  return null
}

async function fetchCalendarGraphQL(login: string): Promise<ContributionDay[] | null> {
  if (!process.env.GITHUB_TOKEN) return null
  const query = `query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...githubHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login } }),
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return null
    const payload = await res.json()
    const weeks = payload?.data?.user?.contributionsCollection?.contributionCalendar?.weeks
    if (!Array.isArray(weeks)) return null
    const days: ContributionDay[] = []
    for (const week of weeks) {
      for (const day of week.contributionDays ?? []) {
        days.push({
          date: day.date,
          count: day.contributionCount ?? 0,
          level: GRAPHQL_LEVELS[day.contributionLevel] ?? 0,
        })
      }
    }
    return days.length ? days : null
  } catch {
    return null
  }
}

async function fetchCalendarPublic(login: string): Promise<ContributionDay[] | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(login)}?y=last`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    )
    if (!res.ok) return null
    const payload = await res.json()
    const contributions = payload?.contributions
    if (!Array.isArray(contributions)) return null
    const days: ContributionDay[] = contributions.map((d: { date: string; count: number; level: number }) => ({
      date: d.date,
      count: d.count ?? 0,
      level: Math.max(0, Math.min(4, d.level ?? 0)) as ContributionLevel,
    }))
    return days.length ? days : null
  } catch {
    return null
  }
}

export function computeStats(days: ContributionDay[]): ContributionStats {
  let total = 0
  let activeDays = 0
  let longestStreak = 0
  let run = 0
  let busiest: ContributionDay | null = null

  for (const day of days) {
    total += day.count
    if (day.count > 0) {
      activeDays += 1
      run += 1
      longestStreak = Math.max(longestStreak, run)
      if (!busiest || day.count > busiest.count) busiest = day
    } else {
      run = 0
    }
  }

  // Current streak counts back from the latest day. Today is allowed to be
  // empty so the streak doesn't read as broken before the day's first commit.
  let i = days.length - 1
  if (i >= 0 && days[i].count === 0) i -= 1
  let currentStreak = 0
  for (; i >= 0 && days[i].count > 0; i -= 1) currentStreak += 1

  return { total, activeDays, currentStreak, longestStreak, busiest }
}

/** Most recent commit on the site's own repository, for the footer. */
export async function getLatestCommit(): Promise<LatestCommit | null> {
  const { owner, name } = site.repo
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}/commits?per_page=1`,
      { headers: githubHeaders(), next: { revalidate: REVALIDATE_SECONDS } },
    )
    if (!res.ok) return null
    const [commit] = await res.json()
    if (!commit?.sha) return null
    return {
      sha: commit.sha,
      url: commit.html_url,
      date: commit.commit?.committer?.date ?? commit.commit?.author?.date ?? "",
      message: String(commit.commit?.message ?? "").split("\n")[0],
    }
  } catch {
    return null
  }
}

export function formatRelative(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diffSeconds = Math.round((then - now.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(diffSeconds) >= size) return rtf.format(Math.round(diffSeconds / size), unit)
  }
  return "just now"
}
