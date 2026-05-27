import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rsvpNewSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = rsvpNewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token, kehadiran_ortu, kehadiran_anak, pesan } = validation.data;
    const supabaseAdmin = createAdminClient();

    // Compute total attending (1 for Offline/Online, 0 for Tidak Hadir)
    const jumlah =
      (kehadiran_ortu === "Offline" || kehadiran_ortu === "Online" ? 1 : 0) +
      (kehadiran_anak === "Offline" || kehadiran_anak === "Online" ? 1 : 0);

    // Derive legacy kehadiran for backward compatibility
    const kehadiran = jumlah > 0 ? "Hadir" : "Tidak Hadir";

    // Look up tamu along with its sekolah_id
    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("id, sekolah_id, event_id")
      .eq("token", token)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
    }

    const { data: existingRsvp } = await supabaseAdmin
      .from("rsvp")
      .select("id")
      .eq("tamu_id", tamu.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isUpdate = !!existingRsvp;

    let rsvpResult;
    if (isUpdate) {
      const { data, error } = await supabaseAdmin
        .from("rsvp")
        .update({
          kehadiran_ortu,
          kehadiran_anak,
          kehadiran,
          jumlah,
          pesan: pesan || null,
        })
        .eq("id", existingRsvp.id)
        .select()
        .single();
      if (error) throw error;
      rsvpResult = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("rsvp")
        .insert({
          tamu_id: tamu.id,
          sekolah_id: tamu.sekolah_id,
          kehadiran_ortu,
          kehadiran_anak,
          kehadiran,
          jumlah,
          pesan: pesan || null,
        })
        .select()
        .single();
      if (error) throw error;
      rsvpResult = data;
    }

    await supabaseAdmin.from("guest_activity_log").insert({
      tamu_id: tamu.id,
      event_id: tamu.event_id,
      activity_type: isUpdate ? "rsvp_updated" : "rsvp_submitted",
      metadata: {
        kehadiran_ortu,
        kehadiran_anak,
        jumlah,
      },
    });

    return NextResponse.json(rsvpResult, { status: isUpdate ? 200 : 201 });
  } catch (error) {
    console.error("Error creating RSVP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
