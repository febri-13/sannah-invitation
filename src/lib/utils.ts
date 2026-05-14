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

export function generateWhatsAppLink(namaOrtu: string, token: string): string {
  const baseUrl = getBaseUrl();
  const link = `${baseUrl}/undangan/${token}`;
  const text = encodeURIComponent(
    `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu ${namaOrtu},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah.\n\nSilakan klik link berikut untuk melihat undangan:\n${link}\n\nKami tunggu kehadiran Anda.\nWassalamu'alaikum Wr. Wb.`
  );
  return `https://wa.me/?text=${text}`;
}