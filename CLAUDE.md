# Repository instructions

This repository contains Sulaiman Khydyr's public portfolio. The Next.js application lives in `sulaiman.dev/`; run application commands from that directory.

## Read before changing anything

- `.ai/project.yaml` defines automation limits and required commands.
- `docs/product/PRODUCT_BRIEF.md` defines the product and factual sources.
- `docs/quality/DEFINITION_OF_DONE.md` defines completion evidence.
- `docs/architecture/OVERVIEW.md` explains the repository layout.
- For issue-driven work, read the complete issue and its comments. A specification in a later owner-approved comment is part of the contract.

## Commands

From `sulaiman.dev/`:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

## Non-negotiable rules

- When `sulaiman.dev/app/data/*.ts` exists, treat it as the source of truth for public biographical facts; otherwise preserve the facts already present in route components. Never invent achievements, metrics, dates, affiliations, links, or project status.
- Complete real behavior. Do not substitute mock data, fake integrations, placeholder controls, skipped checks, or unresolved TODOs unless the specification explicitly allows them.
- Preserve existing visual language unless a specification explicitly changes it.
- Handle relevant loading, empty, error, and recovery states.
- Keep changes within the approved issue. Report useful adjacent findings instead of expanding scope silently.
- Never expose secrets or commit environment files.
- Never push to `main`, merge a pull request, deploy, change production data, add a paid service, or make destructive infrastructure/database changes.
- Ask before changing authentication, authorization, privacy, data retention, public claims, or product meaning.
- Do not alter or delete user changes that are outside the task.

## Issue automation

- `ai:needs-spec` means specification only. Produce observable requirements, edge cases, non-goals, verification, and unresolved owner decisions. Do not implement.
- `ai:ready` means the owner approved unattended implementation. Work only on the branch created for that issue.
- A task is not complete because code was written. Run every applicable check and provide evidence against each acceptance criterion.
- If blocked, preserve useful work, state one precise blocker, and do not claim completion.

## Handoff format

Every implementation handoff must include:

1. Outcome delivered.
2. Acceptance-criteria evidence, item by item.
3. Commands run and exact pass/fail results.
4. Screenshots or other visual evidence for visible changes.
5. Files changed.
6. Assumptions, residual risks, and anything not verified.
