# Prompt Untuk Codex - Desain CMS Portfolio

> Archived design-generation prompt. The CMS design evolved after this prompt
> and now includes Dashboard, Settings, project preview, and upload controls.
> Use `docs/prd.md` as the source of truth for production migration.

Salin prompt berikut ke Codex ketika ingin mendesain dan merapikan UI CMS portfolio. Jalankan dari folder proyek `D:\Projek\Website\portofoliov2`.

```text
Buat desain dan implementasi UI CMS untuk website portfolio Mohammad Fauzi Aziz berdasarkan rencana di:
- docs/cms-content-plan.md
- docs/project-context.md
- docs/prd.md
- docs/technical-plan.md

Tujuan
Bangun CMS/admin area yang sederhana, rapi, cepat dipakai, dan sesuai dengan desain portfolio yang sudah ada. CMS ini digunakan oleh satu admin untuk mengatur semua konten website: homepage, selected work, projects, about, research, credentials, contact, SEO, dan media URL.

Prinsip desain
- CMS harus terasa seperti dashboard kerja, bukan landing page.
- Gunakan layout yang padat, jelas, dan mudah discan.
- Jangan membuat CMS terlalu dekoratif. Portfolio publik boleh ekspresif; CMS harus fungsional.
- Pertahankan visual identity portfolio: warna, typography, border tipis, spacing bersih, dark/light theme jika sudah ada.
- Gunakan komponen form yang konsisten: input, textarea, select, checkbox/toggle, tab, button, preview image, empty state, loading state, dan error state.
- Jangan memasang UI library besar. Gunakan React, TypeScript, CSS yang sudah ada, dan dependency yang sudah tersedia.
- Semua field harus responsif di desktop, tablet, dan mobile.

Halaman utama CMS
Buat `/admin` sebagai area CMS dengan:
- Login page email/password.
- Header admin berisi nama CMS, status admin, dan tombol logout.
- Tab atau sidebar sederhana untuk berpindah antar bagian.
- Toast/notice untuk status save, delete, dan error.
- State session expired yang mengarahkan kembali ke login.

Role dan auth
- Hanya ada satu role: ADMIN.
- ADMIN bisa mengatur semua konten.
- Tidak perlu UI permission, role management, atau invite user.
- Login menggunakan email dan password.
- Jangan tampilkan detail error login; cukup pesan umum.

Struktur navigasi CMS
Buat navigasi admin dengan section:
1. Profile & Homepage
2. Selected Work
3. Projects
4. About Facts
5. Research & Credentials
6. Contact
7. SEO

1. Profile & Homepage
Desain form untuk mengatur:
- Name/title hero, contoh saat ini: Mohammad Fauzi Aziz.
- Role/eyebrow hero, contoh: Backend & Web Developer.
- Main hero headline, contoh: I build reliable web systems that feel simple to use.
- Hero supporting description.
- Primary CTA label, contoh: Explore selected work.
- Primary CTA URL/anchor.
- GitHub button label, contoh: View GitHub.
- GitHub button URL.
- About headline.
- About body.
- About/profile photo URL.
- Footer short name.
- Footer location.
- Footer timezone.

Tambahkan preview kecil untuk:
- Hero text preview.
- Profile photo preview jika URL diisi.

2. Selected Work
Desain UI untuk memilih project yang tampil di homepage:
- Maksimal 5 project.
- Tampilkan daftar project published.
- Bisa pilih/unselect project.
- Bisa atur urutan dengan input angka atau tombol naik/turun.
- Bisa mengatur hover preview image URL per project.
- Jika hover preview kosong, tampilkan info fallback ke highlight image atau cover image.
- Tampilkan badge jika sudah mencapai batas 5 project.

3. Projects
Desain editor project yang lebih detail dari struktur saat ini:
- Title.
- Slug.
- Category.
- Role.
- Team/organization note.
- Summary pendek untuk card/list.
- Overview untuk halaman detail.
- Challenge.
- Contribution.
- Solution.
- Start date.
- End date.
- Technologies, cukup input comma-separated atau field tag sederhana.
- Status: DRAFT, PUBLISHED, ARCHIVED.
- Demo status: LIVE, COMING_SOON, PRIVATE, ARCHIVED.
- Live demo URL.
- GitHub URL.
- Cover image URL.
- Highlight image URL.
- Hover preview image URL.
- SEO title.
- SEO description.
- SEO image URL.
- Canonical URL.
- Is indexed toggle.

Desain Project Media/Gallery editor:
- List media per project.
- Add image URL.
- Alt text.
- Caption.
- Sort order.
- Highlight toggle.
- Delete image.
- Preview thumbnail.

Project list di CMS harus menampilkan:
- Title.
- Status.
- Demo status.
- Featured/selected work rank.
- Last updated.
- Tombol edit dan delete.

4. About Facts
Desain CRUD kecil untuk about facts:
- Label.
- Value.
- Sort order.
- Visibility toggle.
- Add/edit/delete.

Seed awal:
- University: Bina Nusantara University.
- Degree: Computer Science (2022 - 2026).
- Location: Indonesia.
- Languages: Indonesian.

Label dan value harus sama-sama bisa diedit.

5. Research & Credentials
Desain CRUD untuk research/publication/certification:
- Type: PUBLICATION, PAPER, CERTIFICATION.
- Title.
- Venue/issuer.
- Date label.
- DOI code.
- URL.
- Sort order.
- Visibility toggle.

Behavior:
- Jika DOI diisi, tampilkan generated link preview: https://doi.org/{doi}
- URL manual tetap bisa dipakai jika tidak ada DOI.
- List dibagi secara visual berdasarkan type agar mudah dikelola.

6. Contact
Desain CRUD untuk contact rows sebelah kanan contact section:
- Label.
- Value.
- URL.
- Kind: EMAIL, PHONE, LINKEDIN, GITHUB, WEBSITE, OTHER.
- Sort order.
- Primary toggle jika ingin dijadikan tombol utama.
- Visibility toggle.

Konten awal:
- Email.
- Phone.
- LinkedIn.
- GitHub.

7. SEO
Desain tab SEO untuk global site settings:
- Home SEO title.
- Home SEO description.
- Home SEO image URL.
- Canonical URL.
- Is indexed toggle.
- Robots/sitemap info read-only.

Untuk project SEO, field tetap berada di Project editor agar konteksnya dekat dengan project.

UX state yang wajib ada
- Loading state saat data CMS dimuat.
- Empty state untuk data kosong.
- Error state API.
- Unsaved changes warning sederhana jika memungkinkan tanpa library besar.
- Save success notice.
- Delete confirmation.
- Disabled state ketika form sedang saving.
- URL image preview gagal load.
- Selected work limit reached.

Desain responsif
- Desktop: sidebar atau tab horizontal dengan form dua kolom bila cukup lebar.
- Tablet: tab tetap mudah digunakan, form boleh satu kolom.
- Mobile: satu kolom, tombol save sticky di bawah boleh dipakai jika sederhana.
- Jangan sampai teks button atau input label terpotong.

Accessibility
- Semua input punya label.
- Error message terhubung dengan field yang bermasalah.
- Tombol icon harus punya accessible label.
- Fokus keyboard terlihat jelas.
- Warna teks harus cukup kontras.
- Delete confirmation tidak boleh hanya mengandalkan warna merah.

SEO/performance/security awareness di UI
- Field SEO harus punya counter atau hint pendek untuk panjang title/description.
- Beri hint agar image URL menggunakan gambar yang ringan dan jelas.
- Jangan izinkan HTML bebas di textarea.
- Jangan tampilkan secret, token, session id, atau database info di UI.
- Untuk URL, tampilkan validasi format sebelum save.

Batasan penting
- Jangan membuat upload file di versi ini. Semua gambar pakai URL.
- Jangan membuat rich text editor.
- Jangan membuat multi-role admin.
- Jangan membuat analytics dashboard.
- Jangan membuat drag-and-drop kompleks jika tombol naik/turun atau sort order sudah cukup.
- Jangan mengubah desain publik portfolio kecuali diperlukan agar membaca data CMS.

Output yang diharapkan
- UI CMS yang rapi dan siap dipakai di `/admin`.
- Komponen form kecil yang reusable bila memang dipakai lebih dari sekali.
- CSS admin yang konsisten dengan desain existing.
- Tidak ada dependency besar baru.
- Ringkasan perubahan.
- Command verifikasi yang dijalankan.

Definition of done
- Admin bisa login dan logout.
- Admin bisa mengatur Profile & Homepage.
- Admin bisa memilih maksimal 5 Selected Work dan mengatur preview hover.
- Admin bisa CRUD project lengkap dengan live demo URL, GitHub URL, gambar, gallery, dan SEO.
- Admin bisa CRUD About Facts.
- Admin bisa CRUD Research & Credentials dengan DOI link preview.
- Admin bisa CRUD Contact links.
- Public site bisa memakai data CMS tanpa hardcoded content utama.
- Type check, test API yang relevan, dan build berhasil.
```
