# CMS Content Plan

> Historical planning document. The migration-ready product contract is now
> `docs/prd.md`, aligned on 2026-09-10 with the implemented Figma Make CMS
> prototype. Where this plan conflicts with the PRD (notably analytics,
> Settings, project preview, and persistent uploads), the PRD takes precedence.

## Cleaned Request

Build a CMS/admin area for managing all portfolio website content from one private interface. The CMS must allow content to be created, edited, reordered, published/unpublished, and deleted where appropriate.

The managed content should include:

- Home hero copy: name, role, headline, supporting text, CTA labels, and CTA links.
- Selected work section: which projects appear on the main home page, their order, and the image highlighted in the first project preview.
- Project archive and detail pages: project title, slug, category, role, team/organization note, summary, challenge, contribution, solution, dates, technologies, status, live demo URL, GitHub URL, cover image, gallery images, and highlighted media.
- About section: portrait/photo, name, headline, biography, university, degree, location, languages, and any extra profile fields.
- Research and credentials section: publications, research papers, certifications, issuers/venues, dates, URLs, and display order.
- Contact section: email, phone, LinkedIn, GitHub, other contact links, CTA text, and footer identity/location data.

The CMS should support adding and removing repeatable content such as projects, project images, technologies, about facts, languages, research entries, certifications, and contact links.

## Editable Page Requirements

### Homepage

Content that must be editable from the CMS:

- Name/title shown in the hero, currently `Mohammad Fauzi Aziz`.
- Main hero headline, currently `I build reliable web systems that feel simple to use`.
- Hero supporting description below the headline.
- GitHub button label, currently `View GitHub`.
- GitHub button URL.
- Primary CTA label, currently `Explore selected work`.
- Primary CTA target URL or page anchor.

### Selected Work

Content and behavior that must be editable from the CMS:

- Choose which projects appear in the homepage selected work section.
- Limit selected work on the homepage to 5 projects.
- Control selected work order.
- Set a hover preview image for each selected project.
- Manage each project using the current project structure, then extend it with the planned detail fields.
- Update the live demo link for each project.
- Control project demo status, for example live, coming soon, private, or archived.

### About

Content that must be editable from the CMS:

- About/profile photo.
- About headline, currently `I turn complex workflows into dependable, maintainable products`.
- About body text, currently describing business logic, database operations, authentication, RBAC, validation, testing, and frontend-backend integration.
- About facts, where both field label and value can be edited.

Current about facts that should be migrated into CMS:

- `University`: `Bina Nusantara University`.
- `Degree`: `Computer Science (2022 - 2026)`.
- `Location`: `Indonesia`.
- `Languages`: `Indonesian`.

The CMS must allow these facts to be added, edited, reordered, hidden, or deleted.

### Research And Credentials

Content that must be editable from the CMS:

- Research/publication title.
- Venue or publisher.
- Date label.
- DOI code.
- External URL.
- Display type, such as publication, paper, or certification.
- Display order.
- Visibility.

When a DOI code is entered, the CMS should generate the direct DOI link automatically using `https://doi.org/{doi}`.

### Contact

Content that must be editable from the CMS:

- Email label, value, and link.
- Phone label, value, and link.
- LinkedIn label, value, and link.
- GitHub label, value, and link.
- Contact rows shown on the right side of the contact section.
- Optional extra contact links.
- Display order.
- Visibility.

## Current State

The project already has:

- React/Vite frontend in `apps/web`.
- Fastify API in `apps/api`.
- PostgreSQL + Drizzle setup.
- Existing admin token authentication through `x-admin-token`.
- Existing CRUD for projects in `apps/web/src/pages/Admin.tsx`.
- Existing Drizzle schema for `Project`, `Technology`, and `ProjectTechnology`.

Current limitations:

- Home hero, about, research, certifications, contact, and footer content are hardcoded in `apps/web/src/pages/Home.tsx`.
- Project gallery images are hardcoded in `apps/web/src/pages/ProjectDetail.tsx`.
- Project media only supports one `coverImageUrl`.
- Admin UI is currently one large form focused only on basic project fields.

## Scope

### Version 1

Keep the CMS small and practical:

- Replace the existing token-only admin access with a simple CMS login.
- Use one admin role only: `ADMIN`.
- Store image fields as URLs first.
- Use reorder fields with simple numeric `sortOrder` / `featuredRank`.
- Build CRUD screens inside the existing `/admin` page instead of adding a separate admin app.
- Add database-backed content APIs for public website rendering.
- Add baseline SEO, performance, and security improvements while the content moves into the CMS.

No managed file uploads in Version 1. Use external image URLs or existing hosted image URLs. Add uploads later only if URL-based image management becomes painful.

### Version 2

Add only after Version 1 works:

- Managed image upload/storage.
- Rich text editor.
- Draft preview mode.
- Activity log/version history.

## Recommended Data Model

### `SiteProfile`

Single-row content for global identity and home/about/footer basics.

Fields:

- `id`
- `displayName`
- `shortName`
- `role`
- `heroHeadline`
- `heroEmphasis`
- `heroBody`
- `heroPrimaryLabel`
- `heroPrimaryUrl`
- `heroSecondaryLabel`
- `heroSecondaryUrl`
- `aboutHeadline`
- `aboutBody`
- `portraitImageUrl`
- `footerLocation`
- `footerTimezone`
- `createdAt`
- `updatedAt`

SEO fields:

- `seoTitle`
- `seoDescription`
- `seoImageUrl`
- `canonicalUrl`
- `isIndexed`

### `AdminUser`

Single admin account for CMS access.

Fields:

- `id`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

Role should stay fixed as `ADMIN`. Do not add multi-role permission logic until there is a real second admin workflow.

### `AdminSession`

Admin login session.

Fields:

- `id`
- `adminUserId`
- `tokenHash`
- `expiresAt`
- `createdAt`

Use an HTTP-only cookie for the session token where deployment allows it.

### `ProfileFact`

Repeatable about facts such as University, Degree, Location, Languages.

Fields:

- `id`
- `label`
- `value`
- `sortOrder`
- `isVisible`

### `ContactLink`

Repeatable contact rows and buttons.

Fields:

- `id`
- `label`
- `value`
- `url`
- `kind`
- `sortOrder`
- `isPrimary`
- `isVisible`

`kind` examples: `EMAIL`, `PHONE`, `LINKEDIN`, `GITHUB`, `WEBSITE`, `OTHER`.

### `ResearchItem`

Publications, research papers, and certifications can share one model.

Fields:

- `id`
- `type`
- `title`
- `issuerOrVenue`
- `dateLabel`
- `doi`
- `url`
- `sortOrder`
- `isVisible`

`type` examples: `PUBLICATION`, `PAPER`, `CERTIFICATION`.

### Extend `Project`

Add fields:

- `overview`
- `highlightImageUrl`
- `highlightImageAlt`
- `hoverPreviewImageUrl`
- `hoverPreviewImageAlt`
- `sortOrder`
- `seoTitle`
- `seoDescription`
- `seoImageUrl`
- `canonicalUrl`
- `isIndexed`

Keep existing fields:

- `coverImageUrl`
- `featuredRank`
- `demoUrl`
- `githubUrl`
- `status`
- `demoStatus`

`summary` can stay as the short card description. `overview` should become the longer detail-page opening paragraph.

`hoverPreviewImageUrl` should control the image shown when hovering a project in the homepage selected work list. If it is empty, the frontend can fall back to `highlightImageUrl` or `coverImageUrl`.

### `ProjectMedia`

Repeatable images for project detail pages.

Fields:

- `id`
- `projectId`
- `url`
- `altText`
- `caption`
- `kind`
- `sortOrder`
- `isHighlighted`

`kind` examples: `IMAGE`, `VIDEO`, `MOCKUP`, `SCREENSHOT`.

## API Plan

Public endpoints:

- `GET /api/site-content`
- `GET /api/projects`
- `GET /api/projects/:slug`
- `GET /sitemap.xml`
- `GET /robots.txt`

Admin endpoints:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `GET /api/admin/site-content`
- `PUT /api/admin/site-content`
- `GET /api/admin/profile-facts`
- `POST /api/admin/profile-facts`
- `PUT /api/admin/profile-facts/:id`
- `DELETE /api/admin/profile-facts/:id`
- `GET /api/admin/contact-links`
- `POST /api/admin/contact-links`
- `PUT /api/admin/contact-links/:id`
- `DELETE /api/admin/contact-links/:id`
- `GET /api/admin/research-items`
- `POST /api/admin/research-items`
- `PUT /api/admin/research-items/:id`
- `DELETE /api/admin/research-items/:id`
- Extend existing project admin endpoints to include overview and project media.

Use Zod schemas for every request body, following the current project module pattern.

## CMS Login Plan

Replace the current manual admin token entry with a normal login form:

- Login page accepts email and password.
- Password is stored as a hash, never plain text.
- Successful login creates an admin session.
- The browser stores the session in an HTTP-only cookie where possible.
- Logout deletes the session.
- Every `/api/admin/*` endpoint validates the session.
- Error messages stay generic, for example: `Invalid email or password`.

Only one role is needed:

- `ADMIN` can manage all CMS content.
- No editor/viewer/contributor roles in Version 1.
- No permission matrix in Version 1.

Keep a seed or setup path for creating the first admin user from environment variables.

## SEO Plan

Add CMS-manageable SEO fields to global site content and project content:

- SEO title.
- SEO description.
- SEO image URL.
- Canonical URL.
- Indexing toggle through `isIndexed`.
- Alt text for profile photo, project cover, highlighted image, and gallery images.

Frontend SEO behavior:

- Home page reads SEO data from `SiteProfile`.
- Project detail pages read SEO data from each project.
- Use Open Graph tags for LinkedIn, WhatsApp, and other link previews.
- Use Twitter/X card metadata.
- Keep one clear `h1` per page.
- Generate project detail URLs from clean slugs.
- Generate `sitemap.xml` from published and indexed content.
- Generate `robots.txt` with the public sitemap URL.
- Do not index draft, archived, private, or `isIndexed = false` content.

## Performance Plan

Keep the public portfolio fast while CMS data grows:

- Lazy-load project gallery images.
- Use priority loading only for first-viewport images.
- Keep the Three.js hero scene lazy-loaded.
- Preserve reduced-motion and lightweight fallback behavior.
- Avoid loading admin code in the public page bundle.
- Cache public content responses where safe.
- Keep project list queries paginated or limited once the project count grows.
- Avoid layout shift by giving images stable dimensions or aspect ratios.
- Keep image URLs optimized for correct size and format.
- Run `pnpm check` and `pnpm build` before release.

## Security Plan

Protect CMS access and public rendering:

- Hash admin passwords with a strong password hashing library.
- Store session secrets and database URLs only in environment variables.
- Use HTTP-only, secure cookies in production.
- Add login rate limiting.
- Validate all CMS input with Zod.
- Validate URLs before saving links and image URLs.
- Avoid rendering raw HTML from CMS content.
- Apply security headers.
- Restrict CORS to trusted frontend origins.
- Limit request body size.
- Protect every admin mutation with session validation.
- Confirm destructive delete actions in the UI.
- Keep login errors generic.
- Backup the database before large migrations.

## Admin UI Plan

Refactor `/admin` into simple tabs:

- `Profile`: hero, about text, portrait URL, footer identity.
- `About Facts`: university, degree, location, languages, extra facts.
- `Projects`: existing project CRUD, extended with overview, highlight image, cover image, demo URL, GitHub URL, and gallery media.
- `Research`: publications, papers, certifications.
- `Contact`: email, phone, LinkedIn, GitHub, extra links.

Each repeatable section should have:

- Add button.
- Edit form.
- Delete button with confirmation.
- `isVisible` toggle.
- `sortOrder` number input.

## Frontend Rendering Plan

Replace hardcoded content in `Home.tsx` with API-backed data:

- Hero reads from `SiteProfile`.
- Work section keeps using projects, ordered by `featuredRank`.
- About reads `SiteProfile` + `ProfileFact`.
- Research reads visible `ResearchItem` entries grouped by type.
- Contact reads visible `ContactLink`.
- Footer reads `SiteProfile`.

Replace `galleryByProject` in `ProjectDetail.tsx` with `ProjectMedia`.

Keep existing fallback behavior for projects. Add a small fallback for site content so the public site still renders if the API is offline during local development.

## Implementation Phases

1. Add Drizzle tables and migration for admin user/session, site profile, profile facts, contact links, research items, project SEO fields, and project media.
2. Seed the first admin user and current hardcoded website content into the new tables.
3. Add login, logout, and session validation endpoints.
4. Replace admin token checks with session-based protection.
5. Add API services, schemas, and routes for public site content and admin CRUD.
6. Extend project schema/service/routes to support `overview`, `highlightImageUrl`, SEO fields, and media.
7. Add sitemap and robots endpoints.
8. Update frontend types and API client.
9. Refactor `Home.tsx` and `ProjectDetail.tsx` to read CMS data.
10. Refactor `Admin.tsx` into tabs and forms for every content group.
11. Add SEO metadata rendering.
12. Run API tests, type checks, and production build.

## Verification Checklist

- Admin login works with email and password.
- Admin logout ends the session.
- Only authenticated admin sessions can access admin pages and endpoints.
- Public pages render without hardcoded profile/research/contact content.
- A project can be created, edited, published, unpublished, reordered, and deleted.
- A project can show cover image, highlighted image, gallery images, GitHub URL, and live demo URL.
- About facts can add/remove entries such as University and Languages.
- Research and certifications can be added, hidden, reordered, and removed.
- Contact links can be added, hidden, reordered, and removed.
- SEO fields render on home and project detail pages.
- Draft, archived, private, or non-indexed content does not appear in sitemap.
- Public images use alt text and stable layout dimensions.
- Home page still works when there are zero projects or no optional links.
- `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Deliberate Simplifications

- Image upload is skipped for Version 1. URL fields are enough to make every requested image configurable.
- CMS auth uses one admin role only. Multi-role permissions are skipped until there is a real need.
- No rich text editor yet. Plain text fields match the current website content and reduce implementation risk.
