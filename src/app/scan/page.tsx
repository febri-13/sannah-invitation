"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";
import { Camera, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  // processingRef prevents concurrent/duplicate API calls even when React
  // re-renders with stale closure values (e.g. 10fps foreverScan loop beating state updates).
  const processingRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [namaTamu, setNamaTamu] = useState("");
  const supabase = createClient();

  const startScanner = (clearOld = false) => {
    if (clearOld) {
      scannerRef.current?.clear().catch(() => {});
    }

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
      () => {
        // Ignore scan errors
      }
    );

    setStatus("scanning");
  };

  useEffect(() => {
    startScanner();

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  const handleScan = async (token: string) => {
    // Guard 1 (ref): prevents re-entry from the 10fps foreverScan loop even before
    // React can commit any state change. Ref reads are always current — no stale closure.
    if (processingRef.current) return;

    processingRef.current = true;

    // Pause the scanner to stop the foreverScan loop from producing more callbacks.
    scannerRef.current?.pause(true);

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
        // Resume the camera stream on error so user can scan again immediately
        const inner2 = scannerRef.current as unknown as {
          html5Qrcode?: { resume: (sh: boolean) => void };
        };
        inner2.html5Qrcode?.resume?.(true);
      }
    } catch {
      setStatus("error");
      setMessage("Gagal terhubung ke server");
      const inner3 = scannerRef.current as unknown as {
        html5Qrcode?: { resume: (sh: boolean) => void };
      };
      inner3.html5Qrcode?.resume?.(true);
    } finally {
      processingRef.current = false;
    }
  };

  const resetScanner = () => {
    setStatus("idle");
    setMessage("");
    setNamaTamu("");
    setTimeout(() => startScanner(true), 100);
  };

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="glass p-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-secondary">Scanner QR Code</h1>
      </header>

      <div className="max-w-md mx-auto">
        {status === "success" || status === "error" ? (
          <div className={`glass-card p-6 rounded-xl text-center ${
            status === "success" ? "bg-success/10" : "bg-danger/10"
          }`}>
            {status === "success" ? (
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-danger mx-auto mb-4" />
            )}
            <p className="text-lg font-medium mb-2">{message}</p>
            {status === "success" && (
              <p className="text-gray-600">{namaTamu}</p>
            )}
            <button
              onClick={resetScanner}
              className="glass-button mt-6 px-6 py-3 text-white font-medium"
            >
              Scan Lagi
            </button>
          </div>
        ) : (
          <div className="glass-card p-4">
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