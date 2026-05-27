import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tamuInputSchema } from "@/lib/schemas";
import { generateToken } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");

    const supabaseAdmin = createAdminClient();
    const query = supabaseAdmin
      .from("tamu")
      .select(`
        *,
        rsvp (kehadiran, jumlah),
        checkin (waktu)
      `)
      .order("created_at", { ascending: false });

    if (eventId) {
      query.eq("event_id", eventId);
    } else if (sekolahId) {
      query.eq("sekolah_id", sekolahId);
    }

    const { data: tamu, error } = await query;

    if (error) throw error;

    return NextResponse.json(tamu);
  } catch (error) {
    console.error("Error fetching tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
    const validation = tamuInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { nama_siswa, jenis_kelamin, kelas, nama_ayah, nama_ibu, no_wa_ayah, no_wa_ibu, event_id } = validation.data;
    const token = generateToken();

    const supabaseAdmin = createAdminClient();

    let resolvedEventId = event_id;
    if (resolvedEventId) {
      const { data: validEvent } = await supabaseAdmin
        .from("events")
        .select("id")
        .eq("id", resolvedEventId)
        .eq("sekolah_id", sekolahId)
        .single();
      if (!validEvent) resolvedEventId = undefined;
    }
    if (!resolvedEventId) {
      const { data: defaultEvent } = await supabaseAdmin
        .from("events")
        .select("id")
        .eq("sekolah_id", sekolahId)
        .eq("slug", "akhirusannah")
        .single();
      if (defaultEvent) resolvedEventId = defaultEvent.id;
    }

    const { data: tamu, error } = await supabaseAdmin
      .from("tamu")
      .insert({
        token,
        nama_siswa,
        kelas: kelas || null,
        nama_ayah: nama_ayah || null,
        nama_ibu: nama_ibu || null,
        no_wa_ayah: no_wa_ayah || null,
        no_wa_ibu: no_wa_ibu || null,
        jenis_kelamin,
        sekolah_id: sekolahId,
        event_id: resolvedEventId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(tamu, { status: 201 });
  } catch (error) {
    console.error("Error creating tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}