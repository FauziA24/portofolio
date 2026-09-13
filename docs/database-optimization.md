# Database Optimization Guide

Status: database query/index hardening has been implemented and migrated successfully for production readiness.

This document explains the current PostgreSQL design, existing indexes, query patterns, remaining gaps, and the target state for an optimal production database.

## Current Database Stack

- Database: PostgreSQL
- ORM/migration: Drizzle
- API access: Fastify backend through `apps/api/src/db/index.ts`
- Schema source: `apps/api/src/db/schema.ts`
- Migrations: `apps/api/drizzle`

The current model is intentionally simple and appropriate for a portfolio CMS:

- Public website reads published profile, projects, media, research, and contact data.
- Admin CMS mutates content through protected `/api/admin/*` endpoints.
- Admin sessions are stored in PostgreSQL, so the API can scale across multiple instances without sticky sessions.
- Media files are stored outside PostgreSQL in S3-compatible storage; PostgreSQL only stores metadata and public URLs.

## Tables

### Content Tables

- `Project`
- `Technology`
- `ProjectTechnology`
- `ProjectMedia`
- `MediaAsset`
- `SiteProfile`
- `ProfileFact`
- `ResearchItem`
- `ContactLink`
- `SitePreference`

### Admin Tables

- `AdminUser`
- `AdminSession`

## Existing Indexes

### Project

Existing:

```sql
Project_slug_key ON Project(slug)
Project_public_list_idx ON Project(status, featuredRank, createdAt DESC)
Project_sitemap_idx ON Project(status, isIndexed, sortOrder, title)
```

These already support:

- Project detail lookup by slug.
- Public project and selected work lookup by status, featured rank, and created date.
- Sitemap filtering and ordering by published/indexed state, sort order, and title.

### Technology

Existing:

```sql
Technology_name_key ON Technology(name)
```

This supports safe upsert/reuse of technology names.

### ProjectTechnology

Existing:

```sql
ProjectTechnology_pkey ON ProjectTechnology(projectId, technologyId)
```

This supports project-to-technology relation lookup and prevents duplicate pairs.

### AdminUser

Existing:

```sql
AdminUser_email_key ON AdminUser(email)
```

This supports admin login lookup.

### AdminSession

Existing:

```sql
AdminSession_tokenHash_key ON AdminSession(tokenHash)
AdminSession_adminUserId_idx ON AdminSession(adminUserId)
AdminSession_expiresAt_idx ON AdminSession(expiresAt)
```

These support:

- Fast session lookup by cookie token hash.
- Session revocation by admin user.
- Cleanup of expired sessions.

### Public Ordered Content

Existing:

```sql
ProfileFact_visible_sortOrder_idx ON ProfileFact(isVisible, sortOrder)
ResearchItem_visible_sortOrder_idx ON ResearchItem(isVisible, sortOrder)
ContactLink_visible_sortOrder_idx ON ContactLink(isVisible, sortOrder)
```

These support public listing queries that filter visible rows and sort by configured order.

### Media

Existing:

```sql
MediaAsset_storageKey_key ON MediaAsset(storageKey)
ProjectMedia_project_sortOrder_idx ON ProjectMedia(projectId, sortOrder)
```

These support:

- Unique object storage key.
- Gallery lookup by project and sort order.

### Settings

Existing:

```sql
SitePreference_key_key ON SitePreference(key)
```

This supports upsert and lookup by setting key.

## Query Pattern Review

### Public Homepage

Uses:

- `/api/profile`
- `/api/profile/facts`
- `/api/projects/featured`
- `/api/research`
- `/api/contact-links`

Current index support is good. These tables are small, public reads are cached at HTTP level, and all public queries filter visibility/status server-side.

### Public Project List

Current query:

```ts
where status = 'PUBLISHED'
order by featuredRank asc, createdAt desc
```

Current support:

- `Project(status, featuredRank)` helps.

Gap:

- `createdAt` is not included in the index, so PostgreSQL may still sort within matching rows.

Implemented production index:

```sql
CREATE INDEX "Project_public_list_idx"
ON "Project" ("status", "featuredRank", "createdAt" DESC);
```

### Selected Work

Current query:

```ts
where status = 'PUBLISHED'
and featuredRank is not null
order by featuredRank asc, createdAt desc
limit 5
```

Current support:

- `Project(status, featuredRank, createdAt DESC)` covers this query shape.

Optional later:

```sql
CREATE INDEX IF NOT EXISTS "Project_featured_idx"
ON "Project" ("status", "featuredRank", "createdAt" DESC)
WHERE "featuredRank" IS NOT NULL;
```

Do not add this until the public project table grows significantly. The non-partial public list index above already covers most of this need.

### Project Detail

Current query:

```ts
where slug = ?
and status = 'PUBLISHED'
limit 1
```

Current support:

- `Project_slug_key` is enough because slug is unique.

No additional index needed.

### Sitemap

Current query:

```ts
where status = 'PUBLISHED'
and isIndexed = true
order by sortOrder asc, title asc
```

Current support:

- `Project(status, isIndexed)` helps filtering.

Gap:

- `sortOrder` and `title` are not included in the index, so PostgreSQL may sort after filtering.

Implemented production index:

```sql
CREATE INDEX "Project_sitemap_idx"
ON "Project" ("status", "isIndexed", "sortOrder", "title");
```

### Project Gallery

Current query:

```ts
where projectId = ?
order by sortOrder asc, createdAt asc
```

Current support:

- `ProjectMedia(projectId, sortOrder)` helps.

Optional improvement:

```sql
CREATE INDEX IF NOT EXISTS "ProjectMedia_project_sort_created_idx"
ON "ProjectMedia" ("projectId", "sortOrder", "createdAt");
```

This is optional because galleries are expected to remain small.

### Media Delete Safety Check

Current query:

```ts
where mediaAssetId = ?
limit 1
```

Current support:

- There is a foreign key from `ProjectMedia.mediaAssetId` to `MediaAsset.id`.

Gap:

- PostgreSQL does not automatically create an index for foreign key columns.

Implemented production index:

```sql
CREATE INDEX "ProjectMedia_mediaAssetId_idx"
ON "ProjectMedia" ("mediaAssetId");
```

### Admin Lists

Admin list queries often scan all rows for CMS editing.

This is acceptable because:

- Admin traffic is low.
- Content volume is expected to be small.
- Adding indexes for every admin sort would slow writes without meaningful benefit.

Add admin-specific indexes only if admin pages become slow with real production data.

## Implemented Migration

The optimization migration adds these indexes:

```sql
CREATE INDEX "Project_public_list_idx"
ON "Project" ("status", "featuredRank", "createdAt" DESC);

CREATE INDEX "Project_sitemap_idx"
ON "Project" ("status", "isIndexed", "sortOrder", "title");

CREATE INDEX "ProjectMedia_mediaAssetId_idx"
ON "ProjectMedia" ("mediaAssetId");
```

These are the highest-value indexes because they match real public or operational queries.

Migration status:

- Migration generated with `pnpm db:generate`.
- Migration applied successfully with `pnpm db:migrate`.
- Redundant `Project(status, featuredRank)` and `Project(status, isIndexed)` indexes were removed after the wider production indexes replaced them.

## Pool And Connection Management

Current pool:

```ts
new Pool({ connectionString: config.DATABASE_URL, max: config.DATABASE_POOL_MAX })
```

The pool max is explicit so multiple API instances do not silently exceed the database connection limit.

Implemented configurable pool limit:

```env
DATABASE_POOL_MAX=5
```

Target behavior:

- Small deployment: `DATABASE_POOL_MAX=5`
- Multiple API instances: keep the value low per instance so total connections stay under the database plan limit.
- Example: 3 API instances x pool max 5 = up to 15 database connections.

Current code:

```ts
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: config.DATABASE_POOL_MAX
});
```

## Query Safety Rules

Public queries must always filter server-side:

- `Project.status = 'PUBLISHED'`
- hidden content excluded by `isVisible = true`
- sitemap excludes `isIndexed = false`
- project detail excludes draft and archived projects

Admin queries may return all content, but only behind `/api/admin/*` auth guard.

## Cost Control

Database cost stays low when:

- Public reads are cached by HTTP/CDN.
- Media files are served from object storage/CDN, not from PostgreSQL or API streaming.
- API pool size is limited per instance.
- Public list/detail queries use indexes matching their filters and order.
- Heavy analytics are not stored in the same operational database unless needed.

## Monitoring Targets

After deployment, monitor:

- Active database connections.
- Slow queries.
- CPU spikes during public traffic.
- API p95 latency for:
  - `/api/projects`
  - `/api/projects/featured`
  - `/api/projects/:slug`
  - `/api/projects/:slug/media`
  - `/sitemap.xml`
- Failed login attempts.
- Expired admin session cleanup volume.

## Definition Of Optimal

The database is optimal for this project when:

- All public read queries use indexes that match their main filter and order pattern.
- Admin sessions remain PostgreSQL-backed.
- Connection pool max is explicit and sized for the hosting plan.
- Public API responses are cacheable.
- Admin API responses are never cached.
- Media bandwidth does not touch PostgreSQL.
- There are no table scans on high-traffic public endpoints once production data exists.
- `pnpm check`, `pnpm test`, and `pnpm build` pass after every schema or migration change.

## Validation

Run after every database migration:

```bash
pnpm check
pnpm test
pnpm build
```

Latest validation:

- `pnpm check` passed.
- `pnpm test` passed.
- `pnpm build` passed.
- `pnpm db:migrate` applied successfully.
