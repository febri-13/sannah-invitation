import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Allowed setting keys that can be modified via API
const ALLOWED_KEYS = ["wa_template_invitation"];

// Default values for seeding/insert fallback
const DEFAULTS: Record<string, { label: string; description: string }> = {
  wa_template_invitation: {
    label: "Template Pesan Undangan WhatsApp",
    description: "Pesan default untuk undangan WhatsApp. Placeholders: {namaOrtu}, {namaSiswa}, {tanggalAcara}, {waktuAcara}, {lokasiAcara}, {link}",
  },
};

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    const adminSupabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const { data, error } = await adminSupabase
        .from("pengaturan")
        .select("*")
        .eq("key", key)
        .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000")
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error: allError } = await adminSupabase
      .from("pengaturan")
      .select("*")
      .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000");

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
    // Auth check
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
    const { key, value } = body;

    // Validate required fields
    if (!key || !value) {
      return NextResponse.json(
        { error: "Missing required fields: key, value" },
        { status: 400 }
      );
    }

    // Validate key is allowed
    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 400 }
      );
    }

    // Validate value length
    if (typeof value !== "string" || value.length > 5000) {
      return NextResponse.json(
        { error: "Value must be a string under 5000 characters" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const now = new Date().toISOString();

    // Always insert with sekolah_id — avoids cross-sekolah collisions
    const { data: existing } = await adminSupabase
      .from("pengaturan")
      .select("key")
      .eq("key", key)
      .eq("sekolah_id", sekolahId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await adminSupabase
        .from("pengaturan")
        .update({
          value,
          updated_at: now,
        })
        .eq("key", key)
        .eq("sekolah_id", sekolahId)
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
