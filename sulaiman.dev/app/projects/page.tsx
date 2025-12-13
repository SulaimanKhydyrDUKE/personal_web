
export default function Projects() {
  return (<main>
    <h1 className="text-2xl font-bold mb-6">Projects</h1>
    <div className="grid gap-3">
      {projects.map((project) => (
        <ProjectCard 
        key={project.title}
        title={project.title}
        description ={project.description}
        href={project.href}/>
      ))}
    </div>
  </main>)
}

function ProjectCard ({
  title, 
  description, 
  href,  
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <article className="rounded-lg border border-gray-800 p-5 hover:border-gray-400 transition">
      <a
      href={href}
      target="_blank"
      className="block">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">
          {description}
        </p>
    </a>
    </article>
    
  )
}

const projects = [
  {title: "BlueBot",
    description: "LLM-powered campus assistant using MCP servers.",
    href : "https://gitlab.oit.duke.edu/codeplus/co-curricular-ai-chatbot/-/tree/main"
  },
  {title:"AssWhooper4070",
    description:"Biological arm capable of giving a fast and reliable asswhooping. BicLYft Capacity:100lbs",
    href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
]

