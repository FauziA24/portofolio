# Roadmap - Portfolio Delivery

Status: execution roadmap after Drizzle, Swagger, PostgreSQL, and MinIO/S3-compatible storage setup.

This roadmap is the step-by-step order for finishing the CMS integration and deployment without reshaping the plan at each stage. Work should move forward one phase at a time; each phase leaves the codebase runnable before the next begins.

## Phase 1 - Complete Database Schema

Add the remaining Drizzle tables and fields required by the CMS:

- `AdminUser`
- `AdminSession`
- `SiteProfile`
- `ProfileFact`
- `ContactLink`
- `ResearchItem`
- `MediaAsset`
- `ProjectMedia`
- `SitePreference`

Use the existing `Project.featuredRank` for Selected Work. Do not add a separate selected-work table unless the project later needs scheduling, audience targeting, or multiple curated lists.

After schema changes, run:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Outcome: the database can store all CMS content, admin sessions, media metadata, project gallery items, and site preferences.

## Phase 2 - Strengthen Admin Authentication

Replace environment/token-based admin access with database-backed authentication:

- Store the admin account in `AdminUser`.
- Hash passwords with Argon2 or bcrypt.
- Create random sessions in `AdminSession`.
- Store the session token in an `HttpOnly`, `Secure`, `SameSite` cookie.
- Support expiration, logout, and session revoke.
- Add login rate limiting.
- Add CSRF protection for admin mutations that rely on cookie auth.

Endpoints:

```text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
DELETE /api/admin/sessions/:id
```

Outcome: all admin routes use real session validation and no production workflow depends on a hardcoded admin token.

## Phase 3 - Implement Profile And Homepage Content

Create APIs for homepage identity, headline, biography, CTAs, portrait, and footer content:

```text
GET /api/profile
GET /api/admin/profile
PUT /api/admin/profile
```

Then replace hardcoded homepage content with API-backed data while keeping a small development fallback.

Outcome: hero, about copy, CTA labels/links, portrait reference, and footer identity can be edited from persistent data.

## Phase 4 - Implement About And Profile Facts

Create profile fact APIs:

```text
GET    /api/profile/facts
GET    /api/admin/profile/facts
POST   /api/admin/profile/facts
PUT    /api/admin/profile/facts/:id
DELETE /api/admin/profile/facts/:id
PATCH  /api/admin/profile/facts/reorder
```

Use Drizzle transactions when changing fact order so duplicate or partial ordering cannot leak into public rendering.

Outcome: university, degree, location, languages, and additional about facts can be added, hidden, reordered, edited, and deleted.

## Phase 5 - Implement Selected Work

Keep Selected Work on the existing `Project.featuredRank` field.

Endpoints:

```text
GET   /api/projects/featured
PATCH /api/admin/projects/featured
```

Validation:

- Maximum of five featured projects.
- No duplicate rank.
- Only `PUBLISHED` projects appear publicly.

Outcome: the homepage work list is curated from the CMS without adding unnecessary data model complexity.

## Phase 6 - Implement Research And Credentials

Use `ResearchItem` for publications, papers, certifications, education, and credentials.

Endpoints:

```text
GET    /api/research
GET    /api/admin/research
POST   /api/admin/research
PUT    /api/admin/research/:id
DELETE /api/admin/research/:id
PATCH  /api/admin/research/reorder
```

Outcome: verified research and credential entries are manageable from the CMS and ordered consistently on the public site.

## Phase 7 - Implement Contact Links

Create contact link APIs:

```text
GET    /api/contact-links
GET    /api/admin/contact-links
POST   /api/admin/contact-links
PUT    /api/admin/contact-links/:id
DELETE /api/admin/contact-links/:id
PATCH  /api/admin/contact-links/reorder
```

Allow only one primary contact link through a transaction or database constraint.

Outcome: email, phone, LinkedIn, GitHub, and additional contact methods are persistent, ordered, visible/hidden, and safe to render.

## Phase 8 - Implement MinIO Uploads

Use the existing S3-compatible client in `apps/api/src/storage.ts`.

Upload flow:

1. Admin uploads an image.
2. API validates MIME type, size, and dimensions.
3. API creates a unique storage key.
4. File is stored in the `portfolio` bucket.
5. Metadata is stored in `MediaAsset`.
6. API returns the permanent public URL.
7. Delete checks that the asset is not still referenced.

Endpoints:

```text
POST   /api/admin/media
GET    /api/admin/media
DELETE /api/admin/media/:id
```

Suggested key format:

```text
projects/{projectId}/{uuid}.webp
profile/{uuid}.webp
research/{uuid}.webp
```

Store `storageKey`, not the MinIO WebUI URL. Generate the public URL from `S3_PUBLIC_URL`.

Outcome: CMS uploads survive reloads and can later move to Cloudflare R2 by changing environment variables.

Status: implemented with `/api/admin/media`, persisted `MediaAsset` rows, S3-compatible object writes/deletes, public URL derivation from `S3_PUBLIC_URL`, image MIME/size/dimension validation, and focused upload helper tests.

## Phase 9 - Add Project Gallery

Use `ProjectMedia` for repeatable project media.

Endpoints:

```text
GET    /api/projects/:slug/media
POST   /api/admin/projects/:id/media
PUT    /api/admin/projects/:id/media/:mediaId
DELETE /api/admin/projects/:id/media/:mediaId
PATCH  /api/admin/projects/:id/media/reorder
```

Store alt text, caption, position, media kind, and highlight status.

Outcome: project detail pages no longer depend on hardcoded galleries.

Status: implemented with public/admin `ProjectMedia` endpoints, CMS gallery controls, media ordering, alt/caption/kind/highlight fields, and `ProjectDetail.tsx` reading gallery data from the API.

## Phase 10 - Implement SEO And Settings

Create site/settings APIs:

```text
GET /api/site
GET /api/admin/settings
PUT /api/admin/settings
```

Generate:

```text
GET /sitemap.xml
GET /robots.txt
```

Add per-project SEO title, description, canonical URL, indexing toggle, and OG image.

Outcome: global and project metadata are managed by CMS data, and search engines only see public/indexed content.

Status: implemented with `/api/site`, admin settings persistence, per-project SEO fields in API/CMS payloads, generated `/sitemap.xml`, and generated `/robots.txt` using only published indexed projects.

## Phase 11 - Connect All CMS Pages

Replace every `Persistence pending` CMS area in this order:

1. Profile & Homepage
2. Selected Work
3. About
4. Research
5. Contact
6. SEO
7. Settings
8. Media upload

Every form must expose these states:

```text
loading -> saving -> saved
                 -> error
```

Outcome: the admin UI edits the real API-backed content groups instead of local or mock state.

Status: implemented for Profile & Homepage, Selected Work, About, Research, Contact, SEO, Settings, and project Media upload/gallery areas.

## Phase 12 - Complete Swagger Coverage

Every new endpoint must document:

- Request body.
- Path and query parameters.
- Response schema.
- Status `400`, `401`, `404`, `409`, and `500`.
- Admin security scheme.
- Example request and response.

Verify through:

```text
http://localhost:3001/docs
http://localhost:3001/docs/json
```

Outcome: the API contract stays visible and testable while the CMS grows.

Status: implemented for the new media, project gallery, site/settings, sitemap, robots, project SEO, auth, and CRUD endpoints through Fastify Swagger schemas and admin security metadata.

## Phase 13 - Add Tests

Minimum coverage:

```text
auth
authorization
profile CRUD
project CRUD
reordering
publication filtering
upload validation
storage deletion
foreign-key cascade
duplicate slug
Swagger endpoint coverage
```

Run:

```bash
pnpm check
pnpm test
pnpm build
```

Status: implemented with focused tests for auth, project validation, SEO/indexing input, media validation, image dimensions, and public media URL generation. Current verification commands pass: `pnpm check`, `pnpm test`, and `pnpm build`.

Outcome: the release candidate has automated coverage for the risky paths.

## Phase 14 - Move From MinIO To Cloudflare R2

For deployment, change environment values only:

```env
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=portfolio-production
S3_ACCESS_KEY_ID=<R2_ACCESS_KEY>
S3_SECRET_ACCESS_KEY=<R2_SECRET_KEY>
S3_FORCE_PATH_STYLE=false
S3_PUBLIC_URL=https://media.domain-anda.com
```

Deployment checklist:

1. Create the R2 bucket.
2. Create a bucket-scoped API token.
3. Configure the custom media domain.
4. Configure bucket CORS.
5. Migrate MinIO objects if local objects already exist.
6. Run `/health/storage`.
7. Test upload, download, and delete.

Outcome: production media uses R2/CDN-compatible URLs without changing application storage code.

## Recommended Working Order

Start with:

```text
database schema -> authentication -> profile/homepage -> media upload -> remaining CMS features -> R2 deployment
```

The immediate next implementation step is Phase 1: complete the database schema.
