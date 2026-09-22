import { site } from "@/app/data/site"
import { getContributions } from "@/app/lib/github"
import { ContributionGraph } from "./contribution-graph"

/** Server component: fetches the calendar and hands it to the client graph. */
export async function ContributionSection() {
  const data = await getContributions()
  if (!data) return <FallbackChart />
  return <ContributionGraph login={site.githubLogin} days={data.days} stats={data.stats} />
}

export function ContributionSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 sm:p-5" aria-busy="true">
      <div className="h-5 w-32 animate-pulse rounded bg-foreground/[0.06]" />
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="h-7 w-12 animate-pulse rounded bg-foreground/[0.06]" />
            <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-foreground/[0.04]" />
          </div>
        ))}
      </div>
      <div className="mt-5 h-[104px] animate-pulse rounded bg-foreground/[0.04]" />
    </div>
  )
}

/** Used only if both GitHub data sources are unreachable. */
function FallbackChart() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://ghchart.rshah.org/50abab/${site.githubLogin}`}
        alt="GitHub contribution chart"
        width={720}
        height={112}
        loading="lazy"
        decoding="async"
        className="h-auto w-full"
      />
    </div>
  )
}
