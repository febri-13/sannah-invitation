"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";
import { Camera, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [namaTamu, setNamaTamu] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      (error) => {
        // Ignore scan errors
      }
    );

    setStatus("scanning");

    return () => {
      scanner.clear();
    };
  }, []);

  const handleScan = async (token: string) => {
    if (status === "success" || status === "error") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setNamaTamu(`${data.nama_ortu} dan ${data.nama_siswa}`);
        setMessage("Berhasil check-in!");
      } else {
        setStatus("error");
        setMessage(data.error || "Terjadi kesalahan");
      }
    } catch {
      setStatus("error");
      setMessage("Gagal terhubung ke server");
    }
  };

  const resetScanner = () => {
    setStatus("idle");
    setMessage("");
    setNamaTamu("");
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="p-2 bg-white rounded-lg shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-leaf-green">Scanner QR Code</h1>
      </header>

      <div className="max-w-md mx-auto">
        {status === "success" || status === "error" ? (
          <div className={`p-6 rounded-xl text-center ${
            status === "success" ? "bg-green-50" : "bg-red-50"
          }`}>
            {status === "success" ? (
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            )}
            <p className="text-lg font-medium mb-2">{message}</p>
            {status === "success" && (
              <p className="text-gray-600">{namaTamu}</p>
            )}
            <button
              onClick={resetScanner}
              className="mt-6 px-6 py-3 bg-islamic-teal text-white rounded-lg font-medium"
            >
              Scan Lagi
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div id="qr-reader" className="w-full"></div>
            <p className="text-center text-gray-500 mt-4">
              Arahkan kamera ke QR Code tamu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}