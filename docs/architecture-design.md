# Architecture Design Plan

Status: refactor executed after phases 1-13.

This document defines the target folder structure, coding style, and production hardening plan for the portfolio website. It does not change the product contract in `docs/prd.md` or the phase order in `docs/roadmap.md`; it turns the current working implementation into a cleaner system design before deployment.

## Current Structure Snapshot

```text
apps/
  api/
    src/
      config.ts
      server.ts
      storage.ts
      storage-setup.ts
      types.d.ts
      db/
        index.ts
        schema.ts
        seed.ts
      modules/
        admin/
          auth.ts
          auth.test.ts
          media.ts
          media.test.ts
        projects/
          routes.ts
          routes.test.ts
          schema.ts
          service.ts
          swagger.ts
  web/
    src/
      App.tsx
      main.tsx
      types.ts
      lib/
        api.ts
      features/
        projects/
          useProjects.ts
      pages/
        Admin.tsx
        Home.tsx
        ProjectDetail.tsx
        Projects.tsx
      components/
        HeroScene.tsx
        Nav.tsx
        Reveal.tsx
        RobotBlaster.tsx
        SceneBoundary.tsx
        SiteIntro.tsx
        SpartanRobot.tsx
        TiltCard.tsx
      data/
        fallback-projects.ts
      styles/
        global.css
        public.css
        admin.css
```

Largest files before execution:

```text
apps/web/src/pages/Admin.tsx                  829 lines
apps/web/src/design.css                       559 lines
apps/web/src/pages/Home.tsx                   485 lines
apps/api/src/modules/projects/routes.ts       378 lines
apps/api/src/modules/projects/swagger.ts      273 lines
apps/web/src/admin.css                        243 lines
apps/web/src/pages/ProjectDetail.tsx          202 lines
```

CSS cleanup completed after the current audit:

- `apps/web/src/styles.css` was a legacy unused stylesheet and was deleted.
- `apps/web/src/design.css` was split into shared global foundation and public-page styling.
- `apps/web/src/admin.css` stayed admin-only and moved under `apps/web/src/styles/admin.css`.
- `apps/web/src/components/Layout.tsx` was unreferenced, imported admin CSS through a stale wrapper, and was deleted.

## Current Design Assessment

The codebase is already a reasonable monorepo: React/Vite frontend, Fastify API, Drizzle/PostgreSQL, S3-compatible object storage, Swagger, and focused tests. The main weakness is not the technology choice; it is that several domains still share oversized files.

Production risk comes from these areas:

- `apps/web/src/pages/Admin.tsx` mixes CMS shell, reusable controls, save state helpers, and every editor.
- `apps/api/src/modules/projects/routes.ts` owns routes for profile, facts, research, contact, settings, media, auth, and projects.
- `apps/api/src/modules/projects/swagger.ts` mixes schemas for unrelated domains.
- Public pages and CMS pages share global `types.ts`, which is acceptable for now but will become noisy as admin-only shapes grow.
- CSS is conceptually split by public/admin, which is good, but shared tokens and base browser styles currently live in the public stylesheet. Normalize this into `styles/global.css`, `styles/public.css`, and `styles/admin.css` so public and admin styles have clear ownership.

Recent refactor already reduced repetition by adding:

- Central admin auth route guard.
- Shared CMS save-state helper.
- Shared CMS reorder helper.
- Shared JSON request helper.
- Production security/cache headers in `apps/api/src/lib/security.ts`.
- Central API error logging/response handling in `apps/api/src/lib/observability.ts`.
- Sitemap and robots generation in `apps/api/src/lib/sitemap.ts`.

## Execution Log

Completed production hardening and first frontend split:

- `server.ts` is now app wiring only: Fastify config, plugins, root operational routes, module registration, and shutdown.
- Runtime config now controls `LOG_LEVEL`, `TRUST_PROXY`, and `API_BODY_LIMIT_BYTES`.
- Public GET responses, sitemap, and robots receive short CDN-friendly cache headers.
- Admin API responses receive `Cache-Control: no-store`.
- API errors are logged through Fastify request log and 500 responses no longer leak internal error detail.
- Health check now returns `requestId` and `uptimeSeconds` for easier production tracing.
- Reusable admin UI pieces moved to `apps/web/src/features/admin`.
- CMS editors moved to `apps/web/src/features/admin/editors`; `Admin.tsx` is now the shell.
- Backend route modules moved into `admin`, `profile`, `research`, `contact`, `settings`, `media`, and `projects`.
- Backend Zod schemas moved beside their domain route modules.
- Swagger domain entrypoints now exist beside each route module and reuse the stable OpenAPI definitions.
- API types and view-derived project types are split under `apps/web/src/types`.
- Project view mapping moved to `apps/web/src/features/projects/mappers.ts`.
- CSS now lives under `apps/web/src/styles` as `global.css`, `public.css`, and `admin.css`.
- Current verification after this batch: `pnpm check` passed, `pnpm test` passed.

## Architecture Principles

1. Keep the current monorepo.
2. Split by product domain, not by technical layer alone.
3. Keep public read paths separate from admin mutation paths.
4. Keep reusable code boring and small.
5. Add abstractions only after two or more real callers exist.
6. Every moved feature must keep the same API contract and pass `pnpm check`, `pnpm test`, and `pnpm build`.
7. Do not add dependencies for folder cleanup.
8. Do not reshape database tables during structural refactor unless a bug requires it.

## Target Backend Structure

```text
apps/api/src/
  server.ts
  config.ts
  storage.ts
  db/
    index.ts
    schema.ts
    seed.ts
  lib/
    http.ts
    security.ts
    sitemap.ts
  modules/
    admin/
      auth.ts
      auth.test.ts
      routes.ts
      swagger.ts
    profile/
      schema.ts
      routes.ts
      swagger.ts
    projects/
      schema.ts
      service.ts
      routes.ts
      swagger.ts
      routes.test.ts
    media/
      schema.ts
      service.ts
      routes.ts
      swagger.ts
      media.test.ts
    research/
      schema.ts
      routes.ts
      swagger.ts
    contact/
      schema.ts
      routes.ts
      swagger.ts
    settings/
      schema.ts
      routes.ts
      swagger.ts
```

Backend responsibilities:

- `server.ts`: app creation, plugin registration, global hooks, module registration, shutdown.
- `lib/security.ts`: security and cache headers.
- `lib/sitemap.ts`: sitemap/robots generation helpers.
- `modules/*/schema.ts`: Zod request validation only.
- `modules/*/routes.ts`: Fastify route registration for one domain only.
- `modules/*/service.ts`: database/storage operations when route logic is no longer trivial.
- `modules/*/swagger.ts`: OpenAPI schemas for one domain only.
- `db/schema.ts`: Drizzle table definitions and relations only.

Keep the existing `Project.featuredRank` model. Do not add selected-work tables unless multiple curated lists become a real product requirement.

## Target Frontend Structure

```text
apps/web/src/
  App.tsx
  main.tsx
  types/
    api.ts
    view.ts
  lib/
    api.ts
    seo.ts
  components/
    Nav.tsx
    Reveal.tsx
  features/
    projects/
      hooks.ts
      mappers.ts
      components/
        ProjectCard.tsx
        ProjectGallery.tsx
    admin/
      Admin.tsx
      components/
        Field.tsx
        SaveBadge.tsx
        Sidebar.tsx
        SectionTitle.tsx
      hooks/
        useSaveState.ts
        useReorder.ts
      editors/
        ProfileEditor.tsx
        ProjectEditor.tsx
        SelectedWorkEditor.tsx
        AboutFactsEditor.tsx
        ResearchEditor.tsx
        ContactEditor.tsx
        SettingsEditor.tsx
  pages/
    Home.tsx
    Projects.tsx
    ProjectDetail.tsx
  data/
    fallback-projects.ts
  styles/
    global.css
    public.css
    admin.css
```

Frontend responsibilities:

- `pages/*`: route-level composition only.
- `features/admin/Admin.tsx`: CMS shell composition only.
- `features/admin/editors/*`: one CMS editor per file.
- `features/admin/components/*`: reusable CMS UI primitives.
- `features/admin/hooks/*`: save-state and reorder behavior.
- `features/projects/mappers.ts`: API project to view project conversion.
- `lib/api.ts`: HTTP client only; no UI state.
- `types/api.ts`: API response/request types.
- `types/view.ts`: derived frontend view types.

## CSS Structure Plan

CSS must stay boring and explicit. Do not introduce SCSS or a CSS framework change for this cleanup; Vite, Tailwind v4, and modern CSS already cover the current needs.

```text
apps/web/src/styles/
  global.css
  public.css
  admin.css
```

`global.css` owns only shared foundation:

- Font imports used by public and admin pages.
- `@import "tailwindcss"` and `@theme inline` mappings.
- Root design tokens for color, typography, radius, and other shared primitives.
- Light theme token overrides.
- Base `html`, `body`, `#root`, `*`, scrollbar, and focus-visible rules.

`public.css` owns public website presentation:

- Navigation glass, skip-target helpers, and public interaction helpers.
- Reveal animation.
- Hero scene, public work rows, project archive cards, project detail gallery, about photo, research/contact/footer, and site intro/gate animation.
- Public-only button variants such as homepage contact buttons.

`admin.css` owns CMS presentation:

- `.cms-*` shell, login, sidebar, topbar, page, editor, card, form, list, tabs, preview, notice, and responsive rules.
- Admin-only status colors and derived CMS tokens.
- Admin controls must continue to use the `.cms-*` prefix unless a class is an intentional shared utility from `global.css`.

Import order:

```ts
// apps/web/src/main.tsx
import "./styles/global.css";
import "./styles/public.css";

// apps/web/src/pages/Admin.tsx
import "../styles/admin.css";
```

The `/admin` route is lazy-loaded, so `admin.css` should remain imported from the admin entry point. Do not import admin styling from shared components or public entry files.

## Refactor Plan

### Step 1 - Stabilize Shared Frontend Helpers

Move the already proven helpers out of `Admin.tsx`:

```text
withSave      -> features/admin/hooks/useSaveState.ts
moveOrdered   -> features/admin/hooks/useReorder.ts
Field         -> features/admin/components/Field.tsx
SaveBadge     -> features/admin/components/SaveBadge.tsx
Sidebar       -> features/admin/components/Sidebar.tsx
```

Acceptance:

- No UI behavior changes.
- `Admin.tsx` becomes mostly shell and routing.
- `pnpm check` passes.

### Step 2 - Split CMS Editors

Move each editor into its own file:

```text
ProfileEditor.tsx
ProjectEditor.tsx
SelectedWorkEditor.tsx
AboutFactsEditor.tsx
ResearchEditor.tsx
ContactEditor.tsx
SettingsEditor.tsx
```

Acceptance:

- Each editor owns its own loading, data fetching, form state, and mutation calls.
- Shared save/reorder behavior uses the admin hooks.
- `Admin.tsx` target size is under 180 lines.
- `pnpm check`, `pnpm build` pass.

### Step 3 - Split Backend Schemas And Routes By Domain

Extract route groups from `projects/routes.ts`:

```text
profile/routes.ts
research/routes.ts
contact/routes.ts
media/routes.ts
settings/routes.ts
admin/routes.ts
projects/routes.ts
```

Acceptance:

- `projects/routes.ts` only handles project list/detail/CRUD/featured.
- Auth routes move to `admin/routes.ts`.
- Media upload/delete moves to `media/routes.ts`.
- Existing URLs stay unchanged.
- Admin guard still protects every `/api/admin/*` endpoint except `/api/admin/login`.
- Existing tests pass.

### Step 4 - Split Swagger By Domain

Move OpenAPI schema blocks beside their route modules:

```text
profile/swagger.ts
projects/swagger.ts
research/swagger.ts
contact/swagger.ts
media/swagger.ts
settings/swagger.ts
admin/swagger.ts
```

Acceptance:

- Swagger remains visible at `/docs`.
- No endpoint loses request body, params, response, or admin security metadata.
- Add or keep tests for critical schema helpers where practical.

### Step 5 - Move Sitemap, Robots, And Headers To Lib

Move root operational helpers:

```text
server.ts publicSiteUrl/xml -> lib/sitemap.ts
server.ts onSend headers    -> lib/security.ts
```

Acceptance:

- `server.ts` only wires app lifecycle, plugins, root routes, and modules.
- Public API keeps cache headers.
- Admin API keeps `no-store`.
- Sitemap includes only published indexed projects.

### Step 6 - Separate API Types From View Types

Split `apps/web/src/types.ts`:

```text
types/api.ts
types/view.ts
```

Acceptance:

- API models mirror backend response shape.
- View models contain derived fields such as `num`, `year`, `tags`, `demoStatus`, `github`, and `demo`.
- `features/projects/mappers.ts` owns conversion from API to view shape.

### Step 7 - Production Hardening Pass

Keep this step small and deployment-oriented:

- Confirm `Cache-Control` policy for public API, sitemap, robots, and admin.
- Add deployment docs for CDN/R2, reverse proxy, HTTPS, and health checks.
- Decide whether login rate limit remains in-memory for single-instance or moves to PostgreSQL/Redis for multi-instance.
- Add a note that load balancing requires sticky-free DB-backed sessions, which are already supported because sessions are stored in PostgreSQL.

Acceptance:

- `pnpm check`
- `pnpm test`
- `pnpm build`
- `/health`
- `/health/storage`
- `/docs`
- `/sitemap.xml`
- `/robots.txt`

### Step 8 - Normalize CSS Structure

Move the active styles into the documented CSS layout:

```text
apps/web/src/design.css -> apps/web/src/styles/global.css + apps/web/src/styles/public.css
apps/web/src/admin.css  -> apps/web/src/styles/admin.css
delete apps/web/src/styles.css
delete apps/web/src/components/Layout.tsx if still unreferenced
```

Acceptance:

- `main.tsx` imports `styles/global.css` before `styles/public.css`.
- `Admin.tsx` imports `styles/admin.css`.
- No shared component imports admin CSS.
- `styles.css`, `design.css`, and root-level `admin.css` are gone after migration.
- Public build CSS and admin lazy-route CSS remain separate output assets.
- `pnpm --filter @portfolio/web check` passes.
- `pnpm --filter @portfolio/web build` passes.

## Coding Style Rules

Backend:

- One domain per route file.
- Zod schemas live next to the route that uses them.
- Route handlers validate input, call service/helper, return HTTP response.
- Service functions own cross-table transactions and storage calls.
- Public queries must filter draft, archived, hidden, private, and non-indexed content server-side.
- Admin routes rely on one centralized auth/CSRF guard.
- Error responses use `{ message: string }`.

Frontend:

- Route pages compose sections; editors own forms.
- Reusable CMS controls live in `features/admin/components`.
- Reusable CMS behavior lives in `features/admin/hooks`.
- API client functions return typed promises and do not know about UI state.
- Public view mapping stays outside React components where possible.
- Keep browser fallbacks explicit and small.
- Do not add state libraries until prop/state flow becomes measurably painful.

CSS:

- Keep public and admin styling separate; only `global.css` may contain shared foundation.
- Keep `global.css` minimal: tokens, Tailwind theme mapping, document/base rules, and shared accessibility/focus behavior only.
- Public/admin CSS must not import each other.
- Keep admin selectors under `.cms-*`; avoid generic admin classes such as `.wide` unless they are scoped, for example `.cms-field.wide`, or renamed to a CMS-prefixed utility.
- Avoid nested cards and decorative backgrounds that do not carry product meaning.
- Keep fixed-format UI elements dimensioned to prevent layout shift.
- Use existing design tokens before adding new colors.
- Add new design tokens only when the value is reused across public and admin or across several public sections.

Testing:

- Keep focused tests for auth, guard behavior, validation, upload parsing, SEO/indexing, and project mapper behavior.
- Add route-level tests only for behavior that cannot be checked through pure helpers.
- Every refactor step must pass checks before the next step starts.

## Production System Design

```text
Visitor browser
  -> CDN/static host for React build
  -> API over HTTPS
       -> Fastify route modules
       -> PostgreSQL via Drizzle
       -> S3-compatible storage/R2 for media
       -> Swagger docs for API contract

Admin browser
  -> /admin lazy-loaded bundle
  -> /api/admin/* with HttpOnly session cookie + CSRF header
       -> PostgreSQL-backed admin sessions
       -> validated mutations
       -> S3-compatible media writes
```

Deployment posture:

- Frontend static assets should be served through CDN with long immutable cache headers.
- API public GET responses can use short cache headers with stale-while-revalidate.
- Admin API must always use `no-store`.
- Media public URLs should point to CDN/R2 custom domain through `S3_PUBLIC_URL`.
- Load balancer is safe without sticky sessions because admin sessions are database-backed.
- Distributed rate limit is only required when running more than one API instance.

## What Not To Refactor Yet

- Do not split every tiny form input into its own component.
- Do not introduce Redux/Zustand just for CMS forms.
- Do not introduce a generic CRUD framework.
- Do not add a repository layer for every table until route/service duplication proves it is needed.
- Do not change database schema during file-structure cleanup.

## Definition Of Done For Architecture Refactor

- `Admin.tsx` is a shell, not a pile of editors.
- Backend route modules map cleanly to product domains.
- Swagger is still complete and navigable.
- Existing endpoint URLs are unchanged.
- Public rendering still works with CMS data and fallback data.
- Admin auth, CSRF, upload validation, sitemap, robots, and settings behavior still pass tests.
- Final verification passes:

```bash
pnpm check
pnpm test
pnpm build
```

CSS-specific completion:

- `apps/web/src/styles/global.css`, `public.css`, and `admin.css` are the only source stylesheets.
- `apps/web/src/styles.css`, `apps/web/src/design.css`, and `apps/web/src/admin.css` no longer exist.
- `rg "styles.css|design.css|../admin.css" apps/web/src` returns no stale imports.
- Admin styling is loaded only through the lazy admin route.
