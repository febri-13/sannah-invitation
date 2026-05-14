import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { namaOrtu, token, namaSiswa, tanggalAcara, waktuAcara, lokasiAcara } = body;

    if (!namaOrtu || !token) {
      return NextResponse.json(
        { error: "Missing required fields: namaOrtu, token" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch template from pengaturan table
    const { data: setting, error } = await supabase
      .from("pengaturan")
      .select("value")
      .eq("key", "wa_template_invitation")
      .single();

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

    const waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ url: waLink });
  } catch (error) {
    console.error("Error generating WA link:", error);
    return NextResponse.json(
      { error: "Failed to generate WhatsApp link" },
      { status: 500 }
    );
  }
}
