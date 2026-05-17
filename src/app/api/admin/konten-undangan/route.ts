import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("konten_undangan")
      .select("*")
      .eq("sekolah_id", sekolahId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Konten undangan belum dibuat. Hubungi developer." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching konten undangan:", error);
    return NextResponse.json(
      { error: "Failed to fetch konten undangan" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const {
      judul,
      subtitle,
      bismillah,
      hero_desc,
      tanggal,
      waktu,
      lokasi_nama,
      lokasi_alamat,
      lokasi_maps,
      link_youtube,
      agenda,
      header_arabic,
      footer,
    } = body;

    if (!judul || !tanggal || !waktu || !lokasi_nama) {
      return NextResponse.json(
        { error: "Missing required fields: judul, tanggal, waktu, lokasi_nama" },
        { status: 400 }
      );
    }

    if (typeof judul !== "string" || judul.length > 200) {
      return NextResponse.json(
        { error: "Judul must be a string under 200 characters" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const payload = {
      judul,
      subtitle: subtitle || "",
      bismillah: bismillah || "",
      hero_desc: hero_desc || "",
      tanggal,
      waktu,
      lokasi_nama,
      lokasi_alamat: lokasi_alamat || "",
      lokasi_maps: lokasi_maps || "",
      link_youtube: link_youtube || "",
      agenda: agenda || [],
      header_arabic: header_arabic || "",
      footer: footer || "",
      updated_at: now,
    };

    const { data: existing } = await adminSupabase
      .from("konten_undangan")
      .select("id")
      .eq("sekolah_id", sekolahId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await adminSupabase
        .from("konten_undangan")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await adminSupabase
        .from("konten_undangan")
        .insert({ ...payload, sekolah_id: sekolahId })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating konten undangan:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to update konten undangan",
        message,
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
