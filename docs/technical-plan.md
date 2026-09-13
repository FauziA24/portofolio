# Technical Plan

## Recommended architecture

Use ReactJS with TypeScript and Vite for the public interface. Pair it with a small Node.js API (Express or Fastify) and PostgreSQL. This is intentionally separated from the portfolio UI so content administration and data access remain server-controlled.

```text
Browser
  -> React + TypeScript + Tailwind CSS
     -> React Three Fiber / Three.js (one optional, lazy-loaded hero scene)
     -> Framer Motion (component motion)
     -> GSAP (one optional work-showcase sequence)
  -> Node API
     -> PostgreSQL
     -> object storage / CDN for project media (later, if needed)
```

## Core data model

| Entity | Key fields |
| --- | --- |
| `projects` | id, slug, title, summary, challenge, contribution, solution, start_date, end_date, status, demo_status, featured_rank, published_at |
| `technologies` | id, name, category, icon_key |
| `project_technologies` | project_id, technology_id |
| `project_links` | id, project_id, kind, label, url |
| `project_media` | id, project_id, kind, url, alt_text, sort_order |
| `profiles` | display_name, headline, biography, email, github_url, linkedin_url |
| `admin_users` | id, email, password_hash, created_at |

`kind` should distinguish `github`, `live_demo`, `publication`, `case_study`, and `other`. No demo URL should be marked `live` until it is actually accessible.

## Deployment baseline

- Frontend: Vercel, Netlify, or Cloudflare Pages.
- API: Railway, Render, Fly.io, or a container host.
- Database: managed PostgreSQL on the same platform or Neon/Supabase.
- CI: GitHub Actions for lint, type check, test, and production build.
- Use preview deployments for pull requests and a separate staging database.

## Delivery guardrails

- Keep the Three.js hero scene small and lazy-loaded; use a CSS/static hero fallback on low-powered devices and reduced-motion settings.
- Keep initial project media as URL metadata; add managed uploads only after it becomes necessary.
- Seed PostgreSQL from verified CV data, then edit through admin.
- Never put admin credentials, database URLs, or production secrets in the repository.
- Deploy sample/demo apps separately from the portfolio and link to them via the project `live_demo` field.
