# Fauzi Portfolio

Portfolio pribadi Mohammad Fauzi Aziz yang menampilkan profil, selected work, riset/sertifikasi, kontak, halaman detail proyek, dan CMS admin untuk mengelola konten tanpa perlu mengubah kode.

Proyek ini berbentuk PNPM monorepo dengan frontend React/Vite dan backend Fastify. Data disimpan di PostgreSQL melalui Drizzle ORM, sedangkan media disimpan di object storage S3-compatible. Untuk deployment production-style, repository ini menyediakan Docker Compose untuk container aplikasi yang memakai PostgreSQL, SeaweedFS S3, dan Nginx eksternal di server.

## Fitur Utama

- Halaman publik portfolio dengan hero, profil, selected projects, riset, kontak, dan detail proyek.
- Visual interaktif berbasis React Three Fiber/Three.js, dengan fallback agar pengalaman tetap ringan.
- CMS admin di `/admin` untuk mengelola profil, facts, proyek, media, research, contact links, featured projects, dan site settings.
- Login admin memakai HttpOnly cookie, database-backed session, dan CSRF token.
- API Fastify dengan Swagger UI di `/docs`.
- Upload media ke storage S3-compatible, termasuk metadata aset dan galeri proyek.
- SEO dasar: sitemap, robots.txt, metadata proyek, canonical URL, dan kontrol indexing.
- Docker Compose siap pakai untuk menjalankan container aplikasi di network server.

## Tech Stack

- Package manager: PNPM 10
- Frontend: React 19, Vite 6, TypeScript, React Router, Tailwind CSS 4, Framer Motion, Lucide React, Three.js, React Three Fiber
- Backend: Node.js, Fastify 5, Zod, Drizzle ORM
- Database: PostgreSQL 16
- Storage: S3-compatible object storage, default Docker memakai SeaweedFS
- Reverse proxy: Nginx
- Testing: Node test runner via `tsx --test`

## Struktur Proyek

```text
.
├── apps/
│   ├── api/                 # Fastify API, Drizzle schema, migrations, tests
│   └── web/                 # React/Vite frontend dan admin UI
├── docs/                    # Catatan produk, arsitektur, roadmap, deployment
├── nginx/                   # Peta route untuk Nginx eksternal
├── scripts/                 # Smoke test, traffic test, static server, visual checks
├── seaweedfs/               # Konfigurasi S3 credentials untuk SeaweedFS
├── docker-compose.yml       # Container API + web static di network eksternal
├── Dockerfile               # Build image API dan web static
├── package.json             # Script root monorepo
└── pnpm-workspace.yaml
```

## Prasyarat

- Node.js 20+ atau 22+
- PNPM 10+
- PostgreSQL, jika menjalankan API lokal tanpa Docker
- S3-compatible storage, jika ingin upload media lokal tanpa Docker
- Docker dan Docker Compose, jika menjalankan aplikasi via container

## Menjalankan Secara Lokal

1. Install dependency.

```bash
pnpm install
```

2. Siapkan environment API.

```bash
cp apps/api/.env.example apps/api/.env
```

3. Edit `apps/api/.env` sesuai koneksi lokal.

```env
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5432/portfolio"
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
S3_PUBLIC_URL="http://localhost:8333/portfolio"
```

4. Jalankan migrasi dan seed data awal.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

5. Jalankan web dan API.

```bash
pnpm dev
```

URL lokal:

- Web publik: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/docs`
- Health check: `http://localhost:3001/health`

Jika API tidak berjalan di `http://localhost:3001`, set `VITE_API_URL` saat menjalankan atau membangun frontend.

## Menjalankan Dengan Docker

Docker Compose hanya menjalankan `api` dan `web`. PostgreSQL, SeaweedFS S3, dan Nginx diasumsikan sudah berjalan di server dan berada di Docker network eksternal yang sama.

```bash
cp .env.docker.example .env
docker network create portfolio_net
docker compose up --build -d
```

URL Docker:

- Web publik: arahkan Nginx ke `portfolio-web:80`
- Admin: `https://domain-anda/admin`
- API: arahkan route `/api/` ke `portfolio-api:3001`
- Swagger UI: arahkan route `/docs/` ke `portfolio-api:3001`
- Health check: arahkan `/health` ke `portfolio-api:3001/health`
- Storage publik: arahkan route `/s3/` ke `seaweedfs:8333`

Saat container API start, command Docker akan menjalankan migrasi database, setup bucket storage, seed data awal, lalu start server.

Untuk production domain, ubah `.env`:

```env
PUBLIC_ORIGIN=https://domain-anda.com
DOCKER_NETWORK=portfolio_net
POSTGRES_HOST=postgres
ADMIN_EMAIL=admin@domain-anda.com
ADMIN_PASSWORD=gunakan-password-kuat
ADMIN_TOKEN=gunakan-token-random-panjang
```

Jika nama service server berbeda, sesuaikan `POSTGRES_HOST`, `S3_ENDPOINT`, dan `DOCKER_NETWORK`. Peta route Nginx tersedia di `nginx/portofolio.json`.

## Script Penting

| Command              | Fungsi                                 |
| -------------------- | -------------------------------------- |
| `pnpm dev`           | Menjalankan web dan API secara paralel |
| `pnpm build`         | Build semua workspace                  |
| `pnpm check`         | Type check semua workspace             |
| `pnpm test`          | Menjalankan test API                   |
| `pnpm test:security` | Menjalankan security smoke test        |
| `pnpm test:traffic`  | Menjalankan traffic test               |
| `pnpm db:generate`   | Generate migration Drizzle             |
| `pnpm db:migrate`    | Apply migration ke PostgreSQL          |
| `pnpm db:seed`       | Seed profil, admin, dan konten awal    |
| `pnpm db:studio`     | Membuka Drizzle Studio                 |
| `pnpm storage:setup` | Membuat/mengecek bucket S3-compatible  |

## Environment Variables

### API

| Variable               | Keterangan                                              |
| ---------------------- | ------------------------------------------------------- |
| `DATABASE_URL`         | URL koneksi PostgreSQL                                  |
| `DATABASE_POOL_MAX`    | Maksimum koneksi pool database                          |
| `PORT`                 | Port API, default `3001`                                |
| `LOG_LEVEL`            | Level log Fastify                                       |
| `TRUST_PROXY`          | Set `true` jika API di belakang reverse proxy tepercaya |
| `API_BODY_LIMIT_BYTES` | Batas ukuran request body, default `6291456`            |
| `CORS_ORIGIN`          | Origin frontend yang diizinkan                          |
| `ADMIN_TOKEN`          | Secret legacy/fallback, minimal 16 karakter             |
| `ADMIN_EMAIL`          | Email login admin                                       |
| `ADMIN_PASSWORD`       | Password login admin; akan di-hash saat seed            |
| `S3_ENDPOINT`          | Endpoint storage S3-compatible                          |
| `S3_REGION`            | Region storage, default `auto`                          |
| `S3_BUCKET`            | Nama bucket media                                       |
| `S3_ACCESS_KEY_ID`     | Access key storage                                      |
| `S3_SECRET_ACCESS_KEY` | Secret key storage                                      |
| `S3_FORCE_PATH_STYLE`  | Umumnya `true` untuk SeaweedFS/MinIO                    |
| `S3_PUBLIC_URL`        | URL publik untuk membaca media                          |

### Web

| Variable       | Keterangan                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL API. Default development: `http://localhost:3001`. Pada Docker build diset kosong agar request memakai origin yang sama melalui Nginx. |

### Docker Root `.env`

| Variable               | Keterangan                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| `PUBLIC_ORIGIN`        | Origin publik yang dipakai CORS, sitemap, dan URL media           |
| `DOCKER_NETWORK`       | Nama Docker network eksternal yang dipakai bersama service server |
| `POSTGRES_HOST`        | Hostname service PostgreSQL di network Docker                     |
| `POSTGRES_DB`          | Nama database                                                     |
| `POSTGRES_USER`        | User PostgreSQL                                                   |
| `POSTGRES_PASSWORD`    | Password PostgreSQL                                               |
| `ADMIN_EMAIL`          | Email admin seed                                                  |
| `ADMIN_PASSWORD`       | Password admin seed                                               |
| `ADMIN_TOKEN`          | Secret admin fallback                                             |
| `S3_BUCKET`            | Bucket media                                                      |
| `S3_ACCESS_KEY_ID`     | Access key SeaweedFS/S3                                           |
| `S3_SECRET_ACCESS_KEY` | Secret key SeaweedFS/S3                                           |
| `S3_ENDPOINT`          | Endpoint S3 internal, misalnya `http://seaweedfs:8333`            |

## API dan Endpoint

Dokumentasi interaktif tersedia di Swagger UI:

- Local dev: `http://localhost:3001/docs`
- Docker/Nginx: `http://localhost/docs`

Endpoint sistem:

- `GET /health`
- `GET /health/storage`
- `GET /sitemap.xml`
- `GET /robots.txt`

Endpoint publik berada di prefix `/api`, termasuk:

- `GET /api/site`
- `GET /api/profile`
- `GET /api/profile/facts`
- `GET /api/projects`
- `GET /api/projects/featured`
- `GET /api/projects/:slug`
- `GET /api/projects/:slug/media`
- `GET /api/research`
- `GET /api/contact-links`

Endpoint admin berada di `/api/admin/*` dan membutuhkan login admin. Mutasi admin memakai session cookie `portfolio_admin` dan header `x-csrf-token`.

## Model Data Utama

Database berisi tabel utama berikut:

- `Project`: data proyek, status publikasi, SEO, demo URL, GitHub URL, featured rank, dan ordering.
- `Technology` dan `ProjectTechnology`: tag teknologi proyek.
- `ProjectMedia`: galeri media per proyek.
- `MediaAsset`: metadata file yang diupload ke object storage.
- `SiteProfile`: konten profil utama, hero, about, footer, SEO, dan indexing.
- `ProfileFact`: fakta singkat di bagian about/profile.
- `ResearchItem`: publikasi, paper, sertifikasi, edukasi, atau credential.
- `ContactLink`: link kontak yang tampil di halaman publik.
- `AdminUser` dan `AdminSession`: akun admin dan session login.
- `SitePreference`: pengaturan situs berbasis key-value.

## Workflow Konten

1. Set `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.
2. Jalankan `pnpm db:seed`.
3. Buka `/admin`.
4. Login memakai email dan password admin.
5. Kelola profil, facts, research, contact links, proyek, media, dan selected work.
6. Pastikan proyek yang ingin tampil publik memiliki status `PUBLISHED`.

Untuk proyek yang belum punya demo publik, gunakan status demo `COMING_SOON`, `PRIVATE`, atau `ARCHIVED` agar klaim di portfolio tetap akurat.

## Testing dan Quality Check

Sebelum deploy, jalankan:

```bash
pnpm check
pnpm test
pnpm build
```

Opsional untuk validasi tambahan:

```bash
pnpm test:security
pnpm test:traffic
```

Checklist production detail tersedia di `docs/production-readiness.md`.

## Deployment Notes

- Gunakan HTTPS di production.
- Ganti semua secret default sebelum deploy.
- Set `PUBLIC_ORIGIN` ke domain final.
- Set `TRUST_PROXY=true` hanya saat API berada di belakang reverse proxy/load balancer tepercaya.
- Sajikan media dari object storage/CDN melalui `S3_PUBLIC_URL`.
- Frontend dapat dihosting sebagai static build dari `apps/web/dist`.
- API Fastify lebih cocok dijalankan sebagai service long-running daripada serverless function jika upload media atau traffic meningkat.
- Untuk Cloudflare Tunnel/Nginx yang berjalan di Docker network yang sama, arahkan ke `portfolio-web:80`, `portfolio-api:3001`, dan `seaweedfs:8333` sesuai `nginx/portofolio.json`.

## Dokumentasi Tambahan

- `docs/project-context.md`: konteks produk, audiens, dan prinsip konten.
- `docs/architecture-design.md`: catatan arsitektur.
- `docs/roadmap.md`: fase implementasi.
- `docs/production-readiness.md`: checklist production.
- `docs/security-traffic-test-report.md`: hasil security dan traffic test.
- `docs/database-optimization.md`: catatan optimasi database.

## Catatan Keamanan

- Jangan commit file `.env`.
- Gunakan password admin yang kuat dan token random panjang.
- Admin route sudah memakai HttpOnly cookie dan CSRF token.
- Upload media dibatasi untuk image yang tervalidasi.
- Security headers dipasang di API.
- Jika menjalankan multi-instance API, pindahkan counter rate limit login gagal dari memory ke PostgreSQL atau Redis.
