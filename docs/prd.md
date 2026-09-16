# PRD - Interactive Portfolio and Portfolio CMS

Status: migration-ready  
Last aligned: 2026-09-10  
CMS design source: `D:\Projek\design_website\CMS Admin Dashboard Design`

## 1. Product summary

Build an accessible, motion-led portfolio for Mohammad Fauzi Aziz and a private, single-admin CMS that manages the portfolio without code changes.

The existing public portfolio remains the source of truth for public layout and interactions. The Figma Make CMS export is the source of truth for the admin information architecture, visual language, fields, and interaction states. The production CMS must replace all mock data, hardcoded credentials, `blob:`-only uploads, and simulated analytics from the design prototype with real APIs and persistent storage.

## 2. Product goals

- Help recruiters, technical reviewers, collaborators, and clients understand Fauzi's work quickly and truthfully.
- Let Fauzi manage homepage content, selected work, projects, media, about facts, research and credentials, contact links, and SEO from one private interface.
- Preserve the public portfolio's minimalist visual identity across the CMS: compact layout, calm spacing, thin dividers, clear typography, and dedicated dark/light color tokens.
- Make draft content previewable at desktop, tablet, and mobile widths before publication.
- Show analytics and operational status only when backed by a real data source; placeholder data must always be clearly identified as simulated.

## 3. Non-goals

- Multi-user roles, invitations, approval workflows, or granular permissions. Version 1 has one `ADMIN` role.
- A rich-text editor or arbitrary HTML input.
- Complex drag-and-drop when up/down controls or numeric ordering are sufficient.
- A general-purpose deployment control panel that executes arbitrary build commands.
- Fabricated traffic, SEO, backlink, performance, project, credential, or contact data presented as real.
- Public user accounts, comments, e-commerce, a social feed, or real-time chat.

## 4. Success criteria

- A visitor can open a featured project and see its truthful Live Demo state above the fold in two interactions or fewer from the homepage.
- Public pages are usable on mobile, with a keyboard, and with reduced motion enabled.
- The admin can sign in with email and password, sign out, and recover safely from an expired session.
- The admin can create, edit, order, preview, publish, archive, and delete portfolio content without deployment or code edits.
- Every project image is managed through persistent upload in the CMS, has alt text where required, and remains available after a reload.
- A draft or archived project can be previewed but cannot leak into public queries, search indexes, sitemap output, or public next-project navigation.
- Production deployment has HTTPS, database backups, a health endpoint, and no repository-stored credentials.
- Production build, type checks, API tests, and the critical public/CMS smoke flows pass.

## 5. Users and core journeys

| User | Need | Acceptance criterion |
| --- | --- | --- |
| Recruiter | Scan proof of work quickly | Hero, selected work, about, research/credentials, and contact actions form a complete path with no dead end. |
| Technical reviewer | Assess a project honestly | Detail page shows problem, role, team context, contribution, solution, technologies, media, repository, and demo state. |
| Mobile visitor | Browse smoothly | Desktop patterns collapse to readable, touch-friendly layouts with no horizontal overflow. |
| Fauzi (admin) | Maintain portfolio content | All public content groups can be edited, ordered, hidden, previewed, and saved from `/admin`. |
| Fauzi (admin) | Check site health | Dashboard distinguishes real connected metrics from unavailable or placeholder metrics. |

## 6. Information architecture

### Public routes

- `/`: homepage.
- `/projects`: published project archive.
- `/projects/:slug`: published project detail.
- `/resume`: downloadable CV page or link, with an optional printable version.
- `sitemap.xml`, `robots.txt`, and a health endpoint.

### CMS route and navigation

- `/admin`: login when signed out; CMS shell when authenticated.
- CMS sidebar: Dashboard, Profile & Homepage, Selected Work, Projects, About, Research & Credentials, Contact, SEO, and Settings.
- CMS header: breadcrumb/current section, site status, dark/light theme toggle, View site link, admin identity, and sign out.
- Desktop uses a fixed sidebar and two-column forms where useful. Tablet may collapse the sidebar. Mobile uses a compact menu and single-column content while keeping primary save actions reachable.

## 7. Public portfolio requirements

### 7.1 Homepage

- Sections: navigation, hero, five-item compact Selected Work list, About, Research & Credentials, Contact, and footer.
- Include `Show more projects` below Selected Work and link it to `/projects`.
- Do not add a capability/stack section.
- Hero content, CTAs, about content, research/credentials, contacts, footer identity, and Selected Work come from CMS-managed public APIs with a small development fallback.
- Selected Work displays at most five published projects in the configured order.

### 7.2 Project archive and detail

- `/projects` shows all published projects in a responsive image-and-title grid. Selecting a tile opens `/projects/:slug`.
- Archive cards may use restrained pointer tilt and scroll parallax; both must respect reduced motion and keyboard navigation.
- Project detail includes title, category, date range, role, team/organization note, summary/overview, challenge, contribution, solution, technologies, cover/highlight media, gallery, repository, demo state, and next published project.
- Live Demo is above the fold. Demo status supports `LIVE`, `COMING_SOON`, `PRIVATE`, and `ARCHIVED`; only `LIVE` with a validated HTTP(S) URL is clickable.
- Gallery media follows the technologies/content area, uses CMS ordering, and renders alt text and optional captions.
- External links open safely in a new tab with descriptive labels.

### 7.3 Public failure and empty states

- Loading, API unavailable, empty project list, missing project, missing optional media, and 404 states are explicit and accessible.
- A public page continues to render its essential content when optional links or media are absent.

## 8. CMS functional requirements

### 8.1 Authentication and session

- Login contains email, password, show/hide password, loading state, and a generic invalid-credentials message.
- Authentication uses a server-validated password hash and an expiring HTTP-only secure cookie. Hardcoded demo credentials and `sessionStorage` admin tokens must not migrate.
- Only the `ADMIN` role exists. No role selector or permission-management UI is shown.
- Sign out invalidates the server session. Expired sessions return the user to login without exposing tokens or server details.
- Login attempts are rate limited and errors do not reveal whether an email exists.

### 8.2 CMS shell and common behavior

- Use the CMS design tokens in section 11 and support dark/light themes.
- Every editor provides loading, empty, API error, saving, saved, failed-to-save, disabled, and validation states where applicable.
- Destructive actions use a keyboard-accessible confirmation dialog with a clear description of what will be removed.
- Unsaved changes trigger a simple navigation/browser warning.
- Icon-only buttons have accessible names, focus is visible, and information is never conveyed by color alone.
- A successful save refreshes authoritative server data; optimistic UI must roll back or explain failures.

### 8.3 Dashboard

- Provide date ranges of 7, 30, and 90 days and a visitors/page-views toggle.
- Overview metrics: total visitors, page views, unique visitors, average session duration, bounce rate, top project, organic traffic, backlink traffic, performance score, and SEO score.
- Detail sections: traffic over time, top pages, SEO traffic/keywords, device breakdown, referrer sources, backlink traffic/domains, Core Web Vitals, accessibility score, and SEO health checks.
- SEO health includes sitemap, robots, meta-description coverage, alt-text coverage, canonical URLs, and bundle-size/image status.
- Until an analytics provider is connected, the page must show an explicit `Placeholder data` or `Analytics not connected` state. Simulated values cannot be presented as production data.
- Performance and SEO checks should prefer measured or computed data. Unsupported metrics display `Unavailable`, not invented values.

### 8.4 Profile & Homepage

- Edit display name, role/eyebrow, hero headline, supporting description, primary CTA label/URL, GitHub CTA label/URL, footer short name, location, and timezone.
- Provide a compact live preview of hero copy, CTA labels, and footer identity.
- CTA targets accept safe site-relative anchors/routes or validated HTTP(S) URLs as appropriate.

### 8.5 Selected Work

- Display the project catalog with title, category, publication status, and demo status.
- Select or unselect at most five projects and show a visible limit-reached state.
- Reorder selections with up/down controls and show their one-based public order.
- Configure a hover-preview image from an uploaded project asset and show a thumbnail/error preview.
- Image fallback order is hover preview, highlight image, cover image.
- Draft and archived projects may be configured in the CMS for planning, but public Selected Work returns published projects only.

### 8.6 Projects

- Project list shows title, category, publication status, demo status, and current selection/featured order. Empty and no-selection states provide an Add project action.
- Create, edit, save, preview, change publication status, archive, and delete projects.
- Provide separate `Save draft` and `Save` actions. `Save draft` always persists `DRAFT`; publication validation applies when saving as `PUBLISHED`.
- Group the editor into Info, Content, Media, and SEO & Links.

Required project fields and behavior:

| Group | Fields |
| --- | --- |
| Info | title, unique slug, category, role, team/organization note, start date, end date, status, demo status, technologies/tags |
| Content | short summary, overview, challenge, contribution, solution |
| Media | cover image, highlight image, hover preview image, gallery items |
| SEO & Links | SEO title, SEO description, SEO/OG image, canonical URL, indexing toggle, live demo URL, GitHub URL |

- Required before publication: title, slug, category, role, summary, overview, challenge, contribution, solution, valid date range, and at least one technology. Drafts require only a title and unique slug, and may otherwise be incomplete.
- Slugs are normalized and unique. Changing a published slug requires a redirect strategy or an explicit warning.
- Project media uses persistent upload rather than manually entered image URLs. Gallery items support multiple file selection, alt text, optional caption, ordering, cover/highlight/hover selection, replacement, and deletion.
- Uploaded files show queued, uploading, ready, or failed preview states and are validated for allowed image type, size, and dimensions before storage. Local preview data is never persisted.
- Publication and demo status are independent. Non-live demo states render disabled public actions even if a demo URL exists.

### 8.7 Project preview

- Preview uses the same public project rendering component/data mapper so it cannot drift from the real project page.
- Preview works before publication and uses current unsaved form values without making them public.
- Provide desktop, tablet, and mobile widths plus dark/light theme switching.
- Show `Draft Preview` or `Unpublished Preview` when relevant.
- Include Back to CMS/editor without navigating to the landing page. Show Open public page only for a published project with a valid slug.
- Preview includes project metadata, actions, cover/highlight media, content sections, technologies, gallery, and next-project area. Demo disabled states match public behavior.

### 8.8 About

- Edit portrait by URL or persistent upload, about headline, and biography.
- Manage repeatable facts with editable label/value, ordering, visibility, add, and delete.
- Initial verified facts: University, Degree, Location, and Languages. Seed data must come from project context/CV, not Figma sample claims.

### 8.9 Research & Credentials

- Create, edit, group, order, show/hide, and delete `PUBLICATION`, `PAPER`, and `CERTIFICATION` items.
- Fields: type, title, venue/issuer, date label, DOI, manual URL, order, and visibility.
- A DOI generates and previews `https://doi.org/{doi}`. Manual URL is used when no DOI is present.
- Prototype-only sample publications and credentials must not be migrated unless verified.

### 8.10 Contact

- Create, edit, order, show/hide, mark primary, and delete contact rows.
- Fields: label, display value, URL/href, kind, order, primary, and visibility.
- Kinds: `EMAIL`, `PHONE`, `LINKEDIN`, `GITHUB`, `WEBSITE`, and `OTHER`.
- Validate `mailto:`, `tel:`, and HTTP(S) values according to kind. Personal values come from verified configuration/data, not prototype placeholders.

### 8.11 SEO

- Global fields: homepage title, meta description, SEO/OG image, canonical URL, and indexing toggle.
- Show title and description counters/hints, a search-result preview, and an Open Graph preview.
- Show sitemap and robots status/URLs as read-only server-derived values.
- Project SEO remains inside each Project editor.
- Draft, archived, hidden, private, or non-indexed content is excluded from sitemap and structured-data output as applicable.

### 8.12 Settings

- Version 1 supports site display name, tagline, public URL, timezone, content language (`en` or `id`), admin email display, and password change.
- Theme preference is user-local and does not alter public content.
- Deployment settings shown in the design—auto-deploy, build command, output directory, and Node.js version—are post-MVP integration settings. Before a deployment provider is connected they must be read-only or explicitly labeled unavailable.
- If deployment integration is added, commands and versions are selected from server-side allowlists; the browser cannot submit arbitrary shell commands.
- Notification preferences cover deploy success, build errors, weekly analytics digest, and contact-form mail only after the matching services exist. Unavailable options are disabled with explanation.
- Account deletion is post-MVP. It requires re-authentication, typed confirmation, server-side authorization, and a clear statement of which content and sessions are deleted. It must never silently leave orphaned content or delete the public site.

## 9. Data model requirements

| Entity | Required purpose and fields |
| --- | --- |
| `AdminUser` | id, email, passwordHash, role=`ADMIN`, createdAt, updatedAt |
| `AdminSession` | id, adminUserId, tokenHash, expiresAt, createdAt |
| `SiteProfile` | identity, hero copy/CTAs, about copy/portrait, footer fields, global SEO, locale, timestamps |
| `ProfileFact` | label, value, sortOrder, isVisible |
| `ContactLink` | label, value, url, kind, sortOrder, isPrimary, isVisible |
| `ResearchItem` | type, title, issuerOrVenue, dateLabel, doi, url, sortOrder, isVisible |
| `Project` | current project fields plus overview, highlight/hover media, sort fields, SEO fields, canonical URL, isIndexed, timestamps |
| `ProjectMedia` | projectId, media asset, legacy URL fallback, altText, caption, kind, sortOrder, isHighlighted |
| `MediaAsset` | storage key/url, original name, MIME type, byte size, dimensions, timestamps; required only for persistent uploads |
| `SitePreference` | narrowly scoped persisted site/admin settings; no arbitrary command or secret values |

Data constraints:

- Public queries filter by publication and visibility server-side.
- Ordering fields are deterministic and indexed where used by public queries.
- Deleting a project removes its project-media relationships safely; deleting an uploaded asset checks references first.
- Secrets, session tokens, provider credentials, and deployment keys are never returned by content APIs.

## 10. API requirements

### Public

- `GET /api/site-content`
- `GET /api/projects`
- `GET /api/projects/:slug`
- `GET /sitemap.xml`
- `GET /robots.txt`
- `GET /health`

### Admin

- Login, logout, current-session, and password-change endpoints.
- Authenticated CRUD/reorder endpoints for site profile, selected work, projects, project media, profile facts, research items, contact links, and SEO/settings.
- Authenticated media upload/delete endpoints when persistent upload support is enabled.
- Dashboard summary endpoint that reports provider connection/availability and never substitutes simulated numbers for missing data.
- Request and response validation is server-side. Admin mutations use consistent error shapes and appropriate HTTP status codes.

## 11. Visual and responsive requirements

### CMS tokens

| Token | Dark | Light |
| --- | --- | --- |
| Background | `#111210` | `#F7F6F2` |
| Elevated surface | `#1A1C19` | `#FFFFFF` |
| Primary text | `#F4F1EA` | `#161713` |
| Secondary text | `#B7B4AC` | `#66675F` |
| Border | `#32342F` | `#DEDCD5` |
| Accent | `#B9F227` | `#587D00` |

- Use Inter for UI copy and JetBrains Mono for compact metadata/status treatment, matching the prototype where licenses and loading strategy permit.
- Accent is reserved for active navigation, primary actions, focus, and chart highlights. Avoid gradients, glassmorphism, decorative blobs, and excessive cards.
- Desktop may use sidebar and two-column editors; tablet adapts between one and two columns; mobile is single-column with no clipped labels/actions.
- Statuses include a text label or icon in addition to color: Good, Needs attention, Critical/Poor, Draft, Published, Archived, Indexed, and Not indexed.

## 12. Non-functional requirements

- Accessibility: semantic landmarks, visible focus, keyboard navigation, labeled controls, dialog focus management, WCAG AA contrast, image alt text, and `prefers-reduced-motion` support.
- Performance: lazy-load media and the admin bundle, defer nonessential animation, avoid layout shift, and target Lighthouse performance/accessibility/best-practices/SEO >= 90 on production public pages.
- Motion: React Three Fiber/Three.js is limited to one subtle public hero scene. Framer Motion may handle component/route transitions. No scroll-jacking. CMS motion is limited to functional feedback.
- Security: server-side validation, password hashing, secure sessions, CSRF protection where cookie auth is used, rate limiting, upload validation, least-privilege PostgreSQL credentials, and secrets only in environment variables.
- Reliability: error boundary, 404 page, health endpoint, logged server failures without secrets, automated PostgreSQL backups, and safe migrations.
- SEO: metadata per page, Open Graph images, canonical URLs, sitemap, robots, and Person/CreativeWork structured data where appropriate.
- Privacy: analytics and contact-form integrations require a documented provider and data-retention approach before activation.

## 13. Migration plan from the Figma CMS prototype

The migration is an integration into the existing monorepo, not a second standalone app.

### Phase 0 - Contract and inventory

- Treat this PRD as the product contract.
- Preserve the existing public portfolio routes and API-backed project behavior.
- Use the Figma Make export as a visual/interaction reference; do not copy mock credentials, mock claims, fake URLs, or sample analytics.

### Phase 1 - CMS shell and real auth

- Move the CMS tokens, responsive shell, login, sidebar, header, theme, save/error feedback, and confirmation dialog into `apps/web` under the existing `/admin` lazy-loaded route.
- Replace token authentication with email/password, hashed credentials, HTTP-only sessions, logout, and expiry handling in `apps/api`/PostgreSQL.

### Phase 2 - Content model and APIs

- Add the required Drizzle tables/fields and migration.
- Seed only verified current public content.
- Add public site-content APIs and authenticated CRUD/reorder APIs.

### Phase 3 - CMS editors and public binding

- Migrate Profile & Homepage, Selected Work, Projects, About, Research & Credentials, Contact, and SEO editors.
- Reuse the current public project rendering for project preview.
- Replace public hardcoded profile/research/contact/gallery content with CMS responses while keeping a development fallback.

### Phase 4 - Persistent media

- Keep URL entry and add persistent object-storage upload behind one media field contract.
- Replace all prototype `blob:` behavior with upload progress, validation, stored URLs, replacement, and safe deletion.

### Phase 5 - Dashboard and operational settings

- Connect analytics, SEO health, performance, backlink, deployment, and notification providers only when selected and configured.
- Until then, keep designed surfaces in explicit unavailable/placeholder states.

### Phase 6 - Verification and release

- Verify authentication, CRUD/reorder, preview parity, upload persistence, publication filtering, sitemap/robots behavior, responsive CMS states, and public regressions.
- Run `pnpm check`, `pnpm test`, and `pnpm build`.
- Validate keyboard flow, reduced motion, mobile layouts, backup/restore, and production environment configuration.

## 14. Release scope

### Migration MVP

- Real single-admin authentication and CMS shell.
- Profile & Homepage, Selected Work, Projects, project preview, About, Research & Credentials, Contact, and SEO editors backed by PostgreSQL.
- Persistent project-media uploads with multi-file selection and immediate draft previews.
- Public pages driven by CMS data.
- Dashboard route with real connection states; metrics appear only when backed by data.
- Site information and password change in Settings.
- Responsive, dark/light, accessible states and production verification.

### Post-MVP

- Connected analytics/backlink dashboards and scheduled reports.
- Deployment-provider controls and notifications.
- Account deletion workflow.
- Draft share links/version history/activity log.
- Contact form if required.
- Multilingual content workflow beyond the basic site-language setting.

## 15. Definition of done

- The production `/admin` matches the approved CMS structure and visual tokens without depending on the standalone Figma Make app.
- Every designed CMS section is present; unavailable integrations are honest and clearly labeled.
- Admin data persists in PostgreSQL/object storage and survives refresh/restart.
- Public profile, selected work, projects, about, research/credentials, contact, media, and SEO render from CMS-managed data.
- Draft/archived/hidden content does not leak publicly.
- Project preview matches the public project detail component across desktop, tablet, mobile, dark, and light modes.
- No hardcoded admin credential, fake public claim, fake analytics, `blob:` media URL, or secret ships to production.
- Relevant checks, tests, and production build pass.
