# Design System — Undangan Wisuda

> Category: Editorial Islamic · Warm Earthy
> Sistem desain untuk undangan wisuda & pelepasan siswa SDIT Al-Hikmah.
> Menggabungkan tiga arah ekspresi visual (Geometric, Glass, Editorial) di atas
> satu pondasi token yang sama.

---

## 1. Visual Theme & Atmosphere

Modern Islamic invitation dengan nuansa warm earthy (terracotta, cream, sage).
Mengutamakan tipografi, ornamen Islamic geometric yang halus, dan ritme spasi yang
tenang. Tujuan: terasa khidmat, hangat, dan trendi tanpa kehilangan kesan Islami.

- **Visual style:** editorial, tipografi-forward, ornamen Islamic geometric, warm earthy palette
- **Color stance:** primary (terracotta), neutral surface (cream/offwhite), ink, sage accent, gold highlight
- **Design intent:** Konsisten dengan identitas Islami sambil mengangkat presisi
  layout ala majalah modern dan tekstur material yang premium.

Tiga arah ekspresi visual berbagi token yang sama:

1. **Bold Islamic Geometric** — pola arabesque (segi-8 star), mihrab arch hero,
   ornamental dividers, terracotta dominan.
2. **Premium Glassmorphism** — frosted cards di atas warm gradient + blurred orbs,
   shadow soft, border luminous.
3. **Editorial Modern** — magazine grid, italic serif display besar, mono labels,
   garis pemisah tipis, banyak whitespace.

---

## 2. Color

Palet warm earthy menggantikan biru `#1856FF` lama.

### Primary scale
| Token              | Value      | Pakai untuk                                       |
|--------------------|------------|---------------------------------------------------|
| `--terracotta`     | `#C26A4A`  | Primary action, accent, focus, badge aktif        |
| `--clay`           | `#8B4A2F`  | Background dark section, hover/primary-pressed    |
| `--gold`           | `#C9A35E`  | Highlight, secondary CTA on dark, garis aksen     |

### Neutrals / surface
| Token              | Value      | Pakai untuk                                       |
|--------------------|------------|---------------------------------------------------|
| `--offwhite`       | `#FBF7EE`  | Background body, surface tertinggi                |
| `--cream`          | `#F5EEE0`  | Surface card, alternating section bg              |
| `--ink`            | `#2A2520`  | Body text, headings, hairline border              |
| `--ink/70`         | `#5b4b3e`  | Secondary text                                    |
| `--ink/55`         | `#7a6655`  | Tertiary text, captions, mono labels              |

### Functional accents
| Token              | Value      | Pakai untuk                                       |
|--------------------|------------|---------------------------------------------------|
| `--sage`           | `#8FA68B`  | Soft info accent, gallery tone                    |
| `--sage-deep`      | `#5C7058`  | Success state (RSVP terkirim, check-in aktif)     |

### Mapping ke token lama (migrasi)
| Lama (DESIGN.md v1)        | Baru                                |
|----------------------------|-------------------------------------|
| `--color-primary #1856FF`  | `--terracotta #C26A4A`              |
| `--color-secondary #3A344E`| `--clay #8B4A2F` atau `--ink #2A2520`|
| `--color-success #07CA6B`  | `--sage-deep #5C7058`               |
| `--color-warning #E89558`  | `--gold #C9A35E`                    |
| `--color-danger #EA2143`   | tetap (atau `#B5403B` versi muted)  |
| `--color-surface #FFFFFF`  | `--offwhite #FBF7EE`                |
| `--color-text #141414`     | `--ink #2A2520`                     |

### Rules
- **Terracotta** untuk CTA primer, link, focus ring, badge aktif. Jangan dipakai untuk body text.
- **Cream / offwhite** untuk background besar dan permukaan card. Hindari pure white `#FFFFFF`.
- **Clay** sebagai background section gelap (hero, ayat, RSVP) — pair dengan cream foreground.
- **Gold** hanya sebagai aksen pada permukaan gelap. Tidak untuk text body di permukaan terang (kontras rendah).
- **Sage** hanya untuk info/success state dan tone gallery; jangan jadi warna brand utama.

---

## 3. Typography

| Role        | Family                  | Weight             | Catatan                              |
|-------------|-------------------------|--------------------|--------------------------------------|
| Display     | **Cormorant Garamond**  | 300 / 400 / 500    | Italic untuk judul utama, headline, "voice" |
| Body / UI   | **Plus Jakarta Sans**   | 400 / 500 / 600    | Lanjut dari sistem lama              |
| Arabic      | **Amiri**               | 400 / 700          | Bismillah, ayat, jazākumullah        |
| Mono labels | **JetBrains Mono**      | 400 / 500          | Section labels (`— DETAILS`, time codes), captions |

### Type scale (mobile, baseline 16px)
| Token          | Size  | Line  | Pakai untuk                          |
|----------------|-------|-------|--------------------------------------|
| `display-xl`   | 72px  | 0.88  | Hero italic Cormorant (V3)           |
| `display-lg`   | 42px  | 0.95  | Hero italic Cormorant (V2)           |
| `display-md`   | 30px  | 1.05  | Hero V1, section headers besar       |
| `display-sm`   | 22–24px | 1.15–1.3 | Sub-display, intro card           |
| `body-lg`      | 16px  | 1.5   | Body utama                           |
| `body`         | 14px  | 1.6   | Body sekunder                        |
| `body-sm`      | 13px  | 1.6   | Helper text                          |
| `caption`      | 11–12px | 1.5 | Caption, alamat                      |
| `mono-label`   | 9–10px | 1.4  | Letter-spacing `0.22em–0.30em`, UPPER |
| `arabic`       | 22–28px | 1.5–1.8 | Ayat, bismillah                   |

### Rules
- **Cormorant italic** memberi karakter — gunakan untuk headline, sub-display, dan section title. Hindari untuk body.
- **Mono labels** selalu UPPERCASE dengan letter-spacing ≥ `0.22em`. Berfungsi sebagai eyebrow/section marker pengganti garis.
- **Arabic text** harus selalu dalam Amiri (atau Noto Naskh sebagai fallback) — jangan biarkan rendering default sans.
- **Jangan campur** lebih dari 2 weight Cormorant dalam satu screen.

---

## 4. Spacing & Grid

- **Base unit:** 4px. Spacing pakai kelipatan 4 (4, 8, 12, 16, 20, 24, 32, 40, 48).
- **Section padding:** vertikal `30–44px`, horizontal `22–28px` di mobile (390px).
- **Card padding:** internal `22–28px`, antar-card `8–10px` (V2 glass) atau `0` dengan hairline separator (V3 editorial).
- **Grid:** mobile-first, lebar konten max **390px** untuk frame undangan, dengan opsi 2-kolom (1fr 1fr) untuk gallery dan countdown chips.
- **Rhythm:** tiap section diberi pembatas — hairline `1px solid var(--ink)` (editorial), ornament divider (geometric), atau breathing space `0` (glass).

---

## 5. Layout & Composition

- Hero **selalu** memuat: bismillah arabic → judul utama italic → meta strip (tanggal/waktu/lokasi).
- Setiap section dimulai dengan **mono eyebrow label** + serif italic header (kecuali full-bleed image).
- Hindari container dengan border-left accent color (anti-pattern AI-slop).
- **Asimetri ringan** dipakai di editorial (e.g. greeting card pakai vertical-rl label di kolom kiri).
- Ornamen geometric muncul sebagai **pattern background** dengan opacity `0.07–0.12`, bukan sebagai elemen utama.

### Section order (urutan invite)
1. Hero (bismillah + judul + meta strip)
2. Greeting (kepada Yth, nama orang tua, nama siswa)
3. Ayat pembuka
4. Countdown
5. Detail acara (tanggal, waktu, lokasi, link maps)
6. Susunan acara (agenda)
7. Galeri siswa
8. QR check-in
9. RSVP form (kehadiran orang tua + anak + pesan)
10. Footer (jazākumullah + signature sekolah)

---

## 6. Components

### Buttons
- **Primary:** background `--terracotta`, color `--cream`, padding `14–18px`, font mono uppercase letter-spacing `0.22em–0.28em`, no radius (editorial) atau `radius 14` (glass).
- **Secondary on dark:** background `--gold`, color `--ink`.
- **Inverted (editorial dark CTA):** background `--ink`, color `--cream`.
- Hover: translate-y `-2px` atau shadow lebih dalam; tidak ada ripple.

### RSVP segmented control
- 3 opsi dalam 1 row: `Hadir · Online · Tidak`.
- State aktif: fill `--terracotta`, color `--cream`, soft shadow.
- State idle: transparent atau frosted glass, border `1px` `--ink/25`.
- Setiap option memuat icon stroke 1.5px + label mono uppercase 9–10px.

### Cards
- **Glass card:** `rgba(255,248,235,0.55)` + `backdrop-filter: blur(22px)` + border `rgba(255,255,255,0.5)` + radius `24`.
- **Editorial card:** transparent + hairline `1px solid var(--ink)` + radius `0`.
- **Geometric card:** solid `--cream` atau `--clay` dengan ornament divider sebagai pemisah.

### Dividers / Ornament
- **Ornament divider** (V1): garis tipis kiri-kanan + medallion 8-point star di tengah (color `--terracotta`).
- **Hairline** (V3): `1px solid var(--ink)`, no shadow.
- **Soft gradient line** (V2): `linear-gradient(180deg, --terracotta, rgba(--terracotta, 0.1))`.

### Inputs
- Background semi-transparent atau transparent dengan border `1px`.
- Focus: border `--terracotta`, box-shadow ring `0 0 0 2px rgba(194,106,74,0.2)`.
- Counter karakter di bawah kanan, mono 9px, color `--ink/55`.

### QR Block
- Selalu berlatar `--offwhite` atau pure white (untuk kontras pembaca QR).
- Frame: ornament corner clips (V1) / glass chip (V2) / dashed-stub "ticket" layout (V3).
- Tampilkan badge **"AKTIF"** dengan icon check, color `--sage-deep`.

### Countdown
- 4 cell grid: HARI · JAM · MENIT · DETIK.
- Angka pakai Cormorant 28–36px, label mono uppercase 8–9px.
- Boleh berlatar terracotta (V1), frosted glass (V2), atau hairline grid (V3).

---

## 7. Motion & Interaction

- Stagger fade-in-up untuk section pertama load (delay 100–200ms per section).
- QR card pakai scale-in bounce (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- RSVP option transition `150ms ease` untuk fill + shadow.
- Countdown angka update tanpa animasi (terlalu noisy jika di-animasi setiap detik).
- Honor `prefers-reduced-motion: reduce` — disable semua animasi non-essential.

---

## 8. Voice & Brand

- Tone: **khidmat, hangat, dan ringkas**. Hindari bahasa terlalu formal/kaku.
- Salam: gunakan **"Kepada Yang Terhormat"** atau **"Kepada Yth."** untuk orang tua.
- Penyebutan siswa: **"bersama putra/putri tercinta"** + nama lengkap.
- Penutup arab + transliterasi: `جزاكم الله خيرا · Jazākumullāhu khairan`.
- Mono labels boleh dalam Inggris (`DETAILS`, `PROGRAMME`, `RSVP`) — memberikan rasa editorial; pertahankan Indonesia untuk body.

---

## 9. Anti-patterns

- **Jangan** kembali ke pure white `#FFFFFF` atau biru `#1856FF` — palet sudah dihangatkan.
- **Jangan** pakai emoji decorative (📋 ✨ 🎓) — gunakan SVG icon stroke 1.5px atau ornament geometric.
- **Jangan** buat container dengan left-border accent color (anti-pattern AI-slop).
- **Jangan** pakai gradient warna yang berbeda hue di satu komponen — stay within palette family.
- **Jangan** mix Cormorant italic + serif weight tebal + Plus Jakarta bold dalam satu paragraf.
- **Jangan** hand-draw illustration SVG — gunakan placeholder bergaris dengan mono caption sampai foto asli tersedia.
- **Jangan** taruh ornament arabesque sebagai elemen foreground besar — tetap sebagai pattern background opacity rendah.
