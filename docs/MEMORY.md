# MEMORY.md - Project Akhirusannah (sannah-invitation)

## 📅 Tanggal: 17 Mei 2026 (Konten Undangan Editable by Admin)

---

## 2025-05-17 — Konten Undangan Editable by Admin

### Table Dedicated: `konten_undangan`
- **Baru**: table `konten_undangan` dengan proper column per field (bukan key-value)
- Relasi: 1 sekolah → 1 konten undangan (`UNIQUE` di `sekolah_id`)
- Semua field `TEXT NOT NULL` dengan default value, kecuali `agenda` (JSONB)
- RLS: public read (untuk halaman undangan publik), service role write via admin API

### Migration
- File: `supabase/migrations/20250517000000_add_konten_undangan.sql`
- Seed default konten untuk setiap sekolah yang sudah ada (diambil dari nilai hardcoded sebelumnya)
- Agenda default: 5 item (Pembukaan & Doa, Laporan & Pidato, Video Kenangan, Foto Bersama, Penutupan)

### API Route: `/api/admin/konten-undangan`
- **GET**: fetch konten by `sekolah_id` dari JWT admin login, return 404 jika belum dibuat
- **PUT**: update semua field (full replace); upsert (update if exists, insert if not)
- Auth check via `createClient()` + `auth.getUser()`; validasi required fields (`judul`, `tanggal`, `waktu`, `lokasi_nama`)

### Admin Page: `/admin/konten-undangan`
- Form lengkap dengan semua field:
  - **Header**: Bismillah (font-noto-arabic), Hero Description, Judul, Subtitle
  - **Detail Acara**: Tanggal, Waktu, Lokasi Nama, Alamat (textarea), Link YouTube
  - **Susunan Acara**: Dynamic list (add/remove), setiap item: waktu, icon dropdown (BookOpen/Mic/Video/Camera/Star), judul
  - **Footer**: Header Arabic (arabic), Footer text
- Pattern dari `pengaturan/page.tsx`: glassmorphism, toast success/error, loading state, AnimatePresence

### Halaman Undangan — Dynamic Content
- `src/app/undangan/[token]/page.tsx`: fetch konten via `sekolah_id` tamu, pass sebagai prop `konten`
- `src/app/undangan/[token]/InvitationClient.tsx`:
  - Props: `konten: Tables<"konten_undangan">` (auto-generated type)
  - Semua hardcoded values diganti dengan dynamic props:
    - Bismillah, judul, subtitle, hero_desc → `konten.*`
    - Tanggal, waktu, lokasi → `konten.tanggal`, `konten.waktu`, dll
    - Link YouTube → sembunyi jika kosong
    - Agenda → loop `konten.agenda` (JSONB → `AgendaItem[]`), icon di-map dari string ke Lucide component
    - Footer → `konten.footer` + `konten.header_arabic`

### Per-sekolah Multi-tenant
- Konten otomatis terpisah per sekolah via `sekolah_id`:
  - GET/PUT API filter by `sekolah_id` dari JWT admin login
  - Halaman undangan publik filter by `sekolah_id` tamu
  - Seed migration: `INSERT INTO konten_undangan (sekolah_id) SELECT id FROM sekolah`

### Dashboard Navigation
- Tombol "Konten Undangan" (`FileText` icon) ditambahkan di action buttons dashboard

### Bug Fix: Fallback konten untuk tamu tanpa sekolah_id
- Tamu lama (sebelum migrasi `sekolah_id`) punya `sekolah_id` = `null` → menyebabkan `notFound()` di `page.tsx`
- Fix: fallback ke `FALLBACK_KONTEN` (hardcoded default) jika `sekolah_id` null atau konten belum dibuat
- Hanya token invalid yang trigger 404

### Attendance Pie Chart (Kehadiran)
- Komponen baru `AttendancePieChart.tsx` — reuse pattern GenderPieChart (CSS conic-gradient)
- Query `kehadiran_ortu` + `kehadiran_anak`, hitung per orang (bukan per RSVP)
- Segmen: Offline (hijau), Online (biru), Tidak Hadir (merah), Belum RSVP (abu)
- Total = jumlah tamu, menampilkan perbandingan per orang tua + anak
- Layout: grid 2 kolom bersebelahan dengan GenderPieChart

### Google Maps Link
- Kolom baru `lokasi_maps` TEXT di `konten_undangan` (migration `add_lokasi_maps_to_konten_undangan`)
- Admin: field "Google Maps Link" dengan instruksi "Buka Google Maps → Share → Copy link"
- API PUT: `lokasi_maps` diterima dan disimpan
- Undangan: icon Navigation + link "Buka Google Maps" (target _blank, muncul jika ada valuenya)

### Files
| File | Status |
|------|--------|
| `supabase/migrations/20250517000000_add_konten_undangan.sql` | **Baru** |
| `src/lib/database.types.ts` | **Regenerate** (+ `KontenUndangan` type) |
| `src/app/api/admin/konten-undangan/route.ts` | **Baru** |
| `src/app/admin/konten-undangan/page.tsx` | **Baru** |
| `src/app/admin/konten-undangan/loading.tsx` | **Baru** |
| `src/app/undangan/[token]/page.tsx` | **Edit** (fetch konten) |
| `src/app/undangan/[token]/InvitationClient.tsx` | **Edit** (hardcoded → props) |
| `src/app/admin/dashboard/page.tsx` | **Edit** (+ navigasi) |

---

## 🏗️ Project Overview

**Project Name:** sannah-invitation
**Tech Stack:**
- Next.js 16.2.6 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth)
- Zod validation
- Vercel (deployment target)

---

## 📋 Fitur yang Dibangun

### 1. Halaman & Routes

| Route | Fungsi |
|-------|--------|
| `/` | Landing page utama |
| `/admin/login` | Login admin |
| `/admin/dashboard` | Dashboard utama |
| `/admin/pengaturan` | Edit template WhatsApp |
| `/admin/tamu/baru` | Form tambah tamu manual |
| `/admin/tamu/upload` | Upload CSV |
| `/scan` | Scanner QR code untuk check-in |
| `/undangan/[token]` | Halaman undangan guest + RSVP form |

### 2. API Routes

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/tamu` | GET, POST | Get all tamu / Create tamu |
| `/api/tamu/[id]` | DELETE | Hapus tamu |
| `/api/rsvp` | POST | Submit RSVP |
| `/api/checkin` | POST | Submit check-in |
| `/api/signup` | POST | Create admin user |
| `/api/admin/settings` | GET, PUT | Get/update global settings (WhatsApp template) — admin auth |
| `/api/generate-wa` | POST | Generate WhatsApp link from template — admin auth |

### 3. Database Schema (Supabase)

**Tabel `tamu`:**
```sql
- id: UUID (PK, auto-generated)
- token: TEXT (unique, 8 char random)
- nama_siswa: TEXT (required)
- jenis_kelamin: TEXT (Laki-laki/Perempuan)
- nama_ayah: TEXT (optional)
- nama_ibu: TEXT (optional)
- no_wa_ayah: TEXT (optional)
- no_wa_ibu: TEXT (optional)
- nama_ortu: TEXT (legacy, nullable)
- created_at: TIMESTAMPTZ
```

**Tabel `rsvp`:**
```sql
- id: UUID (PK)
- tamu_id: UUID (FK -> tamu.id)
- kehadiran: TEXT (Hadir/Tidak Hadir)
- jumlah: SMALLINT (0-10)
- pesan: TEXT (optional)
- kehadiran_ortu: TEXT (nullable, Offline/Online/Tidak Hadir)
- kehadiran_anak: TEXT (nullable, Offline/Online/Tidak Hadir)
- created_at: TIMESTAMPTZ
```

**Tabel `pengaturan`:**
```sql
- key: VARCHAR(50) (PK)
- value: TEXT (not null)
- label: VARCHAR(100)
- description: TEXT
- updated_at: TIMESTAMPTZ
- updated_by: UUID (FK -> auth.users, nullable)
```

**Tabel `checkin`:**
```sql
- id: UUID (PK)
- tamu_id: UUID (FK -> tamu.id)
- waktu: TIMESTAMPTZ
- scanned_by: UUID (FK -> auth.users)
```

### 4. UI Components

| Component | Lokasi | Fungsi |
|-----------|--------|--------|
| TamuTable | `/src/components/TamuTable.tsx` | Tabel dengan 2 tab (Daftar Tamu & Daftar Undangan/Kehadiran) |
| RSVPForm | `/src/app/undangan/[token]/RSVPForm.tsx` | Form konfirmasi kehadiran |
| PengaturanPage | `/src/app/admin/pengaturan/page.tsx` | Admin page untuk edit template WhatsApp |
| Ornament Components | `src/components/ornaments/` | Divider, CornerAccent, HeaderArch |

---

## 🎨 Tema & Design

**Warna (Tailwind CSS v4 @theme):**
- `islamic-teal`: #0D9488
- `leaf-green`: #2E7D32
- `gold`: #D4AF37
- `gold-light`: #E8D48A
- `gold-dark`: #B8960C
- `cream`: #FDF6E3
- `cream-light`: #FEF9EC
- `charcoal`: #1F2937
- `gray-soft`: #6B7280

**Font:**
- Nunito (sans-serif, default)
- Amiri (serif, untuk teks Arab)

**Ornamentasi Islamic:**
- Background pattern: Islamic geometric SVG (gold 5% opacity pada cream)
- CornerAccent: L-shaped gold corner decorations
- Divider: Gold line dengan center ornament
- HeaderArch: Islamic arch/mihrab silhouette di header

---

## 📱 Fitur UI Tambahan

### Tab Navigation (Segment Control)
- **Daftar Tamu**: Token, Nama Siswa, Nama Orang Tua, Aksi (WA Ayah, WA Ibu, Hapus)
- **Daftar Undangan/Kehadiran**: Nama Siswa, JK, RSVP, Check-in, Aksi (Hapus)

### Toast Notification
- Setelah berhasil tambah tamu, muncul toast notification
- Form tidak redirect ke halaman baru

### CSV Upload
- Format: `nama_siswa;jenis_kelamin;nama_ayah;nama_ibu;no_wa_ayah;no_wa_ibu`

---

## 🌟 Redesain Halaman Undangan (14 Mei 2026)

### Transformasi Teknis

**Split Server/Client Components:**
- `page.tsx` → Server Component (fetch data dari Supabase)
- `InvitationClient.tsx` → Client Component baru ('use client' + Framer Motion)

**Ornament Components (reusable):**
- `src/components/ornaments/Divider.tsx` — Horizontal gold line dengan center ornament
- `src/components/ornaments/CornerAccent.tsx` — L-shaped gold corner ornament (4 corners per card)
- `src/components/ornaments/HeaderArch.tsx` — Islamic arch silhouette untuk header

**Animasi (Framer Motion):**
- `containerVariants` — Staggered entrance (0.15s delay per card)
- `itemVariants` — Fade-up (0.6s, easeOut)
- `qrVariants` — Spring bounce (stiffness 300, damping 20)
- Check-in badge — Pulse animation (scale 1.0→1.05, 2s loop)
- Respects `prefers-reduced-motion` via CSS media queries

**Redesain Kartu:**
1. **Header** — Bismillah (Amiri, gold gradient), Landmark icon, arch decoration, gold bottom border
2. **QR Code Card** — Double border (gold + islamic-teal), corner ornaments, gradient bg, spring animation
3. **Guest Greeting** — Envelope icon, gold top border, gold underline pada nama, hover shadow gold glow
4. **Event Details** — Vertical timeline (double border), circular icon badges (Calendar/Clock/MapPin/Video), Hijri date (Amiri)
5. **Agenda** — Timeline dengan time circles (08-11), event icons (BookOpen/Mic/Video/Camera/Star), hover highlights
6. **RSVP Form** — Gold border, gradient submit button, animated error/success states

### RSVP Dual-Selection (Orang Tua & Anak)

**Schema Database Baru:**
```sql
ALTER TABLE rsvp
  ADD COLUMN kehadiran_ortu VARCHAR(20) CHECK (IN ('Offline','Online','Tidak Hadir')) DEFAULT NULL,
  ADD COLUMN kehadiran_anak VARCHAR(20) CHECK (IN ('Offline','Online','Tidak Hadir')) DEFAULT NULL,
  ALTER COLUMN jumlah DROP CONSTRAINT rsvp_jumlah_check,
  ALTER COLUMN jumlah ADD CHECK (jumlah >= 0 AND jumlah <= 10);
```

**Form Structure:**
- Kehadiran Orang Tua: 3 cards (Offline/Online/Tidak Hadir) dengan icons (MapPin/Video/X)
- Kehadiran Anak: 3 cards identik
- Totalhadir: Auto-calculated (0–2 orang), displayed dalam pill badge (islamic-teal bg)
- Pesan/Doa: Textarea 200 char limit, char count
- Submit: "Simpan Kehadiran" (gradient teal→green, gold ring)

**Legacy RSVP Handling:**
- Deteksi: `kehadiran_ortu IS NULL` → legacy card (amber bg, left border-4)
- Tampilkan: Status kehadiran lama + jumlah + pesan (read-only)
- Aksi: Tombol "Update Kehadiran →" untuk reveal form baru
- **Tidak ada auto-migration** (hindari asumsi salah)

**API Backward Compatibility:**
- Endpoint `/api/rsvp` (POST) sekarang menerima `kehadiran_ortu`, `kehadiran_anak`
- Server-side compute: `jumlah` = sum(1 jika Offline/Online, else 0)
- Derive legacy `kehadiran` = "Hadir" jika jumlah > 0, else "Tidak Hadir"
- Insert semua 5 kolom: `kehadiran_ortu`, `kehadiran_anak`, `kehadiran`, `jumlah`, `pesan`
- Admin dashboard tetap baca `kehadiran`/`jumlah` tanpa perubahan

### Files Modified/Created

| File | Perubahan |
|------|-----------|
| `src/app/undangan/[token]/page.tsx` | Down to Server Component (fetch only) |
| `src/app/undangan/[token]/InvitationClient.tsx` | Client component baru (all UI + animations) |
| `src/app/undangan/[token]/RSVPForm.tsx` | Dual selection + legacy card + total calc |
| `src/app/api/rsvp/route.ts` | New schema, compute jumlah/kehadiran, insert 5 cols |
| `src/lib/schemas.ts` | Added `rsvpNewSchema` (kehadiran_ortu, kehadiran_anak) |
| `src/app/globals.css` | Pattern background, pulse-gentle/fade-in-up/scale-in-bounce keyframes |
| `src/components/ornaments/*.tsx` | 3 ornament components (Divider, CornerAccent, HeaderArch) |
| `supabase/migrations/20250514100000_add_kehadiran_ortu_anak.sql` | Migration baru |
| `src/app/admin/pengaturan/page.tsx` | New admin page for WhatsApp template editing |
| `src/app/api/admin/settings/route.ts` | GET/PUT endpoint for settings (with auth) |
| `src/app/api/generate-wa/route.ts` | Server-side WhatsApp link generator (with auth) |
| `src/lib/utils.ts` | Refactored generateWhatsAppLink to call API; removed direct DB access |
| `src/components/TamuTable.tsx` | Updated to async WhatsApp link generation with namaSiswa |
| `src/app/admin/dashboard/page.tsx` | Added Pengaturan button |
| `supabase/migrations/20250514110000_add_pengaturan_table.sql` | Settings table migration |

### Build & Deploy

```bash
pnpm add framer-motion          # Install dependency
pnpm build                      # ✅ TypeScript clean, build sukses
git add -A && git commit -m "feat(invitation): Islamic ornamental redesign..."
git push origin main
pnpm supabase db push           # Migrations applied ke remote
```

**Vercel deployment:** Auto-deploy upon push (production URL: https://sannah-invitation.vercel.app)

---

## 📋 Catatan Tambahan (Update 14 Mei 2026)

1. **Lib Files:**
   - `/src/lib/schemas.ts` — Zod schemas (legacy `rsvpSchema` + new `rsvpNewSchema`)
   - `/src/lib/utils.ts` — Helper functions. **NOTE:** `generateWhatsAppLink()` now calls `/api/generate-wa` to avoid exposing service role key on client; includes fallback to hardcoded message
   - `/src/lib/supabase/client.ts` — Browser client
   - `/src/lib/supabase/server.ts` — Server client (cookies)
   - `/src/lib/supabase/admin.ts` — Admin client (service role); env check deferred to function call

2. **Proxy (Middleware):**
   - `src/proxy.ts` — centralized auth guard (Next.js 16 proxy, replaces middleware.ts)
   - Melindungi `/admin/*` (kecuali `/admin/login`) dan `/scan/*`
   - Redirect ke `/admin/login` jika tidak terautentikasi
   - Menggunakan `@supabase/ssr` `createServerClient` dengan cookie handler untuk edge runtime
   - `config.matcher: ["/admin/:path*", "/scan/:path*"]`
   - Auth check redundant sudah dihapus dari `scan/layout.tsx` dan `admin/dashboard/page.tsx`

3. **Migration Files:**
   - `/supabase/migrations/20250514070000_initial_schema.sql` — Schema awal
   - `/supabase/migrations/20250514080000_add_columns.sql` — Tambah kolom baru
   - `/supabase/migrations/20250514090000_fix_schema.sql` — Fix nama_ortu nullable
   - `/supabase/migrations/20250514100000_add_kehadiran_ortu_anak.sql` — ✨ RSVP dual-selection columns
   - `/supabase/migrations/20250514110000_add_pengaturan_table.sql` — ✨ Settings table for WhatsApp template

4. **Design System — Islamic Wedding Invitation:**
   - Gold accents (#D4AF37) pada semua card borders, dividers, ornaments
   - Cream background (#FDF6E3) dengan repeating geometric SVG pattern (opacity 5%)
   - Amiri font untuk Arabic (Bismillah, Hijri date, copyright)
   - Nunito untuk UI body text
   - Icon set: Lucide React (Landmark, MapPin, Video, CheckCircle, Mail, Calendar, Clock, BookOpen, Mic, Camera, Star)

5. **Accessibility:**
   - `prefers-reduced-motion` respected (CSS media query nonaktifkan animasi)
   - Semantic HTML (header, main, footer, section)
   - Color contrast ratios meet minimum (gold on cream/teal on white)

6. **Admin Settings (WhatsApp Template):**
   - **Table `pengaturan`**: Key-value store; RLS public read; service role writes; seeded default template with placeholders
   - **API**: `GET /api/admin/settings` (requires admin auth), `PUT /api/admin/settings` (whitelist `wa_template_invitation`, max 5000 chars); PUT uses existence check then update or insert with defaults to avoid NOT NULL violations
   - **Admin UI**: `/admin/pengaturan` page with monospace textarea, clickable placeholder chips, live preview modal (WhatsApp bubble mock), success/error toasts
   - **Integration**: `TamuTable` "Kirim WA" buttons now async; calls `await generateWhatsAppLink(namaOrtu, token, namaSiswa)` which POSTs to `/api/generate-wa`; endpoint validates admin auth, fetches template from `pengaturan`, substitutes placeholders, returns URL
   - **Security**: Service role key only used in server-side API routes; never exposed to client bundle
   - **Bug fix** (2025-05-14 18:20): Resolved "Failed to update setting" by replacing upsert with explicit existence check → update or insert with default label/description; added auth to `/api/generate-wa`; improved error typing (`error instanceof Error`)

---

## 🚀 Deployment

### GitHub Repository
- **URL:** https://github.com/febri-13/sannah-invitation
- **Account:** febri-13 (GitHub CLI)
- **Initial commit:** `first: Initial commit`

### Vercel Deployment
- **Production URL:** https://sannah-invitation.vercel.app
- **Project:** febri-cahyas-projects/sannah-invitation
- **Status:** ✅ Deployed successfully

### Environment Variables (Vercel)
Variabel berikut diset di Vercel (tidak di-commit ke GitHub):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://djotfszjcnmjhcwhtxbe.supabase.co |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | sb_publishable_... |
| `SUPABASE_SERVICE_ROLE_KEY` | sb_secret_... |
| `NEXT_PUBLIC_BASE_URL` | (kosong - auto-detect di production) |

### Deploy Command
```bash
pnpm exec vercel --prod --yes
```

---

## 🔒 File yang Di-ignore

- `.env.local` (secrets lokal)
- `.envrc`
- `node_modules/`
- `.next/`
- `docs/`
- `supabase/.temp/`
- `.vercel/`

---

## 📊 Changelog

### 2025-05-14 — Redesain Islamic Ornamental + Dual RSVP
- **Invitation Redesign** (InvitationClient.tsx): Framer Motion animations, Islamic ornaments (gold corners, arch header, geometric pattern), redesigned all cards with gold accents and timeline layouts
- **RSVP Dual-Selection**: Separate attendance for Orang Tua & Anak (Offline/Online/Tidak Hadir), auto-calculated total (0–2), with legacy RSVP read-only card and "Update Kehadiran" toggle
- **Database Migration**: Added nullable `kehadiran_ortu`, `kehadiran_anak` columns to `rsvp` table; relaxed `jumlah` constraint to allow 0–10
- **API Backward Compatibility**: `/api/rsvp` now derives legacy `kehadiran` and `jumlah` columns from new inputs; admin dashboard unaffected
- **Ornament Components**: Divider, CornerAccent, HeaderArch (reusable SVG decorations)
- **Build & Deploy**: `framer-motion` added, TypeScript clean, pushed to GitHub, migration applied to Supabase remote; Vercel auto-deploy

*All implementation details documented in "Redesain Halaman Undangan (14 Mei 2026)" section above.*

### 2025-05-14 — Admin Editable WhatsApp Template (with bug fixes)
- **Settings Table**: New `pengaturan` table (key-value) seeded with `wa_template_invitation` default; RLS public read, service role writes; migration `20250514110000_add_pengaturan_table.sql` applied to remote
- **Template Engine**: `generateWhatsAppLink()` converted to async client wrapper; actual generation moved to `POST /api/generate-wa` (server-side) to prevent service role key exposure; supports placeholders: `{namaOrtu}`, `{namaSiswa}`, `{link}`, `{tanggalAcara}`, `{waktuAcara}`, `{lokasiAcara}`; falls back to hardcoded constants for event details if template missing
- **Admin API**: `GET /api/admin/settings` (optional `?key=` filter, admin auth required) and `PUT /api/admin/settings` (whitelist validation for `wa_template_invitation`, max 5000 chars, admin auth required). PUT rewritten to check existence first (fixes "Failed to update setting" bug from upsert NOT NULL violation on missing row), then update or insert with default label/description
- **Admin UI**: `/admin/pengaturan` page with monospace textarea, clickable placeholder chips for quick insertion, live preview modal (WhatsApp chat bubble mock with dummy data), success/error toasts with animated transitions
- **Dashboard Integration**: Pengaturan button added (Settings icon) to `/admin/dashboard`; `TamuTable` "Kirim WA" actions converted to async handlers that call `generateWhatsAppLink()` passing `namaSiswa`; `window.open` displays generated WA.me URL
- **Auth & Security**: All WhatsApp-related endpoints (`/api/generate-wa`, `/api/admin/settings`) protected by admin auth check using `createClient()` + `auth.getUser()`; service role key only used in server-side code (never bundled to client)
- **Bug Fixes**: 
  - Fixed `src/lib/utils.ts` to remove direct `createAdminClient()` import (was causing "Missing Supabase environment variables" error in browser bundle)
  - Fixed `src/lib/supabase/admin.ts`: moved env check inside `createAdminClient()` function (deferred execution) to prevent module-level throw during import
  - Fixed PUT `/api/admin/settings` to handle both insert and update paths safely
  - Added proper TypeScript error typing (`error instanceof Error`) in catch blocks
- **Files**: New `src/app/admin/pengaturan/page.tsx`, `src/app/api/admin/settings/route.ts`, `src/app/api/generate-wa/route.ts`; updated `src/lib/utils.ts`, `src/components/TamuTable.tsx`, `src/app/admin/dashboard/page.tsx`, `src/lib/supabase/admin.ts`

---

## 🎨 Redesain Glassmorphism (15 Mei 2026)

### Motivasi
Berdasarkan `DESIGN.md` yang meminta implementasi Glassmorphism style, seluruh website di-redesain dari Islamic ornamental menjadi Glassmorphism.

### Perubahan Teknis

**1. Tailwind Theme Update (`globals.css`):**
```css
@theme {
  --color-primary: #1856FF;      /* Primary color */
  --color-secondary: #3A344E;      /* Secondary */
  --color-success: #07CA6B;       /* Success */
  --color-warning: #E89558;        /* Warning */
  --color-danger: #EA2143;        /* Danger */
  --color-surface: #FFFFFF;       /* Surface */
  --color-text: #141414;           /* Text */

  --font-plus-jakarta: "Plus Jakarta Sans", sans-serif;
  --font-noto-arabic: "Noto Sans Arabic", sans-serif;
}
```

**2. Layout Update (`layout.tsx`):**
- Font: Nunito + Amiri → Plus Jakarta Sans + Noto Arabic
- Classes: `font-nunito` → `font-plus-jakarta`, `font-amiri` → `font-noto-arabic`

**3. Glassmorphism Utilities (`globals.css`):**
```css
.glass {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-dark {
  background: rgba(58, 52, 78, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
}

.glass-input {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.glass-button {
  background: linear-gradient(135deg, #1856FF 0%, #3A344E 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(24, 86, 255, 0.3);
}
```

**4. Body Background:**
```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}
```

### Halaman yang Di-update

| Halaman | File | Perubahan |
|---------|------|-----------|
| Landing | `src/app/page.tsx` | glass-card, glass-button |
| Admin Login | `src/app/admin/login/page.tsx` | glass-card, glass-input |
| Admin Dashboard | `src/app/admin/dashboard/page.tsx` | glass header, glass-card stats, glass-button |
| Tambah Tamu | `src/app/admin/tamu/baru/page.tsx` | glass-card, glass-input, glass-button |
| Upload CSV | `src/app/admin/tamu/upload/page.tsx` | glass-card, glass-input |
| Pengaturan | `src/app/admin/pengaturan/page.tsx` | glass, glass-card, glass-button (partial - ada error) |
| QR Scanner | `src/app/scan/page.tsx` | glass-card, glass-button |
| Undangan Guest | `src/app/undangan/[token]/InvitationClient.tsx` | glass-dark header, glass-card, remove Islamic ornaments |
| RSVP Form | `src/app/undangan/[token]/RSVPForm.tsx` | glass-card, glass-button |
| Tamu Table | `src/components/TamuTable.tsx` | glass-card, glass-input |

### File yang Dimodifikasi

1. `src/app/globals.css` - Theme colors + glass utilities
2. `src/app/layout.tsx` - Google Fonts (Plus Jakarta Sans + Noto Arabic)
3. `src/app/page.tsx` - Landing page
4. `src/app/admin/login/page.tsx` - Login form
5. `src/app/admin/dashboard/page.tsx` - Dashboard
6. `src/app/admin/tamu/baru/page.tsx` - Form tambah tamu
7. `src/app/admin/tamu/upload/page.tsx` - Upload CSV
8. `src/app/admin/pengaturan/page.tsx` - Settings (partial update - ada error)
9. `src/app/scan/page.tsx` - QR Scanner
10. `src/app/undangan/[token]/InvitationClient.tsx` - Undangan guest
11. `src/app/undangan/[token]/RSVPForm.tsx` - RSVP form
- 10. `src/app/undangan/[token]/InvitationClient.tsx` - Undangan guest
- 11. `src/app/undangan/[token]/RSVPForm.tsx` - RSVP form
- 12. `src/components/TamuTable.tsx` - Tamu table component

### Bug Fixes (Fixed 15 Mei 2026)

**Error 1: Build Failed - Pengaturan Page (`pengaturan/page.tsx`)**
- 3 bugs found in `src/app/admin/pengaturan/page.tsx`:
  1. **Duplicate return block** (lines 315–521): stray `return (` at module scope, reflected from duplicate JSX copy.
  2. **Misplaced `if (loading)` block** (line 98): indented at indent-0 (module scope) instead of indent-2 (inside function body). Fixed by aligning with function body spacing.
  3. **Unbalanced `</motion.div>`**: `</motion.div>` at ws=8 appeared before the Preview Modal section (line 251), prematurely closing the outer motion wrapper. The modal's two `<motion.div>` (overlay + card) compensated with two later closes, producing a net stack=-1 which tsc reported as "Expected corresponding JSX closing tag for 'div'" at line 311.
- **Fix**: Removed the duplicate JSX block (lines 315–521), dedented `if (loading)`, removed the stray `</motion.div>` before the Preview Modal section.
- Build errors resolved after these three fixes.

**`layout.tsx` — Next.js 16 `next/font/google` API change**
- In Next.js 16, the `weights` (plural) property was replaced by `weight` (accepts string array) — replaced on both fonts.
- Also, font-weight 100 and 900 are not published for **Plus Jakarta Sans** on Google Fonts (available: 200–800 + variable), and weight 100 missing for **Noto Arabic**. Updated arrays to match available weights only.

### Scanner Bug (Fixed 15 Mei 2026)

**`scan/page.tsx` — `POST /api/checkin` fires repeatedly; "Scan Lagi" crashes with "Cannot result, scanner is not paused"**

Two interacting problems:

**Problem A — Repeated API calls on single scan**
- `Html5QrcodeScanner` runs `foreverScan` at `fps: 10` (10 iterations/sec) indefinitely after `render()`. On a successful check-in, the scanner is never paused — it keeps detecting the same QR code every 100ms and calls the callback. Although `handleScan` guards with `if (status === "success" || status === "error") return`, there is a window between the first callback firing and React committing the `setStatus("loading")` → `setStatus("success")` update where duplicate calls could slip through.
- **Fix**: Call `scannerRef.current.pause(true)` **before** any guard or state update at the top of `handleScan`. The `pause(true)` transitions the internal state to `PAUSED` and stops the `foreverScan` loop entirely. On error, `resume()` is called so the user can retry immediately.

**Problem B — "Scan Lagi" button throws "Cannot result, scanner is not paused"**
- `Html5QrcodeScanner.resume()` delegates to `Html5Qrcode.resume()`, which checks `stateManagerProxy.isPaused()` and throws `"Cannot result, scanner is not paused."` when the state is `SCANNING`. Since the scanner was never paused after a scan, the state stayed `SCANNING`, so every call to `resetScanner()` → `resume()` always crashed.
- **Fix**: Import `Html5QrcodeScannerState` from `html5-qrcode`; in `resetScanner()`, check `scannerRef.current.getState() === PAUSED` before calling `resume()`. Also wrapped in `try/catch`. With Problem A's fix, the scanner now transitions to `PAUSED` on every scan, so `resume()` always passes the guard and the "Scan Lagi" button works correctly.

**Scanner state flow after fix:**
```
render()          →  SCANNING  (foreverScan at 10fps)
QR detected       →  pause(true)  →  PAUSED  (foreverScan stops)
  ├── success/error: status="success"/"error", stays PAUSED
  │                     "Scan Lagi" → resetScanner() → resume() → SCANNING
  └── processingRef=false set in finally, but handler returns early via guard anyway
```

**Why processingRef is needed (not just pause(true)):**
- `foreverScan` fires at 10fps via `setTimeout`. When a QR is detected, all callbacks within the same JS tick fire before any React batch commit happens. The `status` in a closure is *stale* — every firing callback reads the original `status === "idle"`. The guard `if (status === "success" || status === "error") return` is bypassed for all of them before the first `setStatus("loading")` is committed.
- `processingRef` is a mutable ref — it's updated synchronously (`processingRef.current = true`) and read synchronously, so there are **zero stale-closure callers**. Even 10 rapid callbacks all see `processingRef.current === true` on entry and return immediately.
- Combined with `pause(true)` → the `foreverScan` loop stops anyway once `shouldScan` goes false (synchronously on the same tick), so the ref solely protects the tiny window between `render()` → first callback.
- `processingRef.current = false` in `finally` (not in success/error paths): scanner is paused after scan, so even if ref resets, no more callbacks fire. On error, `resume()` + ref reset happens synchronously before the next tick. On success, user must press "Scan Lagi" to resume.

- `Html5QrcodeScanner.resume()` always delegates to `Html5Qrcode.resume()` with **no arguments**, so `shouldPauseVideo` is `undefined` → coerced to `false` → `renderedCamera.resume()` is never called → the camera video stream stays paused/invisible on retry. Fix: bypass `Html5QrcodeScanner.resume()` and call `Html5Qrcode.resume(true)` directly via the private `html5Qrcode` field. Passing `true` triggers `renderedCamera.resume()` which unbuffers the video → camera appears correctly.

### Check-In Deduplication (15 Mei 2026)

**Problem**: `checkin` table had 427 rows for a single tamu (Fatma Eneh) caused by the 10fps `foreverScan` loop firing the scan callback hundreds of times before any state was committed.

**Query used to find duplicates** (via `supabase db query --linked`):
```sql
SELECT tamu_id, COUNT(*) as total_rows, MIN(waktu) as first, MAX(waktu) as last
FROM checkin
GROUP BY tamu_id HAVING COUNT(*) > 1;
```

**Dedup SQL** (keeps earliest check-in per tamu, removes all others):
```sql
DELETE FROM checkin
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY tamu_id ORDER BY waktu ASC) as rn
    FROM checkin
  ) ranked WHERE ranked.rn = 1
);
```

**Before**: `total_checkin_rows = 427` (1 tamu × 426 dups + 1 first)  
**After**: `total_checkin_rows = 1` | `distinct_tamu = 1`  
**Verified with** `supabase db query --linked -o table`.

---

### Gender Distribution Pie Chart — Admin Dashboard (15 Mei 2026)

**Files**:
| File | Perubahan |
|------|-----------|
| `src/app/admin/dashboard/GenderPieChart.tsx` | Komponen client baru — CSS conic-gradient donut chart |
| `src/app/admin/dashboard/page.tsx` | Tambah `getGenderStats()` query, render `<GenderPieChart>` dalam glass-card row |
| `src/app/globals.css` | `.pie-base` / `.pie-donut::after` utilities |

**Approach**: Pure CSS `conic-gradient()` — zero new dependencies. Donut hole via `::after` pseudo-element at 65% width/height centered.

**Data query** (aggregation on `tamu.jenis_kelamin`):
```ts
const { data } = await supabase.from("tamu").select("jenis_kelamin");
const total    = data.length;
const laki     = data.filter(t => t.jenis_kelamin === "Laki-laki").length;
const perempuan = data.filter(t => t.jenis_kelamin === "Perempuan").length;
const belum    = total - laki - perempuan;          // null / empty
```

**Segment colors**:
| Kategori | Warna |
|---------|-------|
| Laki-laki | `#3B82F6` (blue) |
| Perempuan | `#EC4899` (pink) |
| Belum diisi | `#D1D5DB` (gray) |

**Zero-total guard**: all-zero → `conic-gradient(transparent 0turn 1turn)` not needed; simply renders "-" text in the donut hole instead (avoids zero-width slice bug).

**Layout**: Full-width `glass-card p-4 mb-6` row above the action buttons, responsive and mobile-friendly.

---

## 2025-05-16 — proxy.ts + Error Handling Dashboard

### Proxy.ts (Centralized Auth Guard)
- **File baru**: `src/proxy.ts` — auth guard terpusat di edge level menggunakan Next.js 16 `proxy`
- Melindungi semua halaman `/admin/*` (kecuali `/admin/login`) dan `/scan/*` secara otomatis
- Sebelumnya: auth check dilakukan manual di setiap halaman (`scan/layout.tsx`, `admin/dashboard/page.tsx`)
- Sekarang: auth check cukup sekali di proxy, halaman yang sebelumnya tidak punya proteksi (`admin/tamu/baru`, `admin/tamu/upload`, `admin/pengaturan`) langsung teramankan
- Menggunakan `@supabase/ssr` `createServerClient` dengan cookie handler kompatibel untuk edge runtime

### Error Handling Dashboard
- **`src/app/admin/dashboard/page.tsx`** — semua fungsi fetching data (`getStats`, `getGenderStats`, `getTamu`) dibungkus `try-catch` dengan fallback value
- Fungsi utama `DashboardPage` juga dibungkus `try-catch-finally`
- `finally` digunakan untuk logging bahwa dashboard selesai dimuat
- **Bug fix**: `totalCheckin` pakai `|| 0` karena Supabase bisa return `null`

### Auth Checks Dihapus (Redundant)
- `src/app/scan/layout.tsx` — dihapus import `redirect`, `createClient`, dan blok `if (!user) redirect()`
- `src/app/admin/dashboard/page.tsx` — dihapus blok `if (!user) redirect("/admin/login")`, hanya menyisakan `getUser()` untuk ambil `sekolah_id`

---

## 2025-05-16 — Error Handling Menyeluruh + Supabase Typesafety

### Error Handling (try-catch-finally)
Melengkapi error handling di semua halaman yang masih kurang:

| File | Fungsi | Perbaikan |
|------|--------|-----------|
| `src/app/undangan/[token]/page.tsx` | Fetch tamu dari Supabase | `try-catch` → `notFound()` |
| `src/components/TamuTable.tsx` | `handleDelete()` — fetch DELETE `/api/tamu/[id]` | `try-catch-finally` |
| `src/app/admin/tamu/baru/page.tsx` | `handleSubmit()` — fetch POST `/api/tamu` | `try-catch-finally`, `setLoading(false)` di `finally` |
| `src/app/admin/login/page.tsx` | `handleLogin()` — `supabase.auth.signInWithPassword()` | `try-catch-finally`, `setLoading(false)` di `finally` |
| `src/proxy.ts` | `supabase.auth.getUser()` di edge runtime | `try-catch`, redirect ke login jika gagal |

**Yang sudah aman sebelumnya**: 7 API routes, `RSVPForm.tsx`, `scan/page.tsx`, `pengaturan/page.tsx`, `upload/page.tsx`, `admin/dashboard/page.tsx`.

### Supabase Typesafety
- **`src/lib/database.types.ts`** — auto-generated via `supabase gen types typescript --linked` menggunakan Supabase MCP OAuth token
- Mencakup semua 5 tabel: `tamu`, `rsvp`, `checkin`, `pengaturan`, `sekolah` + function `get_user_sekolah_id()`
- Convenience types: `Tamu`, `Rsvp`, `Checkin`, `Pengaturan`, `Sekolah`

**Supabase clients — semua pakai `<Database>` generic:**
- `src/lib/supabase/client.ts` — `createBrowserClient<Database>(...)`
- `src/lib/supabase/server.ts` — `createServerClient<Database>(...)`
- `src/lib/supabase/admin.ts` — `createClient<Database>(...)`
- `src/proxy.ts` — `createServerClient<Database>(...)`

**Perbaikan tipe manual → auto-generated:**
- `src/components/TamuTable.tsx` — `TamuData.checkin.waktu` → `string | null`
- `src/app/undangan/[token]/InvitationClient.tsx` — `jenis_kelamin` → `string | null`, field `checkin_at` → `waktu`, `created_at` → `string | null`
- `src/app/undangan/[token]/RSVPForm.tsx` — `created_at` → `string | null`

**Package.json:**
- Script baru: `"gen:types": "supabase gen types typescript --linked > src/lib/database.types.ts"`

**Supabase MCP:**
- Konfigurasi ditambahkan di `~/.config/opencode/opencode.jsonc`
- OAuth authenticated via `opencode mcp auth supabase`
- Access token: `sbp_oauth_*` (tersimpan di `~/.local/share/opencode/mcp-auth.json`)

---

---

---

## 2025-05-16 — Perf: loading.tsx + Font + Dynamic Import

### loading.tsx (6 file baru)

Setiap route utama sekarang punya `loading.tsx` dengan skeleton `animate-pulse`:

| File | Skeleton |
|------|----------|
| `src/app/admin/dashboard/loading.tsx` | Header + 4 stat cards + chart + 4 action buttons + table |
| `src/app/admin/tamu/baru/loading.tsx` | Back button + title + 6 form fields + submit button |
| `src/app/admin/tamu/upload/loading.tsx` | Back btn + title + format info box + upload area + submit |
| `src/app/admin/pengaturan/loading.tsx` | Back btn + title + textarea + chips + save button |
| `src/app/scan/loading.tsx` | Icon + title + QR viewport + scan button |
| `src/app/undangan/[token]/loading.tsx` | Full page: header/QR + greeting + event + agenda + RSVP form |

### Font Optimization (`layout.tsx`)

- Plus Jakarta Sans: `["200","300","400","500","600","700","800"]` → `["400","500","600","700"]`
- Noto Sans Arabic: `["200","300","400","500","600","700","800","900"]` → `["400","500","600","700"]`
- `display: "swap"` ditambahkan ke keduanya

### Lazy-load TamuTable (`admin/dashboard/page.tsx`)

- Import static `import TamuTable from "@/components/TamuTable"` dihapus
- Ganti dengan `dynamic(() => import(...))` + loading skeleton
- JS TamuTable (315 lines client component + lucide-react) tidak lagi masuk di bundle awal dashboard

---

## 2025-05-16 — Redesain Dashboard + Upload + WA Direct Number

### Redesain Dashboard (Glassmorphism v2)

**`src/app/globals.css`:**
- Tambah color tokens: `primary-container`, `on-primary-container`, `surface-container-low`, `surface-container`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`
- Utility baru: `glass-panel` (backdrop-blur(24px), bg rgba putih 0.7, softer shadow)
- `glass-input:focus` state (border primary, ring primary/20)

**`src/app/admin/dashboard/page.tsx`:**
- Semua logic (`getStats`, `getGenderStats`, `getTamu`, `handleLogout`, try-catch-finally) tetap sama
- Sticky navbar: `bg-white/90 backdrop-blur-md` (lebih solid dari glass-panel)
- Stat cards: `glass-panel rounded-2xl`, icon lingkaran warna (blue/green/red/purple), hover lift
- GenderPieChart: `glass-panel rounded-3xl` center
- Action buttons: "Tambah Manual" solid `bg-primary rounded-full`, sisanya `glass-panel rounded-full` pills

### Redesain Upload Page

**`src/app/admin/tamu/upload/page.tsx`:**
- Header konsisten: `bg-white/90 backdrop-blur-md`
- Kontainer: `glass-panel rounded-3xl`
- Info format CSV: `bg-surface-container-low rounded-2xl`
- Upload area: border dashed `border-outline-variant`, hover primary
- Tombol Upload: `bg-primary rounded-full` solid
- Success state: badge rounded-full untuk hasil

### WhatsApp Direct Number

**`src/app/api/generate-wa/route.ts`:**
- Menerima field `phoneNumber` di request body
- Nomor dibersihkan (hanya digit), konversi `0` → `62` (format internasional)
- `wa.me/{phone}?text=...` (dulu `wa.me/?text=...` tanpa nomor)

**`src/lib/utils.ts`:**
- `generateWhatsAppLink()` parameter baru `phoneNumber`, diteruskan ke API + dipakai di fallback

**`src/components/TamuTable.tsx`:**
- `getWhatsAppLink()` passing `no_wa_ayah` / `no_wa_ibu` sesuai target ke API
- Tombol WA langsung `wa.me/{nomor}` — user tidak perlu milih kontak manual

**`src/app/admin/tamu/baru/page.tsx`:**
- `lastCreated` state sekarang nyimpen `noWaAyah` / `noWaIbu`
- 2 tombol terpisah: "Kirim ke Ayah" / "Kirim ke Ibu" (muncul sesuai nomor yang ada)
- Format nomor: replace `^0` → `62`

---

## 2025-05-16 — Scanner Rewrite: Robust Lifecycle

### Masalah Bertubi-tubi
| Percobaan | Error |
|-----------|-------|
| Pause → Resume dengan state check | "Cannot result, scanner is not paused" |
| `startScanner(clearOld)` langsung | "HTML Element with id=qr-reader not found" |
| `setTimeout(() → startScanner, 100)` | Scanner tidak muncul |
| `scannerKey` effect | Scanner muncul, tapi fetch gagal "Gagal terhubung ke server" |

### Root Cause
Semua pendekatan sebelumnya punya race condition antara:
- React commit DOM (render `#qr-reader`)
- Async `scanner.clear()` (release camera)
- `scanner.render()` (acquire camera + attach ke DOM)

`scannerKey` effect: cleanup (clear scanner) dan setup (create scanner) berjalan sequential dalam satu microtask — camera belum release saat scanner baru coba akses.

### Solusi Final (`waitForElement` + `requestAnimationFrame`)

```typescript
const waitForElement = (id: string): Promise<void> =>
  new Promise((resolve) => {
    const check = () =>
      document.getElementById(id) ? resolve() : requestAnimationFrame(check);
    check();
  });
```

- Polling pake `requestAnimationFrame` (bukan `setTimeout`) — sinkron dengan siklus render browser
- `startScanner()`: **await** DOM ready → **await** clear old scanner → create new scanner
- `handleScanRef` — ref yang selalu diupdate setiap render, efek tanpa dep, no stale closure
- On error: `startScanner()` dipanggil langsung — user bisa scan lagi tanpa klik tombol
- `res.json()` punya try-catch sendiri — bedain JSON parse error vs network error

### Files Modified
| File | Perubahan |
|------|-----------|
| `src/app/scan/page.tsx` | Rewrite total: waitForElement, async lifecycle, handleScanRef, separate JSON catch |

---

## 2025-05-16 — Auto-Restart Scanner + Error Display Fix

### Error Display Fix
Sebelumnya `startScanner()` dipanggil di path error (non-ok response & catch), nge-override `setStatus("error")` jadi `"scanning"` — user ga pernah liat error message.

**Fix**: Hapus `startScanner()` dari path error. Scanner di-clear, user liat error, klik "Scan Lagi" untuk retry.

### Auto-Restart Scanner
Setelah notifikasi (sukses/gagal), scanner otomatis restart tanpa klik:

| Kondisi | Delay | Keterangan |
|---------|-------|------------|
| Success ✅ | 1.5 detik | Cukup untuk lihat nama tamu |
| Error ❌ | 2.5 detik | Lebih lama untuk baca pesan error |

**Detail teknis:**
- `autoResetRef` — `useRef<ReturnType<typeof setTimeout>>` untuk nyimpen timer ID
- `resetScanner()` panggil `clearTimeout(autoResetRef.current)` — cegah double-call jika user klik manual
- Cleanup di `useEffect` return — `clearTimeout` pas unmount
- Tombol **Scan Lagi** tetap ada sebagai fallback untuk user yang ingin lebih cepat

### Flow Final
```
Scan QR → fetch API → sukses? → clear scanner → show success 1.5s → auto scanner
                      → gagal? → clear scanner → show error 2.5s → auto scanner
                                                    ↕ klik Scan Lagi → langsung scanner
```

### Files Modified
| File | Perubahan |
|------|-----------|
| `src/app/scan/page.tsx` | `autoResetRef`, `setTimeout` di success/error path, `clearTimeout` di resetScanner |

---

## 2025-05-17 — Premium Glassmorphism Redesign (Warm Earthy)

Migrasi penuh dari tema biru/ungu ke **Editorial Islamic — Premium Glassmorphism** dengan palet warm earthy (terracotta, clay, gold, cream, sage).

### Perubahan Global
- **Warna:** Semua token warna diganti — `--color-primary` dari `#1856FF` → `#C26A4A` (terracotta), secondary `#3A344E` → `#8B4A2F` (clay).
- **Typography:** Layout sekarang menggunakan **Cormorant Garamond** (serif display italic), **Amiri** (Arabic), **JetBrains Mono** (labels) via `next/font/google`.
- **Background:** Body dari purple gradient (`#667eea → #764ba2`) menjadi warm gradient (`#FDF6E8 → #F4E6D0 → #F8E5D6`).
- **Glass utilities:** Semua kelas `.glass`, `.glass-card`, `.glass-chip`, `.glass-button` diupdate ke warm-tinted glass (RGBA 255,248,235 + backdrop-filter blur).

### Halaman Undangan (`/undangan/[token]`)
- **Premium Glassmorphism (V2):** Frosted glass cards dengan blurred orbs background (terracotta, sage, gold gradients).
- **Typographic hierarchy:** Cormorant Garamond italic untuk judul/headline, JetBrains Mono UPPERCASE untuk section labels, Amiri untuk Arabic, Plus Jakarta Sans untuk body.
- **Section order:** Hero → Greeting → Countdown (dari tanggal acara) → Detail Acara → Susunan Acara → QR Check-in → RSVP → Footer.
- **RSVP Form:** Segmented control pills (Hadir/Online/Tidak) dengan terracotta active state.
- **Nama sekolah dinamis:** Hero label & footer signature mengambil dari tabel `sekolah.nama`.

### Admin Dashboard (`/admin/dashboard`)
- **Layout lengkap:** Dark glass sidebar (logo + navigasi + quick actions + logout) + top bar (greeting, search, date chip, notification bell) + main content area.
- **Event banner:** Dark glass dengan gradien orbs, menampilkan info acara & tombol Edit Konten / Pratinjau.
- **4 stat cards:** Total Undangan, RSVP Konfirmasi, Akan Hadir, Sudah Check-in (serif italic display, delta badge).
- **Donut charts (SVG):** Distribusi gender + distribusi RSVP dengan legenda chip.
- **Activity feed:** Dark glass card dengan timeline aktivitas real-time.
- **Quick actions:** 5 tombol (Tambah Tamu, Upload CSV, Scanner, Broadcast, Konten).
- **Tamu table:** Section header serif italic + existing TamuTable component.
- **Nama sekolah dinamis:** Sidebar mengambil dari `sekolah.nama` sesuai admin yang login.

### Halaman Demo (`/undangan/demo`)
- Halaman pratinjau undangan khusus admin, diakses dari tombol "PRATINJAU UNDANGAN" di dashboard.
- Mengambil data `konten_undangan` sesuai sekolah admin, menampilkan sample tamu.
- Banner "⚡ PRATINJAU UNDANGAN" sebagai indikator preview.

### Files Modified
| File | Perubahan |
|------|-----------|
| `src/app/globals.css` | Rewrite: warm earthy palette, glass utilities, font utilities |
| `src/app/layout.tsx` | Tambah Cormorant Garamond, Amiri, JetBrains Mono fonts |
| `src/app/undangan/[token]/InvitationClient.tsx` | Rewrite: Premium Glassmorphism V2, blurred orbs, typography hierarchy, sekolahNama dinamis |
| `src/app/undangan/[token]/RSVPForm.tsx` | Rewrite: warm earthy pills, glass inputs, terracotta gradient button |
| `src/app/undangan/[token]/page.tsx` | Tambah fetch sekolah.nama untuk dinamisasi nama sekolah |
| `src/app/admin/dashboard/DashboardClient.tsx` | File baru: full dashboard layout Premium Glassmorphism |
| `src/app/admin/dashboard/DonutChart.tsx` | File baru: SVG donut chart reusable component |
| `src/app/admin/dashboard/page.tsx` | Rewrite: ganti render ke DashboardClient, tambah fetch sekolah.nama |
| `src/app/undangan/demo/page.tsx` | File baru: halaman pratinjau undangan untuk admin |

---

---

## 2025-05-18 — Multi-Event Support

### Events Table
- **Baru**: table `events` (id, sekolah_id, nama, slug, is_active, created_at, updated_at)
- Relasi: 1 sekolah → many events
- Slug unique per sekolah (lowercase, no spaces)
- RLS: public read for event listing

### event_id on Existing Tables
- `konten_undangan.event_id`: UUID, NOT NULL, UNIQUE — 1 event = 1 konten
- `tamu.event_id`: UUID, nullable — tamu belongs to event
- `rsvp.event_id`: UUID, nullable — backfilled via tamu.event_id

### Migration
- File: `supabase/migrations/20250518000000_add_events_table.sql`
- Applied via opencode Supabase tools ✅

### Event Cookie Switcher
- `src/lib/event-cookie.ts` — getActiveEvent/setActiveEvent/clearActiveEvent via `document.cookie`
- Cookie name: `active_event_id`, max-age 30 days
- Server reads via `cookies()` from `next/headers`

### Dashboard Event Switcher
- Sidebar: `<EventSwitcher>` dropdown with event list + "BUAT EVENT BARU" button
- Switching event → `setActiveEvent()` + `window.location.reload()`
- All stat queries (total tamu, RSVP, gender, attendance, checkin) filter by `active_event_id`

### Create Event Modal
- `CreateEventModal` in DashboardClient.tsx — inline form
- API `POST /api/admin/events` — creates event + clones default konten from existing
- Auto-switches to new event on success

### API Updates
- `GET /api/tamu` — accepts `?event_id=` filter
- `POST /api/tamu` — saves `event_id` from cookie
- `GET /api/admin/konten-undangan` — accepts `?event_id=`
- `PUT /api/admin/konten-undangan` — upsert by event_id
- `GET /api/checkin` — tamu select includes event_id
- `src/lib/schemas.ts` — tamuInputSchema includes optional event_id

## 2025-05-19 — Event-Scoped WA Template + Template Theme System

### Event-Scoped WA Template
- **Migration**: `20250519000001_add_event_id_to_pengaturan.sql`
- Added `event_id` UUID → events(id) to `pengaturan` table
- Dropped old PK on `key` alone
- Backfilled existing rows with sekolah's first event
- New composite PK: `(sekolah_id, key, event_id)`
- **API `/api/admin/settings`**: GET accepts `?event_id=`, PUT accepts `event_id` in body
- **API `/api/generate-wa`**: resolves event_id from tamu's token, uses it to find the right template
- **Halaman Pengaturan**: reads `active_event_id` cookie, sends in API calls

### Template Theme System
- **Migration**: `20250519000002_add_template_slug_to_konten.sql`
- Added `template_slug VARCHAR(50) NOT NULL DEFAULT 'glass-premium'` to konten_undangan

#### Theme Config (`src/lib/themes.ts`)
3 themes available:
| Slug | Name | Description |
|------|------|-------------|
| `glass-premium` | Glass Premium | Warm earthy terracotta |
| `classic-gold` | Classic Gold | Emerald & gold — mewah |
| `modern-sage` | Modern Sage | Sage green minimalis |

#### CSS Variables (`globals.css`)
- All hardcoded colors replaced with CSS custom properties:
  - `--color-primary`, `--color-secondary`, `--color-text`, `--color-text-muted`
  - `--color-bg-start/mid/end`, `--color-glass-bg/border`, `--color-button-shadow`
  - `--orb-1` through `--orb-6` for background orbs
- Each `.theme-*` class overrides all vars for that theme

#### InvitationClient.tsx
- Outer div gets `className={`min-h-screen relative ${themeClass}`}` with `theme-{template_slug}`
- All inline `"#C26A4A"` → `"var(--color-primary)"`, `"#2A2520"` → `"var(--color-text)"`, etc.
- BgOrbs uses `var(--orb-1)` through `var(--orb-6)`
- Same treatment for RSVPForm.tsx

#### Admin Konten Undangan
- Added template selector dropdown (3 cards with color swatches)
- API accepts & saves `template_slug`

## 2025-05-19 — Supabase MCP + Agent Skills

### MCP Configuration (`opencode.json`)
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=djotfszjcnmjhcwhtxbe&features=docs%2Caccount%2Cdatabase%2Cdevelopment%2Cfunctions%2Cdebugging",
      "enabled": true
    }
  }
}
```

### Agent Skills Installed
- `supabase` — general Supabase skill (DB, Auth, Storage, Edge Functions)
- `supabase-postgres-best-practices` — Postgres optimization & query best practices
- Installed via `npx skills add supabase/agent-skills --yes` to `.agents/skills/`
- Auth status: already authenticated (OAuth token valid)

---

---

## 2025-05-21 — School Logo on Invitation + Back Button + Fix Pengaturan Bug

### Logo Sekolah di Halaman Undangan
- **Migration**: `supabase/migrations/20250521000000_add_logo_url_to_sekolah.sql`
- Added `logo_url TEXT NOT NULL DEFAULT ''` to `sekolah` table
- `src/app/undangan/[token]/page.tsx`: fetch `logo_url` from sekolah, pass as `sekolahLogo` prop
- `src/app/undangan/[token]/InvitationClient.tsx`: renders logo image after subtitle (hidden if empty)
- Types regenerated (`src/lib/database.types.ts`)

### Logo Upload File di Admin Konten Undangan
- **Storage bucket**: `school-logos` (public, max 2MB, PNG/JPG/WebP/SVG)
- `src/app/api/admin/upload-logo/route.ts`: Upload file → Supabase Storage → simpan URL ke `sekolah.logo_url`
- `src/app/admin/konten-undangan/page.tsx`: File upload dengan preview + tombol hapus logo
- `src/app/api/admin/konten-undangan/route.ts`: GET includes `logo_url` from sekolah; PUT saves `logo_url` to sekolah

### Tombol Kembali ke Dashboard
- `src/app/admin/pengaturan/page.tsx`: Added `ArrowLeft` back button → `/admin/dashboard`

### Bug Fix: Pengaturan Failed to Fetch
- **Root cause**: Frontend sent `event_id: null` (cookie not set), backend used `event_id ?? "00000000-..."` placeholder, mismatch with real event UUID → existence check failed → INSERT new row with null event_id → second save hit PK violation
- **Fix (frontend)**: `Setting` interface now includes `event_id`; `handleSave` uses `setting.event_id` from GET result instead of `getActiveEvent()` cookie
- **Fix (backend)**: PUT handler uses `.eq("event_id", value)` or `.is("event_id", null)` properly instead of `??` fallback

### Files
| File | Status |
|------|--------|
| `supabase/migrations/20250521000000_add_logo_url_to_sekolah.sql` | **Baru** |
| `src/lib/database.types.ts` | **Regenerate** (+ `logo_url` di sekolah) |
| `src/app/undangan/[token]/page.tsx` | **Edit** (+ fetch logo_url) |
| `src/app/undangan/[token]/InvitationClient.tsx` | **Edit** (+ logo display) |
| `src/app/admin/pengaturan/page.tsx` | **Edit** (+ back button, + event_id in interface) |
| `src/app/api/admin/settings/route.ts` | **Edit** (fix null event_id handling) |
| `src/app/admin/konten-undangan/page.tsx` | **Edit** (+ logo upload + preview) |
| `src/app/api/admin/konten-undangan/route.ts` | **Edit** (+ logo_url: GET include, PUT save to sekolah) |
| `src/app/api/admin/upload-logo/route.ts` | **Baru** |
| `src/lib/database.types.ts` | **Edit** (+ convenience types: KontenUndangan, Tamu, etc.) |

---

## 2025-05-21 — Fix: Auto-Create Default Pengaturan + Error Handling

### Bug: Tombol Simpan Tidak Bisa Diklik
- **Root cause**: Hanya sekolah `21ca813e-...` (admin ABBS) yang punya data di tabel `pengaturan`. Admin sekolah lain (`323a6ac8-...`) mendapat `null` dari GET → `setting = null` → `handleSave` return early
- **Fix**: GET handler auto-create baris default `pengaturan` jika belum ada untuk sekolah tersebut, menggunakan event pertama sekolah sebagai `event_id`

### Error Handling Improvement
- `src/app/admin/pengaturan/page.tsx`: catch blocks sekarang menampilkan error message asli (bukan "Gagal terhubung ke server" generic), tambah `console.error` untuk debugging

### Files
| File | Status |
|------|--------|
| `src/app/api/admin/settings/route.ts` | **Edit** (+ auto-create default on GET) |
| `src/app/admin/pengaturan/page.tsx` | **Edit** (+ better error messages) |

---

---

## 2025-05-22 — Musik Latar (pindah ke Konten Undangan)

### Migration
- **Baru**: `supabase/migrations/20250522000000_add_music_url_to_konten.sql`
- `ALTER TABLE konten_undangan ADD COLUMN music_url TEXT NOT NULL DEFAULT ''`

### API Route `/api/admin/konten-undangan`
- **PUT**: Terima & simpan `music_url` di payload + basePayload
- GET: `music_url` otomatis termasuk karena `select("*")`

### Admin Page: `/admin/konten-undangan`
- **KontenData**: tambah field `music_url`
- **State**: `setMusicUrl` di fetchKonten, `musicUrl` di handleSave
- **UI**: Section "Musik Latar" dengan icon Music + input URL MP3 + helper text

### Floating MusicPlayer Component
- **`src/app/undangan/[token]/MusicPlayer.tsx`** (baru):
  - Floating button fixed bottom-center dengan glassmorphism style
  - HTML5 `<audio>` dengan `loop` + `preload="auto"`
  - Tombol play/pause dengan ikon SVG
  - Animasi bar berputar saat play (Framer Motion)
  - Auto-hide saat scroll ke bawah, muncul saat scroll ke atas
  - `AnimatePresence` untuk smooth enter/exit

### Integrasi Undangan
- **`src/app/undangan/[token]/page.tsx`**: Baca `music_url` dari `kontenData` (langsung dari konten_undangan table), kirim sebagai prop `musicUrl`
- **`src/app/undangan/[token]/demo/page.tsx`**: Sama, kirim `musicUrl={konten.music_url}`
- **`src/app/undangan/[token]/InvitationClient.tsx`**: Tambah prop `musicUrl`, render `<MusicPlayer>` jika URL tersedia, tambah `pb-20` untuk spacing

### Revert
- **`src/app/admin/pengaturan/page.tsx`**: Hapus section musik yang sebelumnya ditambahkan
- **`src/app/api/admin/settings/route.ts`**: Hapus `music_url` dari ALLOWED_KEYS

### Files
| File | Status |
|------|--------|
| `supabase/migrations/20250522000000_add_music_url_to_konten.sql` | **Baru** |
| `src/lib/database.types.ts` | **Edit** (+ music_url di konten_undangan) |
| `src/app/api/admin/konten-undangan/route.ts` | **Edit** (+ music_url di PUT) |
| `src/app/admin/konten-undangan/page.tsx` | **Edit** (+ input musik) |
| `src/app/undangan/[token]/MusicPlayer.tsx` | **Baru** |
| `src/app/undangan/[token]/page.tsx` | **Edit** (fetch music_url dari konten) |
| `src/app/undangan/demo/page.tsx` | **Edit** (+ musicUrl prop) |
| `src/app/undangan/[token]/InvitationClient.tsx` | **Edit** (+ musicUrl prop + render) |
| `src/app/admin/pengaturan/page.tsx` | **Revert** (hapus section musik) |
| `src/app/api/admin/settings/route.ts` | **Revert** (hapus music_url) |

*Diupdate pada: 22 Mei 2026*

---

## 2025-05-24 — Musik Upload + Auto-Play + Hydration Fix

### music_auto_play Column
- **Migration**: `supabase/migrations/20250522000000_add_music_url_to_konten.sql` (sudah include, di-apply via psql)
- `ALTER TABLE konten_undangan ADD COLUMN music_auto_play BOOLEAN NOT NULL DEFAULT false`
- **Types**: `src/lib/database.types.ts` — tambah `music_auto_play` di Row/Insert/Update

### Upload Musik ke Supabase Storage
- **Migration baru**: `supabase/migrations/20250523000000_add_music_storage.sql`
- Bucket `school-music` (public, max 10MB, audio/mpeg, audio/wav, audio/ogg, audio/aac, audio/flac)
- **API baru**: `src/app/api/admin/upload-music/route.ts`
  - Auth check via JWT admin
  - Validasi file: ekstensi + MIME type audio, max 10MB
  - Hapus file lama dari storage jika ada (ambil path dari `music_url` existing)
  - Upload file baru + update `konten_undangan.music_url`
- **Admin UI**: `src/app/admin/konten-undangan/page.tsx`
  - Input file upload (mirip upload logo) — ganti input URL teks
  - Tombol "Ganti Musik" / "Pilih File Musik"
  - Loading state saat upload
  - Tampilkan URL file saat sudah terupload + tombol Hapus
  - Helper text: file lama otomatis dihapus saat ganti lagu

### Auto-Play Music
- **MusicPlayer.tsx**: Tambah prop `autoPlay`
- Saat `autoPlay=true`, pasang one-time listener `click`/`touchstart` di document
- Musik auto play saat user pertama kali tap/klik di halaman (browser policy compliant)
- **page.tsx [token] & demo**: Baca `music_auto_play` dari DB, kirim sebagai `musicAutoPlay` prop
- **InvitationClient.tsx**: Terima & teruskan `musicAutoPlay` ke MusicPlayer

### Hydration Fix — Countdown
- `InvitationClient.tsx` — `useCountdown` hook: ganti `useState(calc)` → `useState({d:0,h:0,m:0,s:0})`, pindah update nilai ke `useEffect` setelah hidrasi
- Mencegah mismatch server/client karena `Date.now()` berbeda

### Files
| File | Status |
|------|--------|
| `supabase/migrations/20250523000000_add_music_storage.sql` | **Baru** |
| `src/app/api/admin/upload-music/route.ts` | **Baru** |
| `src/lib/database.types.ts` | **Edit** (+ `music_auto_play`) |
| `src/app/admin/konten-undangan/page.tsx` | **Edit** (+ upload musik UI) |
| `src/app/undangan/[token]/MusicPlayer.tsx` | **Edit** (+ autoPlay prop + one-tap autoplay) |
| `src/app/undangan/[token]/InvitationClient.tsx` | **Edit** (+ musicAutoPlay prop, hydration fix) |
| `src/app/undangan/[token]/page.tsx` | **Edit** (+ fetch music_auto_play) |
| `src/app/undangan/demo/page.tsx` | **Edit** (+ musicAutoPlay prop) |

*Diupdate pada: 24 Mei 2026*

---

## 2026-05-27 — Guest Activity Log (Persistent Memory)

### Table Baru: `guest_activity_log`
- `id` UUID PK, `tamu_id` UUID FK → tamu (CASCADE), `event_id` UUID FK → events (CASCADE)
- `activity_type` VARCHAR(50): invitation_viewed, music_played, music_toggled, map_clicked, youtube_clicked, rsvp_submitted, rsvp_updated
- `metadata` JSONB (default `{}`), `created_at` TIMESTAMPTZ (default now)
- Indexes: tamu_id, event_id, activity_type, created_at DESC
- RLS: admin SELECT + INSERT via `event_id IN (events milik sekolah admin)`

### Migration
- File: `supabase/migrations/20260527031823_add_guest_activity_log.sql`

### API Routes
- **POST `/api/activity/track`**: Public, terima `{token, activity_type, metadata}`, lookup tamu, insert log
- **GET `/api/admin/activity?event_id=`**: Admin auth, return log + tamu data, pagination support

### Integrasi
- **InvitationClient.tsx**: `useEffect` track `invitation_viewed` saat halaman undangan dimuat
- **RSVP route**: track `rsvp_submitted` pada insert, `rsvp_updated` pada update

### Persistent Memory System
- **AGENTS.md**: File baru di root proyek — persistent memory lintas sesi (dibaca otomatis tiap sesi)
- **opencode.json**: Command `memory` di-upgrade — sekarang update AGENTS.md + MEMORY.md + commit

### Files
| File | Status |
|------|--------|
| `AGENTS.md` | **Baru** |
| `supabase/migrations/20260527031823_add_guest_activity_log.sql` | **Baru** |
| `src/app/api/activity/track/route.ts` | **Baru** |
| `src/app/api/admin/activity/route.ts` | **Baru** |
| `src/lib/database.types.ts` | **Edit** (+ convenience types) |
| `src/app/undangan/[token]/InvitationClient.tsx` | **Edit** (+ track invitation_viewed) |
| `src/app/api/rsvp/route.ts` | **Edit** (+ RSVP upsert + track activity) |
| `opencode.json` | **Edit** (upgrade memory command) |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — Guest Memories (Key-Value per Tamu)

### Table Baru: `guest_memories`
- `id` UUID PK, `tamu_id` UUID FK → tamu (CASCADE), `key` VARCHAR(100), `value` JSONB
- `created_at` + `updated_at` TIMESTAMPTZ
- UNIQUE constraint: `(tamu_id, key)` — upsert-friendly
- Index: `idx_memories_tamu` on tamu_id
- RLS: admin SELECT/INSERT/UPDATE via EXISTS check (tamu → event → sekolah admin)

### Migration
- File: `supabase/migrations/20260527032636_add_guest_memories.sql`

### API Routes
- **GET `/api/memories?token=&key=`**: Public, baca memories per guest (optional filter by key)
- **POST `/api/memories`**: Public, upsert memory `{token, key, value}`
- **GET `/api/admin/memories?event_id=`**: Admin auth, lihat semua memories per event

### Auto-Track di `/api/activity/track`
- `invitation_viewed` → otomatis increment `invitation_view_count` di `guest_memories`
- Menyimpan: `{ count, first_viewed_at, last_viewed_at }`
- `first_viewed_at` tetap, hanya `count` dan `last_viewed_at` yang diupdate

### Files
| File | Status |
|------|--------|
| `supabase/migrations/20260527032636_add_guest_memories.sql` | **Baru** |
| `src/app/api/memories/route.ts` | **Baru** |
| `src/app/api/admin/memories/route.ts` | **Baru** |
| `src/app/api/activity/track/route.ts` | **Edit** (+ auto-track view_count) |
| `src/lib/database.types.ts` | **Regenerate** |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — Admin Memories (Preferensi Admin Lintas Sesi)

### Table Baru: `admin_memories`
- `id` UUID PK, `admin_id` UUID FK → auth.users (CASCADE), `sekolah_id` UUID FK → sekolah (CASCADE)
- `key` VARCHAR(100), `value` JSONB
- `created_at` + `updated_at` TIMESTAMPTZ
- UNIQUE constraint: `(admin_id, sekolah_id, key)`
- Indexes: admin_id, sekolah_id
- RLS: admin hanya bisa akses memories miliknya sendiri (`admin_id = auth.uid()`)

### Migration
- File: `supabase/migrations/20260527033052_add_admin_memories.sql`

### API Routes
- **GET `/api/admin/admin-memories?key=`**: Admin auth, baca memories admin sendiri (optional filter by key)
- **POST `/api/admin/admin-memories`**: Admin auth, upsert memory `{key, value}`
- **DELETE `/api/admin/admin-memories?key=`**: Admin auth, hapus memory

### Files
| File | Status |
|------|--------|
| `supabase/migrations/20260527033052_add_admin_memories.sql` | **Baru** |
| `src/app/api/admin/admin-memories/route.ts` | **Baru** |
| `src/lib/database.types.ts` | **Regenerate** |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — Activity Feed di Dashboard Admin

### UI: Live Activity Feed
- Komponen `ActivityCard` diubah dari hardcoded dummy data → live fetch dari API
- Fetch data dari `GET /api/admin/activity?event_id=&limit=10` via `useEffect`
- Timeline real-time: waktu, label (VIEW/RSVP/MUSIC/MAP/CHECKIN), nama tamu, deskripsi
- Loading state + empty state ("Belum ada aktivitas")

### Activity Type Labels & Colors
| Type | Label | Warna |
|------|-------|-------|
| invitation_viewed | VIEW | Gold |
| rsvp_submitted / rsvp_updated | RSVP | Sage green |
| music_played / music_toggled | MUSIC | Clay |
| map_clicked | MAP | Terracotta |
| youtube_clicked | YOUTUBE | Red |
| checkin_scanned | CHECKIN | Gold |

### Files
| File | Status |
|------|--------|
| `src/app/admin/dashboard/DashboardClient.tsx` | **Edit** (ActivityCard live fetch) |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — View Count Stats + Admin Memories Tab

### View Count Stats di Dashboard
- Fungsi baru `getViewStats()` di `page.tsx` — query `guest_memories` (key `invitation_view_count`)
- 3 stat card baru di dashboard:
  - **TOTAL DILIHAT** — total views dari semua tamu
  - **RATA-RATA** — rata-rata view per tamu
  - **BELUM DILIHAT** — jumlah tamu tanpa view
- Data dikalkulasi server-side, di-pass sebagai prop `viewStats`

### Admin Memories — Remember Tab
- Fungsi baru `getAdminMemory()` di `page.tsx` — fetch `admin_memories` by admin_id + sekolah_id + key
- **TamuTable.tsx**: terima prop `initialTab`, simpan via `initialTab` dari server
- Saat ganti tab → `saveTab()` → `POST /api/admin/admin-memories` (key: `dashboard_tamu_tab`)
- Setelah refresh → tab terakhir terselect otomatis

### Files
| File | Status |
|------|--------|
| `src/app/admin/dashboard/page.tsx` | **Edit** (+ getViewStats, getAdminMemory, pass props) |
| `src/app/admin/dashboard/DashboardClient.tsx` | **Edit** (+ viewStats cards, initialTab prop) |
| `src/components/TamuTable.tsx` | **Edit** (+ saveTab, initialTab, useEffect) |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — Halaman Daftar Tamu Terpisah

### Halaman Baru: `/admin/tamu`
- **`src/app/admin/tamu/page.tsx`**: Server component baru yang menampilkan TamuTable secara standalone
- Mengikuti styling dashboard yang sama (glass card, warm earthy tones)
- Header section dengan judul "Daftar lengkap undangan." + tombol "Tambah Tamu" dan "Upload CSV"
- Data tamu difetch server-side (sama seperti dashboard) — filter by `activeEventId`

### Sidebar Navigation Fix
- **`src/app/admin/dashboard/DashboardClient.tsx`**: `href` sidebar "Daftar Tamu" diubah dari `/admin/tamu/baru` (tambah baru) menjadi `/admin/tamu` (daftar)
- Quick actions "Tambah Tamu Manual" dan "Upload CSV" tetap di `/admin/tamu/baru` dan `/admin/tamu/upload`

### Files
| File | Status |
|------|--------|
| `src/app/admin/tamu/page.tsx` | **Baru** |
| `src/app/admin/dashboard/DashboardClient.tsx` | **Edit** (sidebar href) |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — Statistik Tamu di Halaman Daftar Tamu

### 4 Stat Card di `/admin/tamu`
- **`src/app/admin/tamu/page.tsx`**: Ditambahkan 4 stat card di atas TamuTable:
  - **TOTAL TAMU** — jumlah tamu (accent terracotta)
  - **SUDAH RSVP** — total responden (accent sage green)
  - **LAKI-LAKI** — jumlah + % dari total (accent terracotta)
  - **PEREMPUAN** — jumlah + % dari total (accent gold)
- Fungsi baru `getGenderStats()` — query `tamu.jenis_kelamin`, hitung laki/perempuan/belum
- Fungsi baru `getRsvpStats()` — query `rsvp.kehadiran_ortu` + `kehadiran_anak`, hitung offline/online/tidakHadir
- Komponen `StatCard` inline — reusable glass card dengan orbs, badge persentase

### Files
| File | Status |
|------|--------|
| `src/app/admin/tamu/page.tsx` | **Edit** (+ stat cards + getGenderStats + getRsvpStats) |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — Fix Scanner QR Code (Waterfox/Firefox Bug)

### Bug: Scanner Ganda di Waterfox (Firefox)
- **Root cause**: React Strict Mode di dev melakukan mount → unmount → mount ulang komponen. `scannerRef.current?.clear()` bersifat **async** tapi tidak di-`await`, sehingga scanner pertama belum selesai dibersihkan ketika scanner kedua dibuat. Akibatnya 2 instance `Html5QrcodeScanner` berjalan pada element `#qr-reader` yang sama.
- Waterfox/Firefox lebih rentan karena perbedaan timing eksekusi async dibanding Chrome.

### Perbaikan

| Masalah | Fix |
|---------|-----|
| `clear()` async tidak di-await | `destroyScanner()` — fungsi async yang `await scanner.clear()` sebelum set `null` |
| Scanner ganda di Strict Mode | Guard `if (scannerRef.current) return` di `startScanner()` + `mountedRef` |
| State update setelah unmount | `mountedRef.current` dicek sebelum setiap `setState` |
| `#qr-reader` di-remove dari DOM | Ganti `{status ? A : B}` dengan `hidden` CSS — div scanner selalu di DOM |
| `waitForElement` polling | Hapus — tidak perlu; element sudah ada saat mount |
| `handleScanRef` indirection | Logic handle scan langsung di inline callback `scanner.render()` |

### Files
| File | Status |
|------|--------|
| `src/app/scan/page.tsx` | **Rewrite** — lifecycle async proper, `mountedRef`, `destroyScanner()`, no conditional DOM removal |

*Diupdate pada: 27 Mei 2026*

---

## 2026-05-27 — Fix Camera LED + Double Scanner on Re-mount

### Bug 1: Kamera LED Tetap Nyala Setelah Back
- **Root cause**: `destroyScanner()` dulu async — cleanup panggil tanpa `await`, jadi `scanner.clear()` jalan async. Tapi React hapus DOM sebelum `clear()` selesai → error silent → track kamera gak ke-stop.
- **Fix**: `stopCameraTracks()` synchronous di cleanup — stop semua video tracks langsung (`srcObject.getTracks().forEach(t => t.stop())`), tanpa nunggu `clear()`.

### Bug 2: Scanner Muncul 2 Saat Balik ke Halaman Scan
- **Root cause**: Saat navigasi balik, cleanup dari kunjungan sebelumnya mulai `scanner.clear()` async. Mount baru bikin scanner baru. `clear()` yang masih jalan akhirnya hapus DOM milik scanner baru.
- **Fix**: `pendingClearRef` — Promise dari `scanner.clear()` disimpan di ref. `startScanner()` **await** promise ini sebelum buat scanner baru, memastikan `clear()` lama selesai total.

### Bug 3: Setelah Double Scanner, Stop/Start Error + Kamera Gak Bisa Mati
- **Root cause**: Akibat bug 2, DOM scanner baru dirusak oleh `clear()` lama. State internal scanner dan DOM mismatch → error. Kamera tetap nyala karena cleanup selanjutnya juga gagal.
- **Fix**: Sama dengan bug 2 — `pendingClearRef` mencegah tabrakan antar scanner instance.

### Perubahan Arsitektur
| Sebelum | Sesudah |
|---------|---------|
| `destroyScanner()` async — await `clear()` lalu null ref | `destroyScanner()` sync — null ref dulu, fire `clear()` async via `pendingClearRef` |
| `startScanner()` langsung render | `startScanner()` await `pendingClearRef.current` dulu |
| `resetScanner()` sync, fire-and-forget | `resetScanner()` async, await `startScanner()` |

### Files
| File | Status |
|------|--------|
| `src/app/scan/page.tsx` | **Edit** — `pendingClearRef`, `stopCameraTracks`, sync `destroyScanner` |
| `.gitignore` | **Edit** — `docs` → `docs/*` + `!docs/MEMORY.md` |

*Diupdate pada: 27 Mei 2026*
