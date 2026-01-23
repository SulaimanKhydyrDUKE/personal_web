import Image from "next/image"

type CommitResult = {
  count: number | null
  error?: string
}

export default async function MetricsPage() {
  const from = "2025-02-01T00:00:00Z"
  const to = new Date().toISOString()
  const token = process.env.GITHUB_TOKEN
  const theirUsername = process.env.THEIR_GITHUB ?? null

  const [myResult, theirResult] = await Promise.all([
    getCommitCount("SulaimanKhydyrDuke", from, to, token),
    getCommitCount(theirUsername, from, to, token),
  ])

  const days =
    (new Date(to).getTime() - new Date(from).getTime()) /
    (1000 * 60 * 60 * 24)

  const myRate = myResult.count !== null ? (myResult.count / days).toFixed(2) : "N/A"
  const theirRate = theirResult.count !== null ? (theirResult.count / days).toFixed(2) : "N/A"

  const notices: string[] = []
  if (!token) {
    notices.push("Set GITHUB_TOKEN to enable GitHub stats.")
  }
  if (!theirUsername) {
    notices.push("Set THEIR_GITHUB to compare another user.")
  }
  if (token && myResult.error) {
    notices.push(`My commits: ${myResult.error}`)
  }
  if (token && theirUsername && theirResult.error) {
    notices.push(`Their commits: ${theirResult.error}`)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Sulaiman vs Opps
      </h1>
      <p>My commits: {formatCount(myResult.count)}</p>
      <p>Their commits: {formatCount(theirResult.count)}</p>
      <p>My avg commits/day: {myRate}</p>
      <p>Their avg commits/day: {theirRate}</p>

      {notices.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-sm text-gray-600 dark:text-gray-400">
          {notices.map((notice) => (
            <p key={notice}>{notice}</p>
          ))}
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          GitHub Activity
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-800 p-4">
          <Image
            src="https://ghchart.rshah.org/50abab5/SulaimanKhydyrDUKE"
            alt="GitHub contribution chart == Can I be consistent for 365 days?"
            width={720}
            height={112}
            sizes="100vw"
            className="h-auto w-full"
          />
        </div>
      </section>
    </div>
  )
}

async function getCommitCount(
  username: string | null,
  from: string,
  to: string,
  token?: string,
): Promise<CommitResult> {
  if (!username) {
    return { count: null, error: "No username configured." }
  }
  if (!token) {
    return { count: null, error: "Missing GitHub token." }
  }

  const query = `query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
      }
    }
  }`

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from,
          to,
        },
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      return { count: null, error: `GitHub API error (${response.status}).` }
    }

    const payload = await response.json()
    if (payload?.errors?.length) {
      return { count: null, error: payload.errors[0]?.message ?? "GitHub query failed." }
    }

    const count = payload?.data?.user?.contributionsCollection?.totalCommitContributions
    if (typeof count !== "number") {
      return { count: null, error: "Unexpected GitHub response." }
    }

    return { count }
  } catch {
    return { count: null, error: "Failed to reach GitHub." }
  }
}

function formatCount(count: number | null) {
  return count === null ? "N/A" : count
}
