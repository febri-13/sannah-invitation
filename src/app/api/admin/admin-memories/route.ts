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
      return NextResponse.json({ error: "Admin not linked to sekolah" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    const adminSupabase = createAdminClient();
    let query = adminSupabase
      .from("admin_memories")
      .select("key, value, updated_at")
      .eq("admin_id", user.id)
      .eq("sekolah_id", sekolahId);

    if (key) {
      query = query.eq("key", key);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ memories: data || [] });
  } catch (error) {
    console.error("Error fetching admin memories:", error);
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
      return NextResponse.json({ error: "Admin not linked to sekolah" }, { status: 400 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: key, value" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: existing } = await adminSupabase
      .from("admin_memories")
      .select("id")
      .eq("admin_id", user.id)
      .eq("sekolah_id", sekolahId)
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      const { error } = await adminSupabase
        .from("admin_memories")
        .update({ value, updated_at: now })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await adminSupabase
        .from("admin_memories")
        .insert({ admin_id: user.id, sekolah_id: sekolahId, key, value, updated_at: now });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error upserting admin memory:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    if (!sekolahId) {
      return NextResponse.json({ error: "Admin not linked to sekolah" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("admin_memories")
      .delete()
      .eq("admin_id", user.id)
      .eq("sekolah_id", sekolahId)
      .eq("key", key);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin memory:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
