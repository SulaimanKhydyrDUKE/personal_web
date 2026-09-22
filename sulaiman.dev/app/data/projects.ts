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
    title: "MyLang Compiler",
    summary: "A small language with first-class integer matrices, built to learn how compilers work.",
    description:
      "A toy language with immutable integers, strings, booleans and integer matrices (transpose, row reduction, invertibility, null space). Built the lexer, recursive-descent parser, type checker, tree-walking interpreter and a Python code-generation backend, with tests that require both paths to print identical output.",
    href: "https://github.com/SulaimanKhydyrDUKE/MyCompiler",
    period: "Oct 2025 – Present",
    tags: ["Python", "Compilers", "Linear Algebra"],
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
    title: "TREADMILL",
    summary: "Habit tracking with friends who can follow you and suggest tasks.",
    description:
      "SwiftUI habit app that pairs daily goals with long-term vision goals, a streak grid per goal, and a community layer for follow invites, advice and goal suggestions. Data lives on-device in SwiftData; an AWS backend (Cognito, DynamoDB, HTTP API, Terraform) is built but not yet wired to the app.",
    period: "Dec 2025 – Jan 2026",
    tags: ["SwiftUI", "SwiftData", "AWS"],
  },
  {
    title: "MyCopy",
    summary: "A consent-first, always-disclosed AI copy of a creator, shareable by link or embed.",
    description:
      "A creator defines an approved voice, knowledge set and boundaries; visitors chat with the copy at a public page or inside an iframe. Every conversation states it is AI, answers only from approved facts, and hands off instead of committing. Next.js with a moderated, rate-limited server-side chat route.",
    period: "Jul 2026 – Present",
    tags: ["Next.js", "TypeScript", "OpenAI"],
  },
  {
    title: "Farm Drone Survey",
    summary: "Autonomous agricultural drone simulation from field discovery to a live dashboard.",
    description:
      "Discovers real farm fields from OpenStreetMap, plans a lawnmower survey path fitted to the field, flies it in offboard mode in PX4 SITL and Gazebo through ROS 2, logs GPS-tagged camera frames, and shows fields, path, captures and images on a Streamlit dashboard.",
    period: "Jun 2026",
    tags: ["ROS 2", "PX4", "Python"],
  },
  {
    title: "Kyrgyz Speech Data Portfolio",
    summary: "Spec-first speech data work for Kyrgyz: conventions, annotation schema, tooling.",
    description:
      "Transcription conventions with numbered decision rules, an annotation schema with behaviourally anchored rating scales, a recording protocol, EN→KY localization notes on vowel harmony and agglutinative placeholders, and a single-file browser annotation tool that enforces both specs at export. Built so that consistency is measurable rather than asserted.",
    period: "Jul 2026",
    tags: ["Speech data", "Localization", "Kyrgyz"],
  },
  {
    title: "Paragraph Similarity API",
    summary: "FastAPI service that finds similar and near-duplicate paragraphs.",
    description:
      "Embeds paragraphs with OpenAI and finds similar chunks or duplicate pairs by cosine similarity, narrowing candidates with a binary search over projections onto a reference vector before exact scoring. Tested with fixed vectors so the suite never calls the model.",
    period: "Apr 2026",
    tags: ["FastAPI", "Embeddings", "Python"],
  },
]
