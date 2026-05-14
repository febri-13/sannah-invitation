import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rsvpSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = rsvpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token, kehadiran, jumlah, pesan } = validation.data;
    const supabaseAdmin = createAdminClient();

    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("id")
      .eq("token", token)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
    }

    const { data: rsvp, error: rsvpError } = await supabaseAdmin
      .from("rsvp")
      .insert({
        tamu_id: tamu.id,
        kehadiran,
        jumlah,
        pesan: pesan || null,
      })
      .select()
      .single();

    if (rsvpError) throw rsvpError;

    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    console.error("Error creating RSVP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}