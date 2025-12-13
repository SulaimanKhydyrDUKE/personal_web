export default async function MetricsPage() {
    const from = "2025-02-01T00:00:00Z"
    const to = new Date().toISOString()

    const mycommits = await getCommitCount("SulaimanKhydyrDuke", from, to)
    const theircommits = await getCommitCount("Khosilmurod", from, to)
    return (
        <main>
            <h1 className="text-2xl font-bold mb-6">
                Sulaiman vs Opps
            </h1>
            <p>My commits: {mycommits}</p>
            <p>Their commits: {theircommits}</p>

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
