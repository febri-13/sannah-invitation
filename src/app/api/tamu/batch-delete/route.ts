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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: tamuList, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("id")
      .in("id", ids)
      .eq("sekolah_id", sekolahId);

    if (tamuError) throw tamuError;
    if (!tamuList || tamuList.length !== ids.length) {
      return NextResponse.json({ error: "Some tamu not found or forbidden" }, { status: 403 });
    }

    await supabaseAdmin.from("rsvp").delete().in("tamu_id", ids);
    await supabaseAdmin.from("checkin").delete().in("tamu_id", ids);
    await supabaseAdmin.from("guest_activity_log").delete().in("tamu_id", ids);
    await supabaseAdmin.from("guest_memories").delete().in("tamu_id", ids);

    const { error } = await supabaseAdmin
      .from("tamu")
      .delete()
      .in("id", ids);

    if (error) throw error;

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error("Error batch deleting tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
