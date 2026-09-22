export type ExperienceItem = {
  id: string
  role: string
  org: string
  orgHref?: string
  location: string
  /** ISO-ish month, used for ordering. */
  start: string
  /** null = present */
  end: string | null
  period: string
  summary: string
  bullets: string[]
  tags: string[]
  highlight?: { label: string; href: string; description: string }
  links?: { label: string; href: string }[]
}

export const experience: ExperienceItem[] = [
  {
    id: "qapps",
    role: "Software Engineer Intern",
    org: "Qapps.kz",
    orgHref: "https://qapps.kz",
    location: "Astana, Kazakhstan",
    start: "2026-05",
    end: "2026-06",
    period: "May – Jun 2026",
    summary: "Shipped features for Kazakhstan's Common App, used by 20,000+ students across 6 countries.",
    bullets: [
      "Shipped React/Next.js features for Kazakhstan's Common App — 20,000+ users, 6 countries.",
      "Built admin dashboards and exam-score processing on PostgreSQL with S3 object storage.",
      "Configured and deployed Kubernetes pods running production backend services on Yandex Cloud.",
    ],
    tags: ["React", "Next.js", "PostgreSQL", "S3", "Kubernetes", "Yandex Cloud"],
  },
  {
    id: "i3t",
    role: "Research Assistant — IoT & Edge AI",
    org: "Duke I3T Lab",
    orgHref: "https://gorlatova.pratt.duke.edu/",
    location: "Durham, NC",
    start: "2025-12",
    end: "2026-06",
    period: "Dec 2025 – Jun 2026",
    summary: "Undergraduate member of the Intelligent Interactive Internet of Things Lab, led by Prof. Maria Gorlatova.",
    bullets: [
      "Worked with Dr. Hanting Ye and Tianyi Hu on detecting AR smart glasses during exams: scanning a test-taker's glasses for the optical signature of an embedded display, comparing a robot-controlled scan against a UI-guided one.",
      "Built on-device pipelines on Android using OpenCV, running inference on real hardware.",
      "Developed spatially-aware AR apps on Meta Quest 3 with OpenXR and real-time object anchoring.",
    ],
    tags: ["Android", "OpenCV", "Meta Quest 3", "OpenXR", "Edge AI"],
    highlight: {
      label: "ACM HotMobile 2026 Best Demo Award",
      href: "https://dl.acm.org/doi/10.1145/3789514.3796255",
      description:
        "Demo: Catch Smart Glasses If You Scan: Robot-Controlled vs. UI-Guided — with Hanting Ye, Tianyi Hu, Valiantsin Kasabrukhau, and Maria Gorlatova. Atlanta, GA, Feb 2026.",
    },
    links: [
      { label: "Lab profile", href: "https://gorlatova.pratt.duke.edu/people/sulaiman-khydyr" },
      { label: "Lab news", href: "https://gorlatova.pratt.duke.edu/news" },
    ],
  },
  {
    id: "madlab",
    role: "Software Engineer / Research Assistant",
    org: "MADLAB, Duke Institute for Brain Sciences",
    location: "Durham, NC",
    start: "2025-08",
    end: "2025-12",
    period: "Aug – Dec 2025",
    summary: "LLM retrieval on vector embeddings and a React migration of the lab's site.",
    bullets: [
      "Built LLM retrieval systems on vector embeddings, improving preference match rate 25%.",
      "Led migration of a legacy site to React.js, improving component reuse and page performance.",
    ],
    tags: ["LLM", "Vector embeddings", "React"],
  },
  {
    id: "codeplus",
    role: "Software Engineering Intern",
    org: "Duke OIT — Code+ Program",
    orgHref: "https://codeplus.duke.edu/",
    location: "Durham, NC",
    start: "2025-05",
    end: "2025-08",
    period: "May – Aug 2025",
    summary: "Built DukeGPT, a campus AI assistant serving 2,000+ monthly requests.",
    bullets: [
      "Built DukeGPT, a campus AI assistant serving 2,000+ monthly requests across 9 backend services.",
      "Deployed microservices with FastAPI and MCP servers; cut API token usage 40% via caching.",
      "Partnered with product and design to iterate on response quality from real user feedback.",
    ],
    tags: ["FastAPI", "MCP", "RAG", "Microservices"],
    links: [
      { label: "Source", href: "https://gitlab.oit.duke.edu/codeplus/co-curricular-ai-chatbot/-/tree/main" },
    ],
  },
]

export type Publication = {
  title: string
  authors: string[]
  venue: string
  year: number
  award?: string
  href: string
  doi: string
  summary: string
}

export const publications: Publication[] = [
  {
    title: "Demo: Catch Smart Glasses If You Scan: Robot-Controlled vs. UI-Guided",
    authors: ["Hanting Ye", "Tianyi Hu", "Valiantsin Kasabrukhau", "Sulaiman Khydyr uulu", "Maria Gorlatova"],
    venue: "ACM HotMobile 2026, Atlanta, GA",
    year: 2026,
    award: "Best Demo Award",
    href: "https://dl.acm.org/doi/10.1145/3789514.3796255",
    doi: "10.1145/3789514.3796255",
    summary:
      "Smart glasses with hidden AR displays are indistinguishable from regular glasses, which makes them a cheating tool in exams. The demo detects the display's optical signature, comparing a robot-controlled scan with a UI-guided one.",
  },
]

export const education = {
  school: "Duke University",
  href: "https://duke.edu",
  degree: "B.S. in Computer Science and Mathematics",
  period: "Aug 2024 – May 2028",
  location: "Durham, NC",
  coursework: [
    "Operating Systems",
    "Database Systems",
    "Data Structures & Algorithms",
    "Statistics",
    "Coding with AI-Copiloting",
    "Coding IoT",
    "Linear Algebra",
    "Discrete Mathematics",
  ],
}

export const honors = [
  {
    title: "First place, Mathematics",
    detail: "Kyrgyzstan Regional Olympiad Series I & II, 2020 and 2023 (top 1% nationally)",
  },
  {
    title: "Future Leaders Exchange (FLEX) award",
    detail: "U.S. Department of State — fully funded exchange year in the US",
  },
]

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "Java", "C", "TypeScript", "SQL", "R"] },
  { group: "Frontend", items: ["React.js", "Next.js", "REST APIs", "Responsive UI"] },
  { group: "Backend & Infra", items: ["FastAPI", "Flask", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Microservices"] },
  { group: "AI & Data", items: ["PyTorch", "Sentence-Transformers", "OpenCV", "RAG", "Vector embeddings"] },
  { group: "AI Tooling", items: ["GitHub Copilot", "Claude Code", "Codex", "MCP"] },
]
