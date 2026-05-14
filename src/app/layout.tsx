import type { Metadata } from "next";
import { Nunito, Amiri } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
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
    <html lang="id" className={`${nunito.variable} ${amiri.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}