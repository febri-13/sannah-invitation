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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event_id");
    const tamuId = searchParams.get("tamu_id");

    if (!eventId) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: tamuIds } = await adminSupabase
      .from("tamu")
      .select("id")
      .eq("event_id", eventId);

    if (!tamuIds || tamuIds.length === 0) {
      return NextResponse.json({ memories: [] });
    }

    const ids = tamuIds.map(t => t.id);

    let query = adminSupabase
      .from("guest_memories")
      .select(`
        id, key, value, updated_at,
        tamu:tamu_id (id, nama_siswa, token)
      `)
      .in("tamu_id", ids);

    if (tamuId) {
      query = query.eq("tamu_id", tamuId);
    }

    const { data, error } = await query.order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ memories: data || [] });
  } catch (error) {
    console.error("Error fetching admin memories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
