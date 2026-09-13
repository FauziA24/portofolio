# Production Readiness Checklist

Use this checklist before deployment and after every major refactor.

## Runtime

- Run `pnpm check`, `pnpm test`, and `pnpm build` before deploy.
- Set `LOG_LEVEL=info` in production.
- Set `TRUST_PROXY=true` only when the API runs behind a trusted reverse proxy or load balancer.
- Keep `API_BODY_LIMIT_BYTES` small enough for image upload needs. Current default is `6291456`.
- Use PostgreSQL-backed admin sessions; no sticky load balancer session is required.

## Vercel And Cost Control

- Prefer static frontend hosting/CDN for `apps/web/dist`.
- Keep the Fastify API outside serverless functions when traffic may grow or upload traffic is frequent.
- Serve media from `S3_PUBLIC_URL` through R2/S3-compatible CDN, not through the API.
- Keep admin pages lazy-loaded so visitors do not download CMS code.
- Keep 3D scene dependencies in the isolated `scene-vendor` chunk so CDN caching absorbs repeat traffic.
- Load the 3D scene only after the initial hero render, only on desktop-width screens, and skip it for reduced-motion or data-saver users.

## Cache And CDN

- Public API GET responses use `Cache-Control: public, max-age=60, stale-while-revalidate=300`.
- `/sitemap.xml` and `/robots.txt` use the same public cache policy.
- `/api/admin/*` uses `Cache-Control: no-store`.
- Static build assets should be served with immutable long-term CDN cache headers.

## Observability

- Every request gets a Fastify `requestId`.
- `/health` returns `status`, `requestId`, and `uptimeSeconds`.
- Unexpected errors are logged server-side and return `{ "message": "Internal server error" }`.
- Validation errors return `{ "message": "Invalid request", "issues": ... }`.
- Add external log shipping at deployment level when the host is chosen.

## Security

- Admin auth uses HttpOnly session cookie plus CSRF header.
- Login has rate limiting for repeated failed attempts.
- Admin routes are protected centrally for every `/api/admin/*` path except `/api/admin/login`.
- Media upload accepts only JPEG, PNG, and WebP and validates image metadata.
- Security headers include `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
- Keep secrets only in environment variables. Never commit `.env`.

## Scale Notes

- Single API instance can use the current in-memory failed-login rate limit.
- Multi-instance API should move failed-login counters to PostgreSQL or Redis.
- Database-backed sessions are already safe for multiple API instances.
- Object storage/CDN should absorb media bandwidth; API should only handle metadata and signed writes if later needed.
- Database optimization details live in `docs/database-optimization.md`; production query/index hardening migration has been applied successfully in the configured database.
- Security and traffic test results live in `docs/security-traffic-test-report.md`.
