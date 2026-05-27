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
    let eventId = searchParams.get("event_id");

    // If no event_id provided, resolve to first event for this sekolah
    if (!eventId && sekolahId) {
      const { data: firstEvent } = await adminSupabase
        .from("events")
        .select("id")
        .eq("sekolah_id", sekolahId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (firstEvent) {
        eventId = firstEvent.id;
      }
    }

    if (key) {
      // Try with event_id first
      if (eventId) {
        const { data, error } = await adminSupabase
          .from("pengaturan")
          .select("*")
          .eq("key", key)
          .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000")
          .eq("event_id", eventId)
          .maybeSingle();

        if (error) throw error;
        if (data) return NextResponse.json(data);

        // Fallback: try global (null event_id)
        const { data: fallback } = await adminSupabase
          .from("pengaturan")
          .select("*")
          .eq("key", key)
          .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000")
          .is("event_id", null)
          .maybeSingle();

        if (fallback) return NextResponse.json(fallback);
      }

      // Auto-create default setting if none exists
      if (sekolahId) {
        const { data: firstEvent } = await adminSupabase
          .from("events")
          .select("id")
          .eq("sekolah_id", sekolahId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        const resolvedEventId = eventId || firstEvent?.id;

        if (!resolvedEventId) {
          return NextResponse.json(
            { error: "Buat event terlebih dahulu sebelum mengakses pengaturan" },
            { status: 400 }
          );
        }

        const defaults = DEFAULTS[key];
        const { data: created, error: createError } = await adminSupabase
          .from("pengaturan")
          .insert({
            key,
            value: "Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu {namaOrtu},\n\nSilakan klik link berikut:\n{link}\n\nTerima kasih.",
            label: defaults?.label || "Custom Setting",
            description: defaults?.description || "",
            sekolah_id: sekolahId,
            event_id: resolvedEventId,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        return NextResponse.json(created);
      }

      return NextResponse.json(null);
    }

    // No specific key requested — return all settings for this event
    let allQuery = adminSupabase
      .from("pengaturan")
      .select("*")
      .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000");

    if (eventId) {
      allQuery = allQuery.eq("event_id", eventId);
    }

    const { data, error: allError } = await allQuery;

    if (allError) throw allError;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching settings:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const detail =
      error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error
        ? { code: (error as any).code, message: (error as any).message, hint: (error as any).hint }
        : {};
    return NextResponse.json(
      { error: "Failed to fetch settings", message, ...detail },
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

    let existingQuery = adminSupabase
      .from("pengaturan")
      .select("key")
      .eq("key", key)
      .eq("sekolah_id", sekolahId);

    if (event_id) {
      existingQuery = existingQuery.eq("event_id", event_id);
    } else {
      existingQuery = existingQuery.is("event_id", null);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      let updateQuery = adminSupabase
        .from("pengaturan")
        .update({ value, updated_at: now })
        .eq("key", key)
        .eq("sekolah_id", sekolahId);

      if (event_id) {
        updateQuery = updateQuery.eq("event_id", event_id);
      } else {
        updateQuery = updateQuery.is("event_id", null);
      }

      const { data, error } = await updateQuery.select().single();

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
