import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Undangan Akhirusannah",
  description: "Undangan digital perpisahan sekolah Akhirusannah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${notoArabic.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}