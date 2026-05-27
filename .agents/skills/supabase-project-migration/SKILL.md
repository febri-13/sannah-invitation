---
name: supabase-project-migration
description: "Use when migrating a Supabase project from one project to another, including custom schema changes (public → custom schema), linking new projects via CLI, seeding data, and handling common errors."
metadata:
  author: sannah-invitation
  version: "1.0.0"
---

# Supabase Project Migration

## Overview

Langkah-langkah migrasi project Supabase ke project baru dengan schema kustom.

---

## 1. Migration Files — Rewrite Schema

Jika ingin pindah dari schema `public` ke schema kustom (misal `undangan`):

### Pola penggantian pada setiap file migration:

| Pattern | Ganti dengan |
|---------|-------------|
| `CREATE TABLE <tbl>` | `CREATE TABLE <schema>.<tbl>` |
| `ALTER TABLE <tbl>` | `ALTER TABLE <schema>.<tbl>` |
| `CREATE INDEX ... ON <tbl>` | `CREATE INDEX ... ON <schema>.<tbl>` |
| `DROP/CREATE POLICY ... ON <tbl>` | `... ON <schema>.<tbl>` |
| `REFERENCES <tbl>(col)` | `REFERENCES <schema>.<tbl>(col)` |
| `INSERT INTO <tbl>` | `INSERT INTO <schema>.<tbl>` |
| `UPDATE <tbl>` | `UPDATE <schema>.<tbl>` |
| `SELECT ... FROM <tbl>` | `SELECT ... FROM <schema>.<tbl>` |
| `CREATE FUNCTION <fn>()` | `CREATE FUNCTION <schema>.<fn>()` |
| Panggilan fungsi `<fn>()` di policy | `<schema>.<fn>()` |

### Jangan lupa:
- Tambah `CREATE SCHEMA IF NOT EXISTS <schema>;` di migration pertama
- Storage bucket migrations tetap pakai `storage.` schema (tidak diubah)
- `REFERENCES auth.users(...)` tetap pakai `auth.` (tidak diubah)

---

## 2. Konfigurasi API & Client

### `supabase/config.toml`
```toml
[api]
schemas = ["<schema>", "public", "graphql_public"]
#                                   ^ jangan hapus public — diperlukan oleh supabase internal
```

### `src/lib/database.types.ts`
- Ubah key `public: { Tables: { ... } }` → `<schema>: { Tables: { ... } }`
- Biarkan key `graphql_public` tetap ada
- `DefaultSchema` harus mengarah ke key baru

### Client initialization (3 files + proxy.ts)
Setiap `createBrowserClient`, `createServerClient`, `createClient` harus:

```typescript
createClient<Database, "<schema>">(url, key, {
  db: { schema: "<schema>" },
})
```

Generic parameter kedua (`"<schema>"`) WAJIB diberikan agar TypeScript tahu key mana di `Database` type yang digunakan.

---

## 3. Deploy ke Project Baru

### 3.1 Login
```bash
supabase login
# atau dengan token:
supabase login --token sbp_xxxxx
```

### 3.2 Link project
```bash
supabase unlink                                          # lepas project lama
SUPABASE_ACCESS_TOKEN=sbp_xxxxx supabase link --project-ref <REF>
# ^ env var SUPABASE_ACCESS_TOKEN lebih reliable daripada supabase login
```

### 3.3 Push migrations
```bash
SUPABASE_ACCESS_TOKEN=sbp_xxxxx SUPABASE_DB_PASSWORD=<pass> supabase db push
```

### 3.4 Expose schema ke REST API (via Management API)
```bash
curl -X PATCH "https://api.supabase.com/v1/projects/<REF>/postgrest" \
  -H "Authorization: Bearer sbp_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"db_schema": "<schema>, public, graphql_public", "db_extra_search_path": "public, extensions"}'
```

### 3.5 Grant permissions ke schema
```bash
curl -X POST "https://api.supabase.com/v1/projects/<REF>/database/query" \
  -H "Authorization: Bearer sbp_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"query": "GRANT USAGE ON SCHEMA <schema> TO anon, authenticated, service_role; GRANT ALL ON ALL TABLES IN SCHEMA <schema> TO anon, authenticated, service_role; GRANT ALL ON ALL SEQUENCES IN SCHEMA <schema> TO anon, authenticated, service_role;"}'
```

---

## 4. Seed Data Awal

Gunakan REST API dengan service_role key:

```bash
# Headers untuk semua request:
#   -H "apikey: <service_role_key>"
#   -H "Authorization: Bearer <service_role_key>"
#   -H "Accept-Profile: <schema>"
#   -H "Content-Profile: <schema>"
#   -H "Content-Type: application/json"
```

### 4.1 Buat sekolah
```bash
curl -X POST "https://<REF>.supabase.co/rest/v1/sekolah" \
  -H "apikey: <service_role_key>" \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Accept-Profile: <schema>" \
  -H "Content-Profile: <schema>" \
  -H "Prefer: return=representation" \
  -d '{"nama": "Nama Sekolah", "alamat": "Alamat"}'
```

### 4.2 Buat event
```bash
curl -X POST "https://<REF>.supabase.co/rest/v1/events" \
  ...headers...
  -d '{"sekolah_id": "<id>", "nama": "Akhirusannah", "slug": "akhirusannah", "is_active": true}'
```

### 4.3 Buat konten undangan
```bash
curl -X POST "https://<REF>.supabase.co/rest/v1/konten_undangan" \
  ...headers...
  -d '{"sekolah_id": "<id>", "event_id": "<id>", "judul": "Akhirusannah", ...}'
```

### 4.4 Seed WA template
```bash
curl -X POST "https://<REF>.supabase.co/rest/v1/pengaturan" \
  ...headers...
  -d '{"sekolah_id": "<id>", "event_id": "<id>", "key": "wa_template_invitation", "label": "Template Pesan Undangan WhatsApp", ...}'
```

### 4.5 Buat admin user
Gunakan `@supabase/supabase-js` via Node.js (service_role key):

```javascript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('https://<REF>.supabase.co', '<service_role_key>')
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'password',
  email_confirm: true,
  app_metadata: { sekolah_id: '<id>' }
})
```

> **Catatan:** Service role key format baru (`sb_secret_...`) TIDAK bisa dipakai langsung di `Authorization: Bearer` untuk Auth Admin API. Gunakan `@supabase/supabase-js` npm package yang menangani konversi key secara internal.

---

## 5. Common Errors & Solusi

### ❌ `"Your account does not have the necessary privileges"`
**Penyebab:** Token/akun CLI tidak punya akses ke project.
**Solusi:** Generate token dari akun yang benar (yang project-nya), atau gunakan `SUPABASE_ACCESS_TOKEN` env var.

### ❌ `"Only the following schemas are exposed: public, graphql_public"`
**Penyebab:** Schema baru belum ditambahkan ke PostgREST config.
**Solusi:** PATCH via Management API (lihat 3.4).

### ❌ `"permission denied for schema undangan"`
**Penyebab:** Role `anon`/`authenticated` belum dapat GRANT.
**Solusi:** Grant permissions via SQL (lihat 3.5).

### ❌ `"Database error creating new user"` saat create admin
**Penyebab:** Trigger `trg_on_auth_user_created` yang refer ke tabel `profiles` (tidak ada).
**Solusi:** Hapus trigger & fungsi:
```sql
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
```
Backup dulu sebelum hapus (simpan di `supabase/migrations/backup-*.sql`).

### ❌ `"column mengandung null values"` saat ADD PRIMARY KEY
**Penyebab:** Seed data lama tidak memiliki kolom yang dijadikan PK.
**Solusi:** Hapus atau backfill row orphan sebelum ADD PK:
```sql
DELETE FROM <schema>.<tbl> WHERE <col> IS NULL;
```

### ❌ IPv6 unreachable saat konek ke database
**Penyebab:** Database Supabase hanya punya IPv6.
**Solusi:** Gunakan koneksi pooler di port 6543, atau REST API via HTTPS.

---

## 6. Backup

Setiap trigger/fungsi yang dihapus harus di-backup:
- Simpan di `supabase/migrations/backup-<deskripsi>.sql`
- Format backup: definisi lengkap fungsi + trigger (comment-out trigger DDL)

---

## 7. Catatan Penting

- `supabase db push` hanya menjalankan SQL, tidak mengupdate config API PostgREST
- Service role key format `sb_secret_...` tidak bisa diparsing sebagai JWT — hanya bisa via library
- Auth Admin API memerlukan JWT service role dalam format `eyJ...` (legacy), bukan `sb_secret_`
- Untuk interaksi REST API dengan schema non-public, wajib kirim header `Accept-Profile: <schema>` dan `Content-Profile: <schema>`
