
export default function Projects() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          A selection of things I've built, from LLM agents to low-level compilers.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-1">
        {projects.map((project) => (
          <ProjectCard 
            key={project.title}
            {...project}
          />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({
  title, 
  description, 
  href,
  tags,
}: {
  title: string
  description: string
  href: string
  tags: string[]
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-all bg-gray-50/50 dark:bg-gray-900/50"
    >
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold group-hover:underline underline-offset-4">{title}</h2>
        <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      <p className="mt-3 text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span 
            key={tag}
            className="px-2 py-1 text-xs font-medium rounded-md bg-gray-200/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  )
}

const projects = [
  {
    title: "BlueBot",
    description: "LLM-powered campus assistant built during Code+ at Duke. Utilizes MCP servers for real-time Duke data access.",
    href: "https://gitlab.oit.duke.edu/codeplus/co-curricular-ai-chatbot/-/tree/main",
    tags: ["LLM", "TypeScript", "MCP", "Next.js"]
  },
  {
    title: "MyCompiler",
    description: "A low-level compiler built to understand the inner workings of lexical analysis, parsing, and code generation.",
    href: "https://github.com/SulaimanKhydyrDUKE/MyCompiler",
    tags: ["C++", "Compilers", "Assembly"]
  },
  {
    title: "AssWhooper4070",
    description: "Biological arm capable of giving a fast and reliable asswhooping. BicLYft Capacity: 100lbs. (A fun experimental side project)",
    href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["Hardware", "Robotics", "Experimental"]
  }
]

