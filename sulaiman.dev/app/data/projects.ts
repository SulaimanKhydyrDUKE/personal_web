export type Project = {
  title: string
  summary: string
  description: string
  /** Public link. Omitted when the source is private so visitors never hit a 404. */
  href?: string
  period?: string
  tags: string[]
}

export const projects: Project[] = [
  {
    title: "3D Fitting Room",
    summary: "Personalized 3D avatars with simulated clothing fit.",
    description:
      "Modified an SMPL-X body prediction pipeline to generate smoother, more anatomically consistent 3D body meshes, integrated garment simulation to visualize clothing fit on personalized avatars, and built AWS infrastructure to run the compute-heavy reconstruction and simulation.",
    period: "Feb 2026 – Present",
    tags: ["SMPL-X", "AWS", "Claude", "3D"],
  },
  {
    title: "Noted",
    summary: "An AI note-taker for STEM students.",
    description:
      "Co-building an AI note-taker for STEM students; iterating on user feedback ahead of launch.",
    href: "https://github.com/vkasabrukhau/NotedBuild",
    period: "Feb 2026 – Present",
    tags: ["React", "AWS", "SQL"],
  },
  {
    title: "Resume Tailor",
    summary: "Tailors a résumé to one posting, then drives the application in a real browser.",
    description:
      "Tailors a résumé to a single job posting from a personal career record, selecting evidence before writing and auditing every claim against that record afterwards. An optional second half drives the application through a persistent browser: discovery, form filling, PDF attachment, and a review dashboard, with the user reading before anything is submitted.",
    href: "https://github.com/SulaimanKhydyrDUKE/resume-tailor",
    period: "Sep 2026",
    tags: ["Python", "Playwright", "LLM"],
  },
  {
    title: "Linear Algebra Compiler",
    summary: "A C-core language with first-class matrices and vectors.",
    description:
      "Wrote a C-core language with first-class matrix and vector types, and built a compiler for it, to serve students and researchers working on linear algebra-heavy problems.",
    href: "https://github.com/SulaimanKhydyrDUKE/MyCompiler",
    period: "Oct 2025",
    tags: ["Python", "C", "Linear Algebra"],
  },
  {
    title: "DukeGPT",
    summary: "LLM campus assistant grounded in trusted Duke data.",
    description:
      "LLM-driven campus assistant for the Duke community, built during the Code+ program. Answers student and staff questions using trusted university data; 2,000+ monthly requests across 9 backend services.",
    href: "https://gitlab.oit.duke.edu/codeplus/co-curricular-ai-chatbot/-/tree/main",
    period: "Summer 2025",
    tags: ["LLM", "RAG", "MCP", "FastAPI"],
  },
  {
    title: "Task Tracker App",
    summary: "Habit tracking with shared tasks between friends.",
    description:
      "Goal-tracking app for people building daily habits, with social features that let friends add shared tasks.",
    tags: ["SwiftUI", "MongoDB", "AWS"],
  },
]
