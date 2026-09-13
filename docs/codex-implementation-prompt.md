# Prompt untuk Codex - Implementasi Portfolio dari Figma

Salin prompt berikut ke Codex. Jalankan dari folder proyek `D:\Projek\Website\portofoliov2`.

```text
Implementasikan website portfolio produksi dari desain Figma ini ke folder kerja saat ini:
https://www.figma.com/make/RSlYhJybO3LaA9Gt9YYaRF/Interactive-Minimalist-Portfolio-Website?t=Jp1WFJDJA3hbLye6-1

Tujuan
Bangun portfolio Mohammad Fauzi Aziz yang minimalis, compact, sangat responsif, dan interaktif. Visual Figma adalah sumber kebenaran untuk layout, spacing, typography, breakpoint, warna, dan states. Jangan meng-copy output Figma mentah; adaptasikan menjadi komponen React yang terawat.

Langkah awal wajib
1. Baca struktur repository, file konfigurasi, dan dependensi yang sudah ada sebelum mengubah apa pun. Pertahankan perubahan pengguna yang tidak terkait.
2. Ambil design context dari Figma untuk node/section target sebelum menulis UI. Tautan di atas tidak mempunyai `node-id`; bila tool Figma tidak dapat mengakses context desain, berhenti dan minta saya mengirim tautan Figma yang memuat `node-id` untuk halaman/section yang dipilih. Jangan menebak desain dari screenshot.
3. Tinjau dokumen berikut sebagai product constraints, lalu selaraskan implementasi dengannya:
   - `docs/project-context.md`
   - `docs/prd.md`
   - `docs/roadmap.md`
   - `docs/technical-plan.md`
4. Setelah memahami scope, tulis rencana singkat dan mulai implementasi. Jangan menunggu persetujuan untuk pekerjaan yang sudah jelas.

Stack dan batasan
- Frontend: React + TypeScript + Vite, React Router, Tailwind CSS.
- Motion: Framer Motion untuk transition komponen dan route. Gunakan GSAP hanya bila satu sequence scroll benar-benar membutuhkan pinning/timeline; jangan menambahkan GSAP jika Framer Motion cukup.
- 3D: React Three Fiber + Three.js hanya untuk hero scene. Lazy-load scene, pause saat tidak terlihat, jangan render di perangkat reduced-motion, dan sediakan fallback CSS/static. Scene adalah atmosfer, bukan konten utama atau hambatan navigasi.
- Backend: Node.js + Fastify + TypeScript, REST API, PostgreSQL, dan Drizzle untuk schema/migration. Gunakan validasi request server-side.
- Gunakan pnpm jika proyek belum menentukan package manager lain.
- Jangan memasang library UI besar, state manager global, CMS, repository abstraction generik, event bus, microservice, atau pola enterprise yang tidak diperlukan. Buat fondasi bersih tetapi tetap kecil.

Arsitektur yang diinginkan
- Organisasikan sebagai monorepo sederhana: `apps/web` untuk React dan `apps/api` untuk Fastify, dengan `packages/shared` hanya untuk tipe/konstanta yang benar-benar dipakai bersama. Bila repository yang ada sudah memiliki struktur yang masuk akal, ikuti struktur tersebut dan jangan migrasikan tanpa alasan kuat.
- Di web, kelompokkan per fitur: `features/projects`, `features/home`, `features/theme`, dan `components/ui` hanya untuk primitives reusable nyata (Button, Container, SectionHeading, ThemeToggle). Halaman hanya menyusun feature, bukan menyimpan business logic.
- Di API, kelompokkan per domain: `modules/projects`, `modules/profile`, dan `modules/health`; setiap module memiliki route, schema/validation, service, dan akses Drizzle yang lokal pada modul. Hindari interface/factory satu implementasi.
- Gunakan environment variables tervalidasi. Sediakan `.env.example`, tetapi jangan commit secret.
- Database harus memiliki migration, seed data dari CV yang sudah diverifikasi, constraints, indeks untuk query public project, dan timestamps. Gunakan enum/status `draft | published | archived` serta demo status `live | coming_soon | private | archived`.
- Buat `docker-compose.yml` hanya untuk PostgreSQL local bila tidak sudah ada; jangan containerize seluruh sistem pada tahap ini kecuali memang dibutuhkan deployment target.

Fungsionalitas dan desain yang wajib
- Homepage berisi: navigasi minimal, hero Three.js, daftar project yang compact, about, research/credentials, contact, footer. HILANGKAN capability/stack section dari homepage.
- Daftar proyek tidak boleh ramai: nomor, judul, tahun/kategori, visual kecil, dan arrow saja. Tidak ada paragraf panjang, kumpulan tech chip, atau banyak tombol di kartu.
- Klik proyek membuka route `/projects/:slug` dengan page transition yang halus. Halaman detail berisi title, year, category, role, overview, challenge, contribution, solution, technologies, media, next project.
- Tombol utama `Live Demo` wajib ada di area paling atas halaman detail (above the fold). GitHub adalah aksi sekunder. Jika demo belum bisa diakses, tampilkan state Coming soon/Private yang jujur tanpa tautan palsu.
- Isi awal project berasal dari CV dan harus akurat: AI Finance Automation System, HRMS Backend Developer, OCR KTP Data Extraction, ARnatomi, Typink, BebasRokok, serta Program Laundry. Jangan mengarang metrik, URL live demo, kontribusi personal, atau screenshot.
- Buat dark dan light theme sebagai token desain berbeda, bukan `invert()`. Ikuti token: dark `#111210/#1A1C19/#F4F1EA/#B7B4AC/#32342F/#B9F227`; light `#F7F6F2/#FFFFFF/#161713/#66675F/#DEDCD5/#587D00`. Pastikan contrast WCAG AA; jangan gunakan warna accent sebagai teks kecil di latar terang.
- Semua UI harus responsive (desktop, tablet, mobile), keyboard accessible, memiliki visible focus state, semantic HTML, alt text, dan menghormati `prefers-reduced-motion`.
- Animasi scroll perlu singkat dan berguna: reveal heading/row, hover kecil, dan route transition. Jangan scroll-jacking atau pinned horizontal scroll.

Kualitas, tes, dan deployment readiness
- Tambahkan loading, empty, error, 404, dan error-boundary states yang proporsional.
- Tambahkan test minimum yang bernilai: unit test untuk demo-status/link policy dan API project query; satu browser smoke test untuk homepage -> project detail -> Live Demo status. Jangan membuat suite besar yang tidak melindungi perilaku penting.
- Jalankan lint, type check, test, dan production build. Perbaiki semua kegagalan yang timbul dari perubahanmu.
- Tambahkan README yang menjelaskan prerequisite, setup local, migrasi/seed database, environment variables, commands, build, dan deployment baseline (frontend, API, PostgreSQL).
- Siapkan endpoint `/health` pada API. Gunakan CORS yang dikonfigurasi melalui environment variable, bukan wildcard pada production.
- Akhiri dengan ringkasan file yang dibuat/diubah, command verifikasi yang dijalankan beserta hasilnya, dan daftar singkat hal yang memang membutuhkan input saya (node-id Figma, asset asli, URL demo, domain, atau provider deploy).

Definition of done
- UI mengikuti context Figma yang berhasil dibaca, bukan template generik.
- Homepage compact dan fokus pada proyek; tidak ada capability stack.
- Setiap project membuka halaman detail sendiri, dengan tombol Live Demo di atas.
- Hero Three.js berfungsi tetapi tidak mengurangi accessibility, performance, atau fallback.
- Web/API/PostgreSQL dapat dijalankan secara lokal dari dokumentasi dan lulus build, type check, lint, serta test yang relevan.
```
