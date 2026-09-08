# Architecture overview

## Repository layout

The Git repository root is one level above the application:

```text
personal_web/
├── .ai/                  # Machine-readable agent policy
├── .claude/              # Repeatable agent skills
├── .github/              # Issue forms and automation
├── docs/                 # Product, architecture, quality, and specifications
└── sulaiman.dev/         # Next.js application
```

All Node.js commands run from `sulaiman.dev/`.

## Application

- Next.js App Router with React and TypeScript.
- Route components live under `sulaiman.dev/app/`.
- Reusable UI lives in `sulaiman.dev/app/components/`.
- Public content may be embedded in route components on the current default branch. The local structured-content refactor introduces `sulaiman.dev/app/data/`.
- The local refactor also introduces GitHub integration code under `sulaiman.dev/app/lib/`.
- Global design tokens and component styling live in `sulaiman.dev/app/globals.css`.
- Static assets live in `sulaiman.dev/public/`.

## Architectural boundaries

- Prefer server components unless interactivity requires a client component.
- When data modules exist, keep biographical content there rather than duplicating it in components.
- Keep secrets and authenticated API calls server-side.
- Third-party GitHub data is enhancement, not a prerequisite for core rendering.
- Avoid new state-management, database, CMS, analytics, or UI dependencies without a specification that justifies them.

## Decision records

For a consequential, durable choice, add a short file under `docs/architecture/decisions/` describing context, decision, alternatives, and consequences. Do not create records for routine implementation details.
