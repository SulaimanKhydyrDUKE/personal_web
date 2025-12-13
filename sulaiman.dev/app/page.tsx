import Link from "next/link"


export default function Home() {
  return (
    <main>
      <h1 className="text-4xl font-bold tracking-tight">
        Sulaiman Khydyr uulu
      </h1>

      <p className="mt-4 text-lg text-gray-400">
        CS + Math @ Duke University. I build AI systems and write about technology,
        meaning, and ambition. I love building, and I am building myself everyday.  
      </p>
      <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">
       GitHub Activity
     </h2>

     <div className="overflow-x-auto rounded-lg border border-gray-800 p-4">
     <img
      src="https://ghchart.rshah.org/50abab5/SulaimanKhydyrDUKE"
      alt="GitHub contribution chart"
     />
    </div>
    </section>

      <nav className="mt-6 flex gap-6 text-sm font-medium">
        <Link href="/projects">Projects</Link>
        <Link href="/writing">Writing</Link>
        <a href="https://github.com/SulaimanKhydyrDUKE" target="_blank">GitHub</a>
        <a href="https://www.youtube.com/@sulaimankhydyruulu1671" target="_blank">YouTube</a>
      </nav>



    </main>
  )
}
