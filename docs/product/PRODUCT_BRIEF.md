# Product brief: sulaiman.dev

## Goal

Present an accurate, fast, accessible, and polished account of Sulaiman's work, research, education, and current projects. A visitor should be able to understand his technical interests and find authoritative links without encountering fabricated content or broken primary journeys.

## Primary audiences

- Recruiters and engineering hiring managers.
- Researchers and potential collaborators.
- Students, builders, and people evaluating Sulaiman's projects or writing.

## Primary journeys

1. Understand who Sulaiman is and what he is currently building.
2. Review experience, publications, education, skills, and selected projects.
3. Follow verified links to source code, publications, profiles, and contact surfaces.
4. Use the site comfortably on mobile or desktop, with keyboard and assistive technology.
5. Ask the on-site assistant about Sulaiman, or leave him a message through it, without the assistant inventing anything beyond the data files.

## Product principles

- Truth before polish: never invent or embellish facts.
- Quiet confidence: concise presentation, clear hierarchy, limited visual noise.
- Fast access: important information should not depend on unnecessary interaction.
- Resilient enhancement: third-party data failures must not break the core portfolio.

## Sources of truth

- On the current default branch, public claims embedded in the existing route components are authoritative.
- When the in-progress structured-content refactor is committed, `sulaiman.dev/app/data/site.ts`, `experience.ts`, and `projects.ts` become the authoritative identity, experience, and project sources.
- A task may update these facts only when the owner supplies or explicitly approves the replacement facts.

## Current routes

- `/`: primary portfolio.
- `/projects`: expanded project list.
- `/writing`: writing surface.
- `/api/chat`: the assistant's streaming endpoint. It answers only from `app/data/*.ts` and can deliver a visitor's message to Sulaiman when delivery is configured.
- `/private`: if present, this is an undocumented metrics page. Its name is not an access-control mechanism. Do not expose additional information, remove it, or add authentication until the owner decides its intended lifecycle.

## Non-goals

- A social network or general-purpose CMS.
- Invented case studies, testimonials, traffic, impact, or project completion claims.
- Infrastructure complexity without a demonstrated product requirement.

## Success indicators

- Core routes build and render without errors.
- Public claims match the approved data files and their linked sources.
- Navigation and primary content work across supported viewport sizes and keyboard input.
- External-service degradation has an intentional user experience.
- Automated checks and required visual evidence accompany changes.
