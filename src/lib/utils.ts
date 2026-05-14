import crypto from "crypto";
import { createAdminClient } from "./supabase/admin";

// Event constants — could move to pengaturan later
const EVENT_DATE = "Sabtu, 21 Juni 2025";
const EVENT_TIME = "08.00 - 12.00 WIB";
const EVENT_VENUE = "MTsN 1 Kota";

// Template cache (in-memory, warm instance)
let cachedTemplate: string | null = null;
let cachedAt: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

const DEFAULT_TEMPLATE = `Assalamu'alaikum Wr. Wb.

Bapak/Ibu {namaOrtu},

Dengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah untuk Ananda {namaSiswa}.

📅 Tanggal: {tanggalAcara}
🕐 Waktu: {waktuAcara}
📍 Lokasi: {lokasiAcara}

Silakan klik link berikut untuk melihat undangan lengkap:
{link}

Kami tunggu kehadiran Anda.

Wassalamu'alaikum Wr. Wb.`;

export async function getWATemplate(): Promise<string> {
  const now = Date.now();
  if (cachedTemplate && now - cachedAt < CACHE_TTL) {
    return cachedTemplate;
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("pengaturan")
      .select("value")
      .eq("key", "wa_template_invitation")
      .single();

    const template = data?.value || DEFAULT_TEMPLATE;
    cachedTemplate = template;
    cachedAt = now;
    return template;
  } catch (error) {
    console.error("Failed to fetch WA template:", error);
    return DEFAULT_TEMPLATE;
  }
}

export function generateToken(): string {
  return crypto.randomBytes(4).toString("hex");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

/**
 * Generate WhatsApp invite link with customizable template.
 * Template placeholders: {namaOrtu}, {namaSiswa}, {link}, {tanggalAcara}, {waktuAcara}, {lokasiAcara}
 */
export async function generateWhatsAppLink(
  namaOrtu: string,
  token: string,
  namaSiswa?: string,
  tanggalAcara?: string,
  waktuAcara?: string,
  lokasiAcara?: string
): Promise<string> {
  const baseUrl = getBaseUrl();
  const link = `${baseUrl}/undangan/${token}`;

  const template = await getWATemplate();

  const message = template
    .replace(/{namaOrtu}/g, namaOrtu)
    .replace(/{namaSiswa}/g, namaSiswa || "")
    .replace(/{link}/g, link)
    .replace(/{tanggalAcara}/g, tanggalAcara || EVENT_DATE)
    .replace(/{waktuAcara}/g, waktuAcara || EVENT_TIME)
    .replace(/{lokasiAcara}/g, lokasiAcara || EVENT_VENUE);

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
