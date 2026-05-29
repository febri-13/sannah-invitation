import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";

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
    let eventId: string | null = searchParams.get("event_id");

    const adminSupabase = createAdminClient();

    if (!eventId) {
      const { data: defaultEvent } = await adminSupabase
        .from("events")
        .select("id")
        .eq("sekolah_id", sekolahId)
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (defaultEvent?.id) {
        eventId = defaultEvent.id;
      } else {
        const { data: anyEvent } = await adminSupabase
          .from("events")
          .select("id")
          .eq("sekolah_id", sekolahId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (anyEvent?.id) {
          eventId = anyEvent.id;
        }
      }
    }

    if (!eventId) {
      return NextResponse.json(
        { error: "Tidak ada event aktif untuk sekolah ini" },
        { status: 404 }
      );
    }

    const query = adminSupabase
      .from("konten_undangan")
      .select("*")
      .eq("event_id", eventId);

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Konten undangan belum dibuat. Hubungi developer." },
          { status: 404 }
        );
      }
      throw error;
    }

    const { data: sekolah } = await adminSupabase
      .from("sekolah")
      .select("logo_url")
      .eq("id", sekolahId)
      .single();

    return NextResponse.json({ ...data, logo_url: sekolah?.logo_url || "" });
  } catch (error) {
    console.error("Error fetching konten undangan:", error);
    return NextResponse.json(
      { error: "Failed to fetch konten undangan" },
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
    const {
      judul,
      subtitle,
      bismillah,
      hero_desc,
      tanggal,
      waktu,
      lokasi_nama,
      lokasi_alamat,
      lokasi_maps,
      link_youtube,
      agenda,
      header_arabic,
      footer,
      template_slug,
      logo_url,
      event_id,
      music_url,
      music_auto_play,
      layout_config,
    } = body;

    if (!judul || !tanggal || !waktu || !lokasi_nama) {
      return NextResponse.json(
        { error: "Missing required fields: judul, tanggal, waktu, lokasi_nama" },
        { status: 400 }
      );
    }

    if (typeof judul !== "string" || judul.length > 200) {
      return NextResponse.json(
        { error: "Judul must be a string under 200 characters" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const basePayload = {
      judul,
      subtitle: subtitle || "",
      bismillah: bismillah || "",
      hero_desc: hero_desc || "",
      tanggal,
      waktu,
      lokasi_nama,
      lokasi_alamat: lokasi_alamat || "",
      lokasi_maps: lokasi_maps || "",
      link_youtube: link_youtube || "",
      agenda: agenda || [],
      header_arabic: header_arabic || "",
      footer: footer || "",
      template_slug: template_slug || "glass-premium",
      music_url: music_url || "",
      music_auto_play: music_auto_play ?? false,
      layout_config: (layout_config as Json) || null,
      updated_at: now,
    };

    let resolvedEventId = event_id;
    if (!resolvedEventId) {
      const { data: defaultEvent } = await adminSupabase
        .from("events")
        .select("id")
        .eq("sekolah_id", sekolahId)
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (defaultEvent?.id) {
        resolvedEventId = defaultEvent.id;
      } else {
        const { data: anyEvent } = await adminSupabase
          .from("events")
          .select("id")
          .eq("sekolah_id", sekolahId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (anyEvent?.id) {
          resolvedEventId = anyEvent.id;
        }
      }
    }

    const lookupQuery = adminSupabase.from("konten_undangan").select("id").eq("event_id", resolvedEventId);

    const { data: existing } = await lookupQuery.maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await adminSupabase
        .from("konten_undangan")
        .update(basePayload)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await adminSupabase
        .from("konten_undangan")
        .insert({ ...basePayload, sekolah_id: sekolahId, event_id: resolvedEventId })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    if (logo_url !== undefined) {
      await adminSupabase
        .from("sekolah")
        .update({ logo_url })
        .eq("id", sekolahId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating konten undangan:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to update konten undangan",
        message,
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
