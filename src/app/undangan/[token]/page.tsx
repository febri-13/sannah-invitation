import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import InvitationClient from "./InvitationClient";
import type { KontenUndangan } from "@/lib/database.types";

const FALLBACK_KONTEN: Omit<KontenUndangan, "id" | "sekolah_id" | "created_at" | "updated_at"> = {
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
};

export default async function UndanganPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  try {
    const { token } = await params;

    const supabase = createAdminClient();
    const { data: tamu, error } = await supabase
      .from("tamu")
      .select("*, rsvp(*), checkin(*)")
      .eq("token", token)
      .single();

    if (error || !tamu) {
      notFound();
    }

    let konten: KontenUndangan;

    if (tamu.sekolah_id) {
      const { data } = await supabase
        .from("konten_undangan")
        .select("*")
        .eq("sekolah_id", tamu.sekolah_id)
        .single();

      if (data) {
        konten = data;
      } else {
        konten = {
          ...FALLBACK_KONTEN,
          id: "",
          sekolah_id: tamu.sekolah_id,
          created_at: null,
          updated_at: null,
        };
      }
    } else {
      konten = {
        ...FALLBACK_KONTEN,
        id: "",
        sekolah_id: "",
        created_at: null,
        updated_at: null,
      };
    }

    return (
      <InvitationClient tamu={tamu} token={token} konten={konten} />
    );
  } catch (error) {
    console.error("Gagal memuat undangan:", error);
    notFound();
  }
}
