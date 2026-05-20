import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkinSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;

    const body = await request.json();
    const validation = checkinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token } = validation.data;
    const supabaseAdmin = createAdminClient();

    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("id, nama_siswa, nama_ayah, nama_ibu, sekolah_id, event_id")
      .eq("token", token)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
    }

    // Prefer nama_ayah; fall back to nama_ibu
    const namaOrtu = tamu.nama_ayah || tamu.nama_ibu || tamu.nama_siswa;

    // Prevent cross-sekolah check-in
    if (sekolahId && tamu.sekolah_id !== sekolahId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: existingCheckin } = await supabaseAdmin
      .from("checkin")
      .select("id")
      .eq("tamu_id", tamu.id)
      .single();

    if (existingCheckin) {
      return NextResponse.json({ error: "Tamu sudah check-in sebelumnya" }, { status: 409 });
    }

    const { data: checkin, error: checkinError } = await supabaseAdmin
      .from("checkin")
      .insert({
        tamu_id: tamu.id,
        scanned_by: user.id,
      })
      .select()
      .single();

    if (checkinError) throw checkinError;

    return NextResponse.json({
      success: true,
      nama_ortu: namaOrtu,
      nama_siswa: tamu.nama_siswa,
    });
  } catch (error) {
    console.error("Error creating checkin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}