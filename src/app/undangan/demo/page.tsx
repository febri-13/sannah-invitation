import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import InvitationClient from "../[token]/InvitationClient";
import type { KontenUndangan } from "@/lib/database.types";

const FALLBACK_KONTEN: Omit<KontenUndangan, "id" | "sekolah_id" | "event_id" | "created_at" | "updated_at"> &
  Partial<Pick<KontenUndangan, "template_slug">> = {
  judul: "Akhirusannah",
  subtitle: "Perpisahan Sekolah",
  bismillah: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
  hero_desc: "",
  tanggal: "Sabtu, 21 Juni 2025",
  waktu: "Pukul 08.00 - 12.00 WIB",
  lokasi_nama: "Aula Sekolah",
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
  template_slug: "glass-premium",
};

const SAMPLE_TAMU = {
  id: "demo",
  nama_ayah: "Ahmad",
  nama_ibu: "Siti",
  nama_siswa: "Muhammad Faris Abdurrahman",
  jenis_kelamin: "Laki-laki",
  token: "demo-token",
  sekolah_id: null,
  rsvp: [],
  checkin: [],
};

export default async function DemoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sekolahId = user?.app_metadata?.sekolah_id as string | undefined;

  let konten: KontenUndangan;
  let sekolahNama = "SDIT Al-Hikmah";

  if (sekolahId) {
    const adminSupabase = createAdminClient();

    const { data: events } = await adminSupabase
      .from("events")
      .select("id")
      .eq("sekolah_id", sekolahId)
      .order("is_active", { ascending: false })
      .limit(1);

    const eventId = events?.[0]?.id;
    const kontenQuery = adminSupabase.from("konten_undangan").select("*");
    if (eventId) {
      kontenQuery.eq("event_id", eventId);
    } else {
      kontenQuery.eq("sekolah_id", sekolahId);
    }

    const { data } = await kontenQuery.single();

    if (data) {
      konten = data;
    } else {
      konten = {
        ...FALLBACK_KONTEN,
        id: "",
        sekolah_id: sekolahId,
        event_id: eventId || "",
        created_at: null,
        updated_at: null,
      };
    }

    const { data: sekolah } = await adminSupabase
      .from("sekolah")
      .select("nama")
      .eq("id", sekolahId)
      .single();
    if (sekolah) sekolahNama = sekolah.nama;
  } else {
    konten = {
      ...FALLBACK_KONTEN,
      id: "",
      sekolah_id: "",
      event_id: "",
      created_at: null,
      updated_at: null,
    };
  }

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4 px-4 py-3"
        style={{
          background: "rgba(42,37,32,0.9)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
        <span className="font-mono-label text-[11px] tracking-[0.22em]" style={{ color: "#C9A35E" }}>
          ⚡ PRATINJAU UNDANGAN
        </span>
        <span className="text-[12px]" style={{ color: "rgba(245,238,224,0.6)" }}>
          Tampilan seperti yang dilihat tamu
        </span>
      </div>
      <div className="pt-12">
        <InvitationClient tamu={SAMPLE_TAMU} token="demo-token" konten={konten} sekolahNama={sekolahNama} />
      </div>
    </div>
  );
}
