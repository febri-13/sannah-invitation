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
      return NextResponse.json({ error: "Admin account is not linked to a sekolah" }, { status: 400 });
    }

    const body = await request.json();
    const { namaOrtu, token, namaSiswa, tanggalAcara, waktuAcara, lokasiAcara, lokasiMaps, phoneNumber } = body;

    if (!namaOrtu || !token) {
      return NextResponse.json({ error: "Missing required fields: namaOrtu, token" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Look up tamu to get event_id
    const { data: tamu } = await supabaseAdmin
      .from("tamu")
      .select("event_id")
      .eq("token", token)
      .maybeSingle();

    const templateEventId = tamu?.event_id || body.event_id;

    // Fetch template — scoped to this admin's sekolah
    let settingQuery = supabaseAdmin
      .from("pengaturan")
      .select("value")
      .eq("key", "wa_template_invitation")
      .eq("sekolah_id", sekolahId);

    if (templateEventId) {
      settingQuery = settingQuery.eq("event_id", templateEventId);
    } else {
      settingQuery = settingQuery.is("event_id", null);
    }

    const { data: setting } = await settingQuery.limit(1).maybeSingle();

    const template = setting?.value || `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu {namaOrtu},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah untuk Ananda {namaSiswa}.\n\n📅 Tanggal: {tanggalAcara}\n🕐 Waktu: {waktuAcara}\n📍 Lokasi: {lokasiAcara}\n\nSilakan klik link berikut untuk melihat undangan lengkap:\n{link}\n\nKami tunggu kehadiran Anda.\n\nWassalamu'alaikum Wr. Wb.`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const link = `${baseUrl}/undangan/${token}`;

    // Fetch konten_undangan for event details if not provided
    let resolvedTanggal = tanggalAcara;
    let resolvedWaktu = waktuAcara;
    let resolvedLokasi = lokasiAcara;
    let resolvedLokasiMaps = lokasiMaps;

    if (templateEventId && (!resolvedTanggal || !resolvedWaktu || !resolvedLokasi || !resolvedLokasiMaps)) {
      const { data: konten } = await supabaseAdmin
        .from("konten_undangan")
        .select("tanggal, waktu, lokasi_nama, lokasi_maps")
        .eq("event_id", templateEventId)
        .maybeSingle();

      if (konten) {
        resolvedTanggal = resolvedTanggal || konten.tanggal;
        resolvedWaktu = resolvedWaktu || konten.waktu;
        resolvedLokasi = resolvedLokasi || konten.lokasi_nama;
        resolvedLokasiMaps = resolvedLokasiMaps || konten.lokasi_maps;
      }
    }

    const message = template
      .replace(/{namaOrtu}/g, namaOrtu)
      .replace(/{namaSiswa}/g, namaSiswa || "")
      .replace(/{link}/g, link)
      .replace(/{tanggalAcara}/g, resolvedTanggal || "Sabtu, 21 Juni 2025")
      .replace(/{waktuAcara}/g, resolvedWaktu || "08.00 - 12.00 WIB")
      .replace(/{lokasiAcara}/g, resolvedLokasi || "MTsN 1 Kota")
      .replace(/{lokasiMaps}/g, resolvedLokasiMaps || "");

    const cleanPhone = phoneNumber?.replace(/[^0-9]/g, "");
    const internationalPhone = cleanPhone?.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const waLink = internationalPhone
      ? `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ url: waLink });
  } catch (error) {
    console.error("Error generating WA link:", error);
    return NextResponse.json({ error: "Failed to generate WhatsApp link" }, { status: 500 });
  }
}
