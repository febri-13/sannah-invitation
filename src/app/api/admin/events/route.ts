import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    if (!sekolahId) {
      return NextResponse.json(
        { error: "Admin account is not linked to a sekolah" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nama } = body;

    if (!nama || typeof nama !== "string" || nama.trim().length === 0) {
      return NextResponse.json({ error: "Nama event wajib diisi" }, { status: 400 });
    }

    const slug = nama.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const adminSupabase = createAdminClient();

    // Check slug uniqueness for this sekolah
    const { data: existing } = await adminSupabase
      .from("events")
      .select("id")
      .eq("sekolah_id", sekolahId)
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Event dengan nama "${nama}" sudah ada` },
        { status: 409 }
      );
    }

    // Create event
    const { data: event, error: eventError } = await adminSupabase
      .from("events")
      .insert({ sekolah_id: sekolahId, nama: nama.trim(), slug })
      .select()
      .single();

    if (eventError) throw eventError;

    // Create default konten_undangan — rollback event if this fails
    try {
      const { data: existingKonten } = await adminSupabase
        .from("konten_undangan")
        .select("judul, subtitle, bismillah, tanggal, waktu, lokasi_nama, lokasi_alamat, agenda, header_arabic, footer")
        .eq("sekolah_id", sekolahId)
        .limit(1)
        .maybeSingle();

      const defaultKonten = existingKonten || {
        judul: nama.trim(),
        subtitle: "Perpisahan Sekolah",
        bismillah: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
        tanggal: "Sabtu, 21 Juni 2025",
        waktu: "Pukul 08.00 - 12.00 WIB",
        lokasi_nama: "Aula Sekolah",
        lokasi_alamat: "Jl. Pendidikan No. 123",
        agenda: [
          { waktu: "08.00 - 08.30", icon: "BookOpen", judul: "Pembukaan & Doa" },
          { waktu: "08.30 - 09.30", icon: "Mic", judul: "Laporan & Pidato" },
          { waktu: "09.30 - 10.30", icon: "Video", judul: "Pemutaran Video Kenangan" },
          { waktu: "10.30 - 11.30", icon: "Camera", judul: "Salam & Foto Bersama" },
          { waktu: "11.30 - 12.00", icon: "Star", judul: "Penutupan" },
        ],
        header_arabic: "© 2025",
        footer: `${nama.trim()}. Semua hak dilindungi.`,
      };

      const { error: kontenError } = await adminSupabase
        .from("konten_undangan")
        .insert({
          ...defaultKonten,
          sekolah_id: sekolahId,
          event_id: event.id,
          judul: nama.trim(),
          footer: `${nama.trim()}. Semua hak dilindungi.`,
        });

      if (kontenError) {
        await adminSupabase.from("events").delete().eq("id", event.id);
        throw kontenError;
      }
    } catch (kontenErr) {
      console.error("Konten creation failed, rolling back event:", kontenErr);
      // Best-effort cleanup
      await adminSupabase.from("events").delete().eq("id", event.id);
      return NextResponse.json(
        { error: "Gagal membuat konten undangan untuk event baru" },
        { status: 500 }
      );
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Gagal membuat event baru" },
      { status: 500 }
    );
  }
}
