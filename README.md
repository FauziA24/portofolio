# Fauzi Portfolio

Personal portfolio for Mohammad Fauzi Aziz, with a public website, project detail pages, research and credential sections, contact links, and a private CMS for managing content without editing code.

This is a PNPM monorepo with a React/Vite frontend and a Fastify API. Data is stored in PostgreSQL through Drizzle ORM, while uploaded media is stored in S3-compatible object storage. The production Docker setup runs the portfolio API and web containers, then connects them to existing PostgreSQL, SeaweedFS S3, and Nginx services on the server.

## Features

- Public portfolio pages for profile, selected work, research, contact, and project details.
- Interactive visuals built with React Three Fiber/Three.js, with fallback behavior for lighter devices.
- Admin CMS at `/admin` for profile, facts, projects, media, research, contact links, featured projects, and site settings.
- Admin login with HttpOnly cookies, database-backed sessions, and CSRF tokens.
- Fastify API with Swagger UI at `/docs`.
- S3-compatible media uploads with asset metadata and project galleries.
- Basic SEO support: sitemap, robots.txt, project metadata, canonical URLs, and indexing controls.
- Docker Compose setup for running the API and web containers inside the server's existing Docker networks.

## Tech Stack

- Package manager: PNPM 10
- Frontend: React 19, Vite 6, TypeScript, React Router, Tailwind CSS 4, Framer Motion, Lucide React, Three.js, React Three Fiber
- Backend: Node.js, Fastify 5, Zod, Drizzle ORM
- Database: PostgreSQL 16
- Storage: S3-compatible object storage, usually SeaweedFS on the server
- Reverse proxy: existing Nginx service on the server
- Testing: Node test runner via `tsx --test`

## Project Structure

```text
.
|-- apps/
|   |-- api/                 # Fastify API, Drizzle schema, migrations, tests
|   `-- web/                 # React/Vite frontend and admin UI
|-- docs/                    # Product, architecture, roadmap, and deployment notes
|-- scripts/                 # Smoke tests, traffic tests, static server, visual checks
|-- docker-compose.yml       # API and web containers attached to external server networks
|-- Dockerfile               # API and web image builds
|-- package.json             # Root monorepo scripts
`-- pnpm-workspace.yaml
```

## Requirements

- Node.js 20+ or 22+
- PNPM 10+
- PostgreSQL for local API development
- S3-compatible storage for local media upload testing
- Docker and Docker Compose for server deployment

## Local Development

1. Install dependencies.

```bash
pnpm install
```

2. Prepare the API environment file.

```bash
cp apps/api/.env.example apps/api/.env
```

3. Edit `apps/api/.env` for your local services.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
DATABASE_POOL_MAX=5
PORT=3001
LOG_LEVEL="info"
TRUST_PROXY="false"
API_BODY_LIMIT_BYTES=6291456
CORS_ORIGIN="http://localhost:5173"

ADMIN_TOKEN="replace-with-a-long-random-token"
ADMIN_EMAIL="admin@portfolio.local"
ADMIN_PASSWORD="replace-with-a-strong-password"

S3_ENDPOINT="http://localhost:8333"
S3_REGION="auto"
S3_BUCKET="portfolio"
S3_ACCESS_KEY_ID="replace-with-s3-access-key"
S3_SECRET_ACCESS_KEY="replace-with-s3-secret-key"
S3_FORCE_PATH_STYLE="true"
S3_PUBLIC_URL="http://localhost:8888/buckets/portfolio"
```

4. Run migrations and seed initial content.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

5. Start the web app and API.

```bash
pnpm dev
```

Local URLs:

- Public web: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/docs`
- Health check: `http://localhost:3001/health`

Set `VITE_API_URL` if the API does not run at `http://localhost:3001`.

## Docker Deployment

Docker Compose runs `api` and `web` from published Docker images. PostgreSQL, SeaweedFS S3, and the public Nginx reverse proxy are expected to already exist on the server.

The containers join these external Docker networks:

- `service_service_network`: service network for Nginx and SeaweedFS.
- `database_database_network`: database network for PostgreSQL.
- `project_network`: shared network for server projects.

Build and push the images from your development machine:

```bash
docker build --target app -t fauzia24/portofolio-api:v1.0.0 .
docker build --target web -t fauzia24/portofolio-web:v1.0.0 .
docker push fauzia24/portofolio-api:v1.0.0
docker push fauzia24/portofolio-web:v1.0.0
```

Prepare the server environment:

```bash
cp .env.docker.example .env
```

Example production `.env`:

```env
PUBLIC_ORIGIN=https://portofolio.jikss.my.id

DATABASE_URL=postgresql://postgres:postgres@postgresql:5432/portofolio
DATABASE_POOL_MAX=5

ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_TOKEN=replace-with-a-long-random-token

S3_ENDPOINT=http://seaweed-s3:8333
S3_BUCKET=portfolio
S3_ACCESS_KEY_ID=replace-with-s3-access-key
S3_SECRET_ACCESS_KEY=replace-with-s3-secret-key
```

Start the containers on the server:

```bash
docker compose pull
docker compose up -d
```

Nginx should reverse proxy to the containers:

- `/` to `http://portfolio-web:80`
- `/api/` to `http://portfolio-api:3001`
- `/docs/` to `http://portfolio-api:3001`
- `/health` to `http://portfolio-api:3001/health`
- `/health/storage` to `http://portfolio-api:3001/health/storage`
- `/sitemap.xml` to `http://portfolio-api:3001/sitemap.xml`
- `/robots.txt` to `http://portfolio-api:3001/robots.txt`
- `/s3/` to the SeaweedFS filer path `http://seaweed-filer:8888/buckets/`

If the server uses different container names, update `DATABASE_URL` and `S3_ENDPOINT`. Nginx can reach the app as `portfolio-web` and `portfolio-api` because Docker Compose assigns those aliases on `service_service_network`.

When the API container starts, it runs database migrations, checks or creates the storage bucket, seeds initial data, and then starts the server. The web container serves the built frontend through Nginx.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the web app and API in parallel |
| `pnpm build` | Build all workspaces |
| `pnpm check` | Type-check all workspaces |
| `pnpm test` | Run API tests |
| `pnpm test:security` | Run the security smoke test |
| `pnpm test:traffic` | Run the traffic test |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations to PostgreSQL |
| `pnpm db:seed` | Seed profile, admin user, and initial content |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm storage:setup` | Create or check the S3-compatible bucket |

## Environment Variables

### API

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL |
| `DATABASE_POOL_MAX` | Maximum database pool connections |
| `PORT` | API port, defaults to `3001` |
| `LOG_LEVEL` | Fastify log level |
| `TRUST_PROXY` | Set to `true` when the API is behind a trusted reverse proxy |
| `API_BODY_LIMIT_BYTES` | Request body size limit, defaults to `6291456` |
| `CORS_ORIGIN` | Allowed frontend origin |
| `ADMIN_TOKEN` | Legacy/fallback admin secret, minimum 16 characters |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password; hashed during seed |
| `S3_ENDPOINT` | S3-compatible storage endpoint |
| `S3_REGION` | Storage region, defaults to `auto` |
| `S3_BUCKET` | Media bucket name |
| `S3_ACCESS_KEY_ID` | Storage access key |
| `S3_SECRET_ACCESS_KEY` | Storage secret key |
| `S3_FORCE_PATH_STYLE` | Usually `true` for SeaweedFS or MinIO |
| `S3_PUBLIC_URL` | Public URL for reading media |

### Web

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API base URL. Development default: `http://localhost:3001`. Leave empty for same-origin production behind Nginx. |

### Docker Root `.env`

| Variable | Description |
| --- | --- |
| `PUBLIC_ORIGIN` | Public origin used by CORS, sitemap, and media URLs |
| `DATABASE_URL` | PostgreSQL connection URL used by the API container |
| `DATABASE_POOL_MAX` | Maximum database pool connections |
| `ADMIN_EMAIL` | Admin seed email |
| `ADMIN_PASSWORD` | Admin seed password |
| `ADMIN_TOKEN` | Fallback admin secret |
| `S3_ENDPOINT` | Internal S3 endpoint, for example `http://seaweed-s3:8333` |
| `S3_BUCKET` | Media bucket |
| `S3_ACCESS_KEY_ID` | SeaweedFS/S3 access key |
| `S3_SECRET_ACCESS_KEY` | SeaweedFS/S3 secret key |

## API and Endpoints

Interactive API documentation is available in Swagger UI:

- Local development: `http://localhost:3001/docs`
- Docker/Nginx: `https://your-domain.com/docs`

System endpoints:

- `GET /health`
- `GET /health/storage`
- `GET /sitemap.xml`
- `GET /robots.txt`

Public endpoints use the `/api` prefix, including:

- `GET /api/site`
- `GET /api/profile`
- `GET /api/profile/facts`
- `GET /api/projects`
- `GET /api/projects/featured`
- `GET /api/projects/:slug`
- `GET /api/projects/:slug/media`
- `GET /api/research`
- `GET /api/contact-links`

Admin endpoints live under `/api/admin/*` and require admin login. Admin mutations use the `portfolio_admin` session cookie and the `x-csrf-token` header.

## Data Model

The database includes these main tables:

- `Project`: project data, publication status, SEO, demo URL, GitHub URL, featured rank, and ordering.
- `Technology` and `ProjectTechnology`: project technology tags.
- `ProjectMedia`: project gallery media.
- `MediaAsset`: metadata for uploaded object-storage files.
- `SiteProfile`: main profile content, hero, about, footer, SEO, and indexing.
- `ProfileFact`: short facts shown in the profile/about section.
- `ResearchItem`: publications, papers, certifications, education, or credentials.
- `ContactLink`: public contact links.
- `AdminUser` and `AdminSession`: admin users and login sessions.
- `SitePreference`: key-value site settings.

## Content Workflow

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
2. Run `pnpm db:seed`.
3. Open `/admin`.
4. Log in with the admin email and password.
5. Manage profile, facts, research, contact links, projects, media, and selected work.
6. Ensure public projects use the `PUBLISHED` status.

For projects without a public demo, use `COMING_SOON`, `PRIVATE`, or `ARCHIVED` so the portfolio stays accurate.

## Testing and Quality Checks

Before deployment, run:

```bash
pnpm check
pnpm test
pnpm build
```

Optional extra checks:

```bash
pnpm test:security
pnpm test:traffic
```

The detailed production checklist is available in `docs/production-readiness.md`.

## Deployment Notes

- Use HTTPS in production.
- Replace all default secrets before deployment.
- Set `PUBLIC_ORIGIN` to the final domain.
- Set `TRUST_PROXY=true` only when the API is behind a trusted reverse proxy or load balancer.
- Serve media from object storage or a CDN through `S3_PUBLIC_URL`.
- Serve the frontend through the `portfolio-web` container.
- Fastify should run as a long-running service rather than a serverless function if uploads or traffic increase.
- If Nginx runs in Docker, it must share `service_service_network` with `portfolio-web` and `portfolio-api`.

## Additional Documentation

- `docs/project-context.md`: product context, audience, and content principles.
- `docs/architecture-design.md`: architecture notes.
- `docs/roadmap.md`: implementation phases.
- `docs/production-readiness.md`: production checklist.
- `docs/security-traffic-test-report.md`: security and traffic test results.
- `docs/database-optimization.md`: database optimization notes.

## Security Notes

- Do not commit `.env` files.
- Use a strong admin password and a long random token.
- Admin routes use HttpOnly cookies and CSRF tokens.
- Media uploads are limited to validated images.
- Security headers are applied by the API.
- If running multiple API instances, move the failed-login rate-limit counter from memory to PostgreSQL or Redis.
