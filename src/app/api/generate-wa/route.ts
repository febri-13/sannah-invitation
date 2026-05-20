import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Auth check — only logged-in admins can generate WA links
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    const body = await request.json();
    const { namaOrtu, token, namaSiswa, tanggalAcara, waktuAcara, lokasiAcara, phoneNumber } = body;

    if (!namaOrtu || !token) {
      return NextResponse.json(
        { error: "Missing required fields: namaOrtu, token" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Fetch template from pengaturan, scoped to this admin's sekolah + event
    let templateEventId: string | undefined;

    // If the tamu has an event_id, use it; otherwise fall back to body.event_id
    if (token) {
      const { data: tamu } = await supabaseAdmin
        .from("tamu")
        .select("event_id")
        .eq("token", token)
        .maybeSingle();
      templateEventId = tamu?.event_id || body.event_id;
    } else {
      templateEventId = body.event_id;
    }

    let settingQuery = supabaseAdmin
      .from("pengaturan")
      .select("value")
      .eq("key", "wa_template_invitation")
      .eq("sekolah_id", sekolahId || "00000000-0000-0000-0000-000000000000");

    if (templateEventId) {
      settingQuery = settingQuery.eq("event_id", templateEventId);
    } else if (sekolahId) {
      settingQuery = settingQuery.is("event_id", null);
    }

    const { data: setting, error } = await settingQuery.limit(1).maybeSingle();

    if (error) throw error;

    const template = setting?.value || `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu {namaOrtu},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah untuk Ananda {namaSiswa}.\n\n📅 Tanggal: {tanggalAcara}\n🕐 Waktu: {waktuAcara}\n📍 Lokasi: {lokasiAcara}\n\nSilakan klik link berikut untuk melihat undangan lengkap:\n{link}\n\nKami tunggu kehadiran Anda.\n\nWassalamu'alaikum Wr. Wb.`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const link = `${baseUrl}/undangan/${token}`;

    const message = template
      .replace(/{namaOrtu}/g, namaOrtu)
      .replace(/{namaSiswa}/g, namaSiswa || "")
      .replace(/{link}/g, link)
      .replace(/{tanggalAcara}/g, tanggalAcara || "Sabtu, 21 Juni 2025")
      .replace(/{waktuAcara}/g, waktuAcara || "08.00 - 12.00 WIB")
      .replace(/{lokasiAcara}/g, lokasiAcara || "MTsN 1 Kota");

    const cleanPhone = phoneNumber?.replace(/[^0-9]/g, "");
    const internationalPhone = cleanPhone?.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const waLink = internationalPhone
      ? `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ url: waLink });
  } catch (error) {
    console.error("Error generating WA link:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate WhatsApp link", message },
      { status: 500 }
    );
  }
}
