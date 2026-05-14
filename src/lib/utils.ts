import crypto from "crypto";

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
 * DEPRECATED: Use POST /api/generate-wa instead (server-side template fetching).
 * Kept for backward compatibility if any code still calls it directly.
 */
export async function generateWhatsAppLink(
  namaOrtu: string,
  token: string,
  namaSiswa?: string,
  tanggalAcara?: string,
  waktuAcara?: string,
  lokasiAcara?: string
): Promise<string> {
  // Fallback: call the API endpoint
  try {
    const res = await fetch("/api/generate-wa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namaOrtu, token, namaSiswa, tanggalAcara, waktuAcara, lokasiAcara }),
    });
    const data = await res.json();
    if (res.ok) return data.url;
    throw new Error(data.error || "Failed to generate WA link");
  } catch (error) {
    console.error("generateWhatsAppLink fallback error:", error);
    // Ultimate fallback: hardcoded message
    const baseUrl = getBaseUrl();
    const link = `${baseUrl}/undangan/${token}`;
    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu ${namaOrtu},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah untuk Ananda ${namaSiswa || ""}.\n\nSilakan klik link berikut untuk melihat undangan:\n${link}\n\nKami tunggu kehadiran Anda.\nWassalamu'alaikum Wr. Wb.`
    );
    return `https://wa.me/?text=${text}`;
  }
}
