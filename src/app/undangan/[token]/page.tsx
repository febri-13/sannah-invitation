import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import InvitationClient from "./InvitationClient";
import type { KontenUndangan } from "@/lib/database.types";

const FALLBACK_KONTEN: Omit<KontenUndangan, "id" | "sekolah_id" | "event_id" | "created_at" | "updated_at"> &
  Partial<Pick<KontenUndangan, "template_slug">> = {
  judul: "Akhirusannah",
  subtitle: "Perpisahan Sekolah",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
  hero_desc: "",
  tanggal: "Sabtu, 21 Juni 2025",
  waktu: "Pukul 08.00 - 12.00 WIB",
  lokasi_nama: "MTsN 1 Kota",
  lokasi_alamat: "Jl. Pendidikan No. 123",
  lokasi_maps: "",
  link_youtube: "",
  agenda: [
    { waktu: "08.00 - 08.30", icon: "BookOpen", judul: "Pembukaan & Doa" },
    { waktu: "08.30 - 09.30", icon: "Mic", judul: "Laporan & Pidato" },
    { waktu: "09.30 - 10.30", icon: "Video", judul: "Pemutaran Video Kenangan" },
    { waktu: "10.30 - 11.30", icon: "Camera", judul: "Salam & Foto Bersama" },
    { waktu: "11.30 - 12.00", icon: "Star", judul: "Penutupan" },
  ],
  header_arabic: "© 2025",
  footer: "Akhirusannah. Semua hak dilindungi.",
  footer_hormat_label: "HORMAT KAMI,",
  footer_keluarga_label: "Keluarga Besar",
  template_slug: "glass-premium",
  music_url: "",
  music_auto_play: false,
  layout_config: null,
};

/** Buat objek KontenUndangan fallback dengan sekolah_id yang sesuai */
function makeFallback(sekolah_id: string): KontenUndangan {
  return {
    ...FALLBACK_KONTEN,
    id: "",
    sekolah_id,
    event_id: "",
    created_at: null,
    updated_at: null,
  };
}

export default async function UndanganPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  // 1. Lookup tamu — hanya ini yang trigger 404
  const { data: tamu, error: tamuError } = await supabase
    .from("tamu")
    .select("*, rsvp(*), checkin(*)")
    .eq("token", token)
    .single();

  if (tamuError || !tamu) {
    notFound();
  }

  // 2. Load konten dengan fallback: event → sekolah → hardcoded
  let konten: KontenUndangan | null = null;

  // 2a. Coba event-level
  if (tamu.event_id) {
    const { data } = await supabase
      .from("konten_undangan")
      .select("*")
      .eq("event_id", tamu.event_id)
      .single();
    konten = data;
  }

  // 2b. Fallback ke sekolah-level (default konten tanpa event)
  if (!konten && tamu.sekolah_id) {
    const { data } = await supabase
      .from("konten_undangan")
      .select("*")
      .eq("sekolah_id", tamu.sekolah_id)
      .is("event_id", null)
      .single();
    konten = data;
  }

  // 2c. Fallback terakhir: hardcoded
  if (!konten) {
    konten = makeFallback(tamu.sekolah_id || "");
  }

  // 3. Load data sekolah (graceful — error tidak bikin 404)
  let sekolahNama = "SDIT Al-Hikmah";
  let sekolahLogo = "";

  if (tamu.sekolah_id) {
    try {
      const { data: sekolah } = await supabase
        .from("sekolah")
        .select("nama, logo_url")
        .eq("id", tamu.sekolah_id)
        .single();
      if (sekolah) {
        sekolahNama = sekolah.nama;
        sekolahLogo = sekolah.logo_url || "";
      }
    } catch (err) {
      console.error("Gagal memuat data sekolah:", err);
    }
  }

  // 4. Music dari konten terpilih
  const musicUrl = konten.music_url || "";
  const musicAutoPlay = konten.music_auto_play ?? false;

  return (
    <InvitationClient
      tamu={tamu}
      token={token}
      konten={konten}
      sekolahNama={sekolahNama}
      sekolahLogo={sekolahLogo}
      musicUrl={musicUrl}
      musicAutoPlay={musicAutoPlay}
    />
  );
}
