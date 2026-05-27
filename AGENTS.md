# AGENTS.md — Persistent Memory untuk sannah-invitation

> File ini dibaca otomatis tiap sesi baru. Diupdate otomatis di akhir sesi via command `memory`.

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
| CRUD tamu (manual + CSV upload) | ✅ |
| Halaman undangan guest (glassmorphism, 3 tema) | ✅ |
| RSVP dual-selection (ortu: Offline/Online/Tidak Hadir, anak: sama) | ✅ |
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

---

## 🔄 Sesi Terakhir

**Sesi: 2026-05-27 — Implementasi Guest Activity Log + Guest Memories**
- Mempelajari Hermes Agent dari NousResearch (persistent memory system)
- Membuat AGENTS.md sebagai persistent memory lintas sesi
- Upgrade command `memory` di opencode.json (update AGENTS.md + MEMORY.md)
- **Selesai:** Implementasi tabel `guest_activity_log` + API routes + integrasi di halaman undangan dan RSVP
- **Selesai:** Implementasi tabel `guest_memories` + API routes + auto-track view count
- **Selesai:** Implementasi tabel `admin_memories` + API routes
- **Belum selesai:** —

---

## 📝 Catatan Penting

- Supabase MCP sudah terkonfigurasi di opencode.json (project ref: `djotfszjcnmjhcwhtxbe`)
- Migration files ada di `supabase/migrations/`
- Gunakan `pnpm dev` untuk development server
- Build: `pnpm build`
- Generate types: `pnpm gen:types`
- Ganti font: di `src/app/layout.tsx` (Plus Jakarta Sans, Cormorant Garamond, Amiri, JetBrains Mono)

---

## ⚠️ Pending / Known Issues

1. **WA Broadcast** — Belum ada fitur kirim WA massal
3. **Export Data** — Belum ada export tamu/RSVP ke CSV
4. **Multi-language** — Belum ada i18n (saat ini hanya Bahasa Indonesia)

---

*Terakhir diupdate: 2026-05-27 (sesi 2)*
