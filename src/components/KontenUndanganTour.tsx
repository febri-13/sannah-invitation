"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    driver: any;
  }
}

export default function KontenUndanganTour() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;

    const handleStart = () => {
      if (!window.driver) return;

      const el = (id: string) => document.querySelector(`[data-driver="${id}"]`);

      const driver = window.driver.js.driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        steps: [
          {
            element: el("tour-template"),
            popover: {
              title: "Template & Warna",
              description:
                "Pilih tema undangan (Glass Premium, Classic Gold, atau Modern Sage) dan atur warna utama & sekunder sesuai selera.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: el("tour-music"),
            popover: {
              title: "Musik Latar",
              description:
                "Upload file musik latar untuk undangan (max 10 MB). Centang auto-play jika ingin musik langsung diputar saat halaman terbuka.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: el("tour-layout"),
            popover: {
              title: "Layout & Tampilan",
              description:
                "Atur urutan, visibilitas, dan judul setiap seksi undangan. Klik icon gear untuk mengedit konten masing-masing seksi.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: el("tour-section-hero"),
            popover: {
              title: "Hero — Header Undangan",
              description:
                "Edit bismillah, judul acara, subtitle, deskripsi hero, dan logo sekolah.",
              side: "right",
              align: "start",
            },
          },
          {
            element: el("tour-section-details"),
            popover: {
              title: "Detail Acara",
              description:
                "Atur tanggal, waktu, lokasi, alamat lengkap, link Google Maps, dan link YouTube.",
              side: "right",
              align: "start",
            },
          },
          {
            element: el("tour-section-agenda"),
            popover: {
              title: "Susunan Acara",
              description:
                "Tambah, edit, atau hapus agenda acara. Setiap item bisa diatur waktu, icon, dan judulnya.",
              side: "right",
              align: "start",
            },
          },
          {
            element: el("tour-section-rsvp"),
            popover: {
              title: "Konfirmasi Kehadiran",
              description:
                "Atur jumlah maksimal orang tua/pendamping dan pilih opsi RSVP yang tersedia (Offline, Online, Tidak Hadir).",
              side: "right",
              align: "start",
            },
          },
          {
            element: el("tour-section-footer"),
            popover: {
              title: "Footer",
              description:
                "Edit teks header Arab dan footer undangan.",
              side: "right",
              align: "start",
            },
          },
          {
            element: el("tour-save"),
            popover: {
              title: "Simpan Perubahan",
              description:
                "Jangan lupa klik tombol ini setelah selesai mengedit agar perubahan tersimpan.",
              side: "top",
              align: "end",
            },
          },
        ].filter((s) => s.element),
      });

      driver.drive();
    };

    window.addEventListener("start-tour", handleStart);
    return () => window.removeEventListener("start-tour", handleStart);
  }, [loaded]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js"
        onLoad={() => setLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css"
      />
    </>
  );
}
