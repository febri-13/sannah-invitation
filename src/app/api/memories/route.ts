import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const key = searchParams.get("key");

    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("id")
      .eq("token", token)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
    }

    let query = supabaseAdmin
      .from("guest_memories")
      .select("key, value, updated_at")
      .eq("tamu_id", tamu.id);

    if (key) {
      query = query.eq("key", key);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ memories: data });
  } catch (error) {
    console.error("Error fetching guest memories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, key, value } = body;

    if (!token || !key || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: token, key, value" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("id")
      .eq("token", token)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
    }

    const now = new Date().toISOString();

    const { data: existing } = await supabaseAdmin
      .from("guest_memories")
      .select("id")
      .eq("tamu_id", tamu.id)
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("guest_memories")
        .update({ value, updated_at: now })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("guest_memories")
        .insert({ tamu_id: tamu.id, key, value, updated_at: now });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error upserting guest memory:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
