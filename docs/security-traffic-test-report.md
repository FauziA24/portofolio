# Security And Traffic Test Report

Status: local production-build smoke and stress tests passed.

Date: 2026-09-11

## Test Setup

- API base: `http://127.0.0.1:3001`
- Web base: `http://127.0.0.1:4173`
- API server: existing local API process on port `3001`
- Web server: production `apps/web/dist` served by `scripts/static-server.mjs`
- Security test command: `pnpm test:security`
- Traffic test command: `pnpm test:traffic`

## Added Test Tools

### Security Smoke Test

File:

```text
scripts/security-smoke.mjs
```

Checks:

- `/health` returns `status`, `requestId`, and `uptimeSeconds`.
- Public API responses include CDN cache and security headers.
- `/api/admin/projects` rejects unauthenticated access with `401`.
- Admin API responses include `Cache-Control: no-store`.
- Mutating admin endpoints reject unauthenticated requests.
- Repeated failed admin login attempts are rate limited.
- `/sitemap.xml` and `/robots.txt` are reachable and cacheable.

Result:

```json
{
  "status": "passed",
  "checks": [
    "health endpoint is alive and traceable",
    "public API has cache and security headers",
    "admin API blocks unauthenticated access and disables cache",
    "mutating admin endpoint requires auth",
    "login rate limit blocks repeated failures",
    "sitemap and robots are cacheable"
  ]
}
```

### Traffic Test

File:

```text
scripts/traffic-test.mjs
```

Default:

```text
TRAFFIC_TOTAL=500
TRAFFIC_CONCURRENCY=50
TRAFFIC_TIMEOUT_MS=5000
```

Targets:

- `/health`
- `/api/profile`
- `/api/profile/facts`
- `/api/projects`
- `/api/projects/featured`
- `/api/research`
- `/api/contact-links`
- `/sitemap.xml`
- `/robots.txt`
- `/`
- `/projects`

## Traffic Results

### Baseline Load

Command:

```bash
pnpm test:traffic
```

Result:

```json
{
  "status": "passed",
  "total": 500,
  "concurrency": 50,
  "requestsPerSecond": 408.04,
  "failures": 0,
  "latencyMs": {
    "p50": 98,
    "p95": 276,
    "p99": 407,
    "max": 439
  }
}
```

### Higher Load

Command:

```bash
TRAFFIC_TOTAL=2000 TRAFFIC_CONCURRENCY=100 pnpm test:traffic
```

Result:

```json
{
  "status": "passed",
  "total": 2000,
  "concurrency": 100,
  "requestsPerSecond": 614.07,
  "failures": 0,
  "latencyMs": {
    "p50": 137,
    "p95": 416,
    "p99": 461,
    "max": 650
  }
}
```

### Stress Load

Command:

```bash
TRAFFIC_TOTAL=5000 TRAFFIC_CONCURRENCY=200 pnpm test:traffic
```

Result:

```json
{
  "status": "passed",
  "total": 5000,
  "concurrency": 200,
  "requestsPerSecond": 706.2,
  "failures": 0,
  "latencyMs": {
    "p50": 248,
    "p95": 751,
    "p99": 823,
    "max": 903
  }
}
```

## Observed Bottleneck

The slowest endpoints during local stress were:

- `/sitemap.xml`
- `/robots.txt`

Both still passed, but their p95 was higher than the main public API endpoints because they touch database-backed settings/profile data on every request.

Production impact is controlled by:

- `Cache-Control: public, max-age=60, stale-while-revalidate=300`
- CDN caching in front of the API
- Project sitemap index optimization

## Interpretation

The app passed local smoke and stress testing with:

- 0 failed requests
- all tested endpoints returning expected status
- security headers active
- admin routes protected
- login rate limit active
- production frontend build served successfully

This does not replace a full production load test because local results depend on the developer machine, local database, and local network path. Before final public launch, rerun the same scripts against staging with production-like PostgreSQL and object storage.

## How To Re-run

Start API:

```bash
pnpm --filter @portfolio/api start
```

Build and serve web:

```bash
pnpm build
node scripts/static-server.mjs apps/web/dist 4173
```

Run security test:

```bash
API_BASE=http://127.0.0.1:3001 pnpm test:security
```

Run traffic test:

```bash
API_BASE=http://127.0.0.1:3001 WEB_BASE=http://127.0.0.1:4173 TRAFFIC_TOTAL=5000 TRAFFIC_CONCURRENCY=200 pnpm test:traffic
```

For staging/production, replace `API_BASE` and `WEB_BASE` with real URLs.
