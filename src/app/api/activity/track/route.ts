import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TRACKABLE_TYPES = [
  "invitation_viewed",
  "music_played",
  "music_toggled",
  "map_clicked",
  "youtube_clicked",
  "rsvp_submitted",
  "rsvp_updated",
  "checkin_scanned",
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, activity_type, metadata } = body;

    if (!token || !activity_type) {
      return NextResponse.json(
        { error: "Missing required fields: token, activity_type" },
        { status: 400 }
      );
    }

    if (!TRACKABLE_TYPES.includes(activity_type)) {
      return NextResponse.json(
        { error: `Invalid activity_type. Must be one of: ${TRACKABLE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("id, event_id")
      .eq("token", token)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
    }

    const { error: insertError } = await supabaseAdmin
      .from("guest_activity_log")
      .insert({
        tamu_id: tamu.id,
        event_id: tamu.event_id,
        activity_type,
        metadata: metadata || {},
      });

    if (insertError) throw insertError;

    if (activity_type === "invitation_viewed") {
      const now = new Date().toISOString();

      const { data: existing } = await supabaseAdmin
        .from("guest_memories")
        .select("id, value")
        .eq("tamu_id", tamu.id)
        .eq("key", "invitation_view_count")
        .maybeSingle();

      if (existing) {
        const prev = existing.value as { count?: number; first_viewed_at?: string } || {};
        const count = (prev.count || 0) + 1;
        await supabaseAdmin
          .from("guest_memories")
          .update({ value: { count, first_viewed_at: prev.first_viewed_at || now, last_viewed_at: now }, updated_at: now })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin
          .from("guest_memories")
          .insert({
            tamu_id: tamu.id,
            key: "invitation_view_count",
            value: { count: 1, first_viewed_at: now, last_viewed_at: now },
            updated_at: now,
          });
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error tracking activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
