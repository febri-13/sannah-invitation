# AGENTS.md — Persistent Memory untuk sannah-invitation

> File ini dibaca otomatis tiap sesi baru. Diupdate otomatis di akhir sesi via command `memory`.

---

## 🚨 ATURAN WAJIB (TIDAK BISA DIGANGGU GUGAT)

1. **Schema database HANYA `undangan`** — schema `public` dan lainnya tidak boleh disentuh dalam kondisi apapun.
2. **Sebelum setiap akses/ubah database**, saya WAJIB menjelaskan dampaknya terlebih dahulu dan menunggu persetujuan eksplisit dari user sebelum mengeksekusi.
3. Aturan ini tidak memiliki kelonggaran dan tidak bisa dilanggar.

---

## 📋 Ringkasan Proyek

**Aplikasi:** Undangan Online Akhirusannah (perpisahan sekolah)
**Stack:** Next.js 16.2.6 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (PostgreSQL + Auth + Storage)
**Deploy:** Vercel — https://sannah-invitation.vercel.app
**Repo:** https://github.com/febri-13/sannah-invitation

### Multi-tenancy
- 1 admin = 1 sekolah (via JWT `app_metadata.sekolah_id`)
- 1 sekolah = many events
- 1 event = 1 konten_undangan, many tamu, many rsvp

---

## 🏗️ Arsitektur

```
src/
├── app/
│   ├── api/            # API routes (tamu, rsvp, checkin, admin/*)
│   ├── admin/          # Admin pages (login, dashboard, tamu, pengaturan, konten)
│   ├── undangan/       # Guest pages ([token], demo)
│   └── scan/           # QR scanner check-in
├── components/
│   ├── TamuTable.tsx   # Tabel tamu + WA actions
│   └── ornaments/      # Islamic ornaments (header arch, divider, corner accent)
├── lib/
│   ├── supabase/       # client.ts, server.ts, admin.ts
│   ├── database.types.ts  # Auto-generated Supabase types
│   ├── schemas.ts      # Zod validations
│   ├── themes.ts       # 3 themes: glass-premium, classic-gold, modern-sage
│   ├── utils.ts        # generateToken, formatDate, generateWhatsAppLink
│   └── event-cookie.ts # Active event cookie management
└── proxy.ts            # Centralized auth guard (Next.js 16 proxy)
```

### Database Tables
| Table | Fungsi |
|-------|--------|
| `sekolah` | Data sekolah (nama, alamat, logo) |
| `events` | Event per sekolah (slug, is_active) |
| `tamu` | Data tamu/guest (token, nama, WA, kelas) |
| `konten_undangan` | Konten undangan per event (teks, agenda, musik, tema) |
| `rsvp` | Konfirmasi kehadiran (ortu/anak) |
| `checkin` | Check-in QR scan |
| `pengaturan` | Key-value settings (WA template) per sekolah+event |
| `guest_activity_log` | Riwayat aktivitas tamu (lihat undangan, RSVP, play musik, dll) |
| `guest_memories` | Key-value preferences per tamu |
| `admin_memories` | Preferensi admin lintas sesi |

### Storage Buckets
- `school-logos` — Logo sekolah (max 2MB)
- `school-music` — Musik latar (max 10MB)

---

## ✅ Fitur yang Sudah Dibangun

| Fitur | Selesai |
|-------|---------|
| Auth admin (email/password + proxy guard) | ✅ |
| CRUD tamu (tambah manual + CSV upload + hapus) | ✅ |
| Halaman undangan guest (glassmorphism, 3 tema) | ✅ |
| RSVP orang tua (Offline/Online/Tidak Hadir) + jumlah stepper, anak (Hadir/Tidak Hadir) | ✅ |
| QR check-in scanner | ✅ |
| Dashboard admin (statistik, donut charts, daftar tamu) | ✅ |
| Template WhatsApp (editable, event-scoped) | ✅ |
| Multi-event support (event switcher, create event) | ✅ |
| Konten undangan editable (admin form) | ✅ |
| Logo sekolah (upload + tampil di undangan) | ✅ |
| Musik latar (upload storage + auto-play) | ✅ |
| 3 themes (glass-premium, classic-gold, modern-sage) | ✅ |
| Guest activity log (tracking interaksi tamu) | ✅ |
| Guest memories (key-value preferences per tamu) | ✅ |
| Admin memories (preferensi admin lintas sesi) | ✅ |
| Halaman Daftar Tamu terpisah (dengan statistik) | ✅ |
| Column visibility toggle (pilih kolom tabel tamu) | ✅ |
| Edit tamu (inline modal + PUT API) | ✅ |
| Batch delete tamu (multi-select + konfirmasi) | ✅ |
| Layout config (admin UI: visibility, urutan, label, warna; inline panel editor per section; dynamic render) | ✅ |
| Footer sub-item editor (5 item: header_arabic, footer_text, hormat_label, keluarga_label, sekolah_nama — urutan, visibilitas, teks editable) | ✅ |

---

## 🔄 Sesi Terakhir

**Sesi: 2026-05-31 (sesi 30) — Footer sub-item editor (full editable)**

- **Selesai:** Tambah migration `footer_hormat_label` & `footer_keluarga_label` di tabel `konten_undangan`
- **Selesai:** Tambah `FooterConfig` di `layout_config` JSON — 5 sub-item footer (header_arabic, footer_text, hormat_label, keluarga_label, sekolah_nama) bisa diatur urutan, visibilitas, dan teks
- **Selesai:** Update admin Konten Undangan — footer editor jadi sub-item list dengan panah urutan, checkbox visibilitas, dan input teks per item
- **Selesai:** Update `InvitationClient` — render footer sub-item dinamis dari `footer_config`
- **Belum selesai:** —

---

## 📝 Catatan Penting

- **Schema:** Semua tabel di schema `undangan` (bukan `public`). Client init pakai `db: { schema: "undangan" }` + generic `<Database, "undangan">`
- Migration files ada di `supabase/migrations/`
- Gunakan `pnpm dev` untuk development server
- Build: `pnpm build`
- Generate types: `pnpm gen:types`
- Ganti font: di `src/app/layout.tsx` (Plus Jakarta Sans, Cormorant Garamond, Amiri, JetBrains Mono)
- **JANGAN** commit file/folder yang ada di `.gitignore` (termasuk `docs/`) — gunakan `git add` biasa tanpa `-f` kecuali jika user secara eksplisit meminta commit file tersebut.
- **Backup:** Setiap trigger/fungsi yang dihapus di-backup di `supabase/migrations/backup-*.sql`

---

## ⚠️ Pending / Known Issues

- **Export Data** — Belum ada export tamu/RSVP ke CSV
- **Multi-language** — Belum ada i18n (saat ini hanya Bahasa Indonesia)
- **WA Broadcast** — Belum ada fitur kirim WA massal
- **Generate types** — `supabase gen:types --linked` gagal karena butuh `SUPABASE_DB_PASSWORD`, sementara env tidak tersedia. Update types harus manual
- **Zod regex nama_siswa terlalu ketat** — `src/lib/schemas.ts:4` regex `/^[a-zA-Z\s.']+$/` tidak izinkan karakter `-` (hyphen), padahal beberapa nama Indonesia mengandung hyphen (contoh: Az-Zahra)

---

*Terakhir diupdate: 2026-05-31 (sesi 30)*
