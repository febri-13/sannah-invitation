import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Number(searchParams.get("offset")) || 0;

    if (!eventId) {
      return NextResponse.json(
        { error: "event_id is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data: total, error: countError } = await adminSupabase
      .from("guest_activity_log")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (countError) throw countError;

    const { data: activities, error } = await adminSupabase
      .from("guest_activity_log")
      .select(`
        id, activity_type, metadata, created_at,
        tamu:tamu_id (id, nama_siswa, token, kelas)
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      activities,
      total: total?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
