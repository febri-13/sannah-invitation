import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_KEYS = ["wa_template_invitation"];

const DEFAULTS: Record<string, { label: string; description: string }> = {
  wa_template_invitation: {
    label: "Template Pesan Undangan WhatsApp",
    description: "Pesan default untuk undangan WhatsApp. Placeholders: {namaOrtu}, {namaSiswa}, {tanggalAcara}, {waktuAcara}, {lokasiAcara}, {link}",
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    const adminSupabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const eventId = searchParams.get("event_id");

    let query = adminSupabase
      .from("pengaturan")
      .select("*")
      .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000");

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    if (key) {
      const { data, error } = await query.eq("key", key).maybeSingle();

      if (error) throw error;

      // If no row found with event_id, try global (null event_id) for backward compat
      if (!data && eventId) {
        const { data: fallback } = await adminSupabase
          .from("pengaturan")
          .select("*")
          .eq("key", key)
          .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000")
          .is("event_id", null)
          .maybeSingle();

        if (fallback) return NextResponse.json(fallback);
      }

      return NextResponse.json(data ?? null);
    }

    const { data, error: allError } = await query;

    if (allError) throw allError;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { key, value, event_id } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: "Missing required fields: key, value" },
        { status: 400 }
      );
    }

    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 400 }
      );
    }

    if (typeof value !== "string" || value.length > 5000) {
      return NextResponse.json(
        { error: "Value must be a string under 5000 characters" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: existing } = await adminSupabase
      .from("pengaturan")
      .select("key")
      .eq("key", key)
      .eq("sekolah_id", sekolahId)
      .eq("event_id", event_id ?? "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    if (existing) {
      const { data, error } = await adminSupabase
        .from("pengaturan")
        .update({ value, updated_at: now })
        .eq("key", key)
        .eq("sekolah_id", sekolahId)
        .eq("event_id", event_id ?? "00000000-0000-0000-0000-000000000000")
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const defaults = DEFAULTS[key];
      const { data, error } = await adminSupabase
        .from("pengaturan")
        .insert({
          key,
          value,
          label: defaults?.label || "Custom Setting",
          description: defaults?.description || "",
          sekolah_id: sekolahId,
          event_id: event_id || null,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error updating setting:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to update setting",
        message,
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
