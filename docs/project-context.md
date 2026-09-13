# Project Context - Fauzi Portfolio

## Purpose

Build a personal portfolio that demonstrates Mohammad Fauzi Aziz's engineering capability through credible project stories and working artifacts. It should help recruiters, collaborators, and clients quickly understand what he built, his contribution, and where they can evaluate the work.

## Primary audiences

- Recruiters and hiring managers: fast evidence of capability, stack, and contact path.
- Technical interviewers: clear architecture, constraints, contribution, and repository/demo links.
- Potential clients/collaborators: confidence that Fauzi can turn operational needs into reliable web systems.

## Product goals

- Make featured work and its outcome understandable in under two minutes without overloading the homepage.
- Give every public project a clear GitHub link and a truthful Live Demo status.
- Present backend, web, AI, and research experience without overstating individual ownership on team projects.
- Maintain content without code changes after the initial release.

## Non-goals for v1

- Social feed, blog/CMS, user accounts, comments, e-commerce, or real-time chat.
- Inventing metrics, screenshots, demo URLs, or claims not supported by project evidence.
- Heavy motion that harms performance, accessibility, or readability.

## Source of truth from CV

- Name: Mohammad Fauzi Aziz.
- Education: Computer Science, Bina Nusantara University (2022-2026).
- Strengths: backend and web applications, business logic, database operations, authentication/RBAC, validation, testing, and frontend-backend integration.
- Featured experience: AI Finance Automation System, HRMS backend work, OCR KTP Data Extraction, ARnatomi, Typink, BebasRokok, and Program Laundry.
- Public profiles: GitHub `FauziA24` and LinkedIn `mohammad-fauzi-aziz-257691268`.

## Content principles

- State role, team size, ownership, and current demo availability explicitly.
- Prefer a short problem-solution-result story over a generic feature list.
- Use a `Coming soon` or `Private` demo status when a safe public demo does not exist.
- Store personal contact details in environment-managed content or the database; do not hard-code sensitive values into source control.

## Current migration context

Drizzle, Swagger, PostgreSQL, and the S3-compatible storage connection are treated as the completed foundation. The remaining work should follow `docs/roadmap.md` phase by phase so schema, authentication, content APIs, CMS screens, media, SEO, tests, and deployment stay aligned.

Phases 1-13 are now implemented through schema, auth, profile/homepage, about facts, selected work, research, contact links, media uploads, project gallery, SEO/settings, CMS wiring, Swagger coverage, and focused tests. The next implementation phase is deployment/R2 hardening, so further changes should avoid reshaping data contracts unless a production deployment check proves it is necessary.

## Execution guardrails

- Keep Selected Work on `Project.featuredRank`; do not introduce another table unless the product needs multiple curated lists later.
- Store uploaded media by `storageKey` plus metadata in `MediaAsset`; derive public URLs from `S3_PUBLIC_URL`.
- Use `ProjectMedia` for project galleries and keep alt text, caption, media kind, ordering, and highlight status with each item.
- Public endpoints must filter draft, archived, hidden, private, and non-indexed content server-side.
- Admin mutations must use database-backed sessions, validation, Swagger docs, and focused tests before deployment.
- Cloudflare R2 migration should be environment-only once MinIO upload behavior is stable.
