export default async function MetricsPage() {
    const from = "2025-02-01T00:00:00Z"
    const to = new Date().toISOString()

    const THEIR_USERNAME = process.env.THEIR_GITHUB!

    const mycommits = await getCommitCount("SulaimanKhydyrDuke", from, to)
    const theircommits = await getCommitCount(THEIR_USERNAME, from, to)
    const days =
    (new Date(to).getTime() - new Date(from).getTime()) /
    (1000 * 60 * 60 * 24)

    const myRate = (mycommits / days).toFixed(2)
    const theirRate = (theircommits / days).toFixed(2)

    return (
        <main>
            <h1 className="text-2xl font-bold mb-6">
                Sulaiman vs Opps
            </h1>
            <p>My commits: {mycommits}</p>
            <p>Their commits: {theircommits}</p>
            <p>My avg commits/day: {myRate}</p>
            <p>Their avg commits/day: {theirRate}</p>

            <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">
       GitHub Activity
     </h2>

     <div className="overflow-x-auto rounded-lg border border-gray-800 p-4">
     <img
      src="https://ghchart.rshah.org/50abab5/SulaimanKhydyrDUKE"
      alt="GitHub contribution chart == Can I be consistent for 365 days?"
     />
    </div>
    
    </section>
        </main>
    )
}


async function getCommitCount(
    username: string, 
    from: string, 
    to: string,
    
): Promise<number> {
    const query = `query ($login: String!, $from: DateTime!, $to: DateTime!) { 
                    user(login: $login) {
                        contributionsCollection(from: $from, to: $to){
                            totalCommitContributions
                        }
                    }
                } 
    `
    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
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
    })
    
    const num = await response.json()
    console.log("TOKEN EXISTS:", Boolean(process.env.GITHUB_TOKEN))
    console.log(`GitHub response for ${username}:`, JSON.stringify(num, null, 2));

  
    if (num.errors) {
        console.error("GraphQL Errors:", num.errors);
        return 0;
    }
    console.log(num)
    return num.data.user.contributionsCollection.totalCommitContributions
}
