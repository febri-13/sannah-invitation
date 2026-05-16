import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    // Verify the tamu belongs to this admin's sekolah before deleting
    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("sekolah_id")
      .eq("id", id)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Tamu tidak ditemukan" }, { status: 404 });
    }

    if (sekolahId && tamu.sekolah_id !== sekolahId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("tamu")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}