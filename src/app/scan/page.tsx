"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const waitForElement = (id: string): Promise<void> =>
  new Promise((resolve) => {
    const check = () =>
      document.getElementById(id) ? resolve() : requestAnimationFrame(check);
    check();
  });

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false);
  const handleScanRef = useRef<((token: string) => Promise<void>) | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [namaTamu, setNamaTamu] = useState("");

  const startScanner = async () => {
    await waitForElement("qr-reader");

    try {
      await scannerRef.current?.clear();
    } catch {}

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => handleScanRef.current?.(decodedText),
      () => {},
    );

    setStatus("scanning");
  };

  useEffect(() => {
    handleScanRef.current = handleScan;
  });

  useEffect(() => {
    startScanner();

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  const handleScan = async (token: string) => {
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      scannerRef.current?.pause(true);

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        setStatus("error");
        setMessage("Gagal memproses respons server");
        scannerRef.current?.clear();
        return;
      }

      if (res.ok) {
        await scannerRef.current?.clear();
        setStatus("success");
        setNamaTamu(`${data.nama_ortu} dan ${data.nama_siswa}`);
        setMessage("Berhasil check-in!");
      } else {
        await scannerRef.current?.clear();
        setStatus("error");
        setMessage((data.error as string) || "Terjadi kesalahan");
      }
    } catch {
      setStatus("error");
      setMessage("Gagal terhubung ke server");
      scannerRef.current?.clear();
    } finally {
      processingRef.current = false;
    }
  };

  const resetScanner = () => {
    setStatus("idle");
    setMessage("");
    setNamaTamu("");
    startScanner();
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
          <div className={`glass-card p-6 rounded-xl text-center ${status === "success" ? "bg-success/10" : "bg-danger/10"}`}>
            {status === "success" ? (
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-danger mx-auto mb-4" />
            )}
            <p className="text-lg font-medium mb-2">{message}</p>
            {status === "success" && <p className="text-gray-600">{namaTamu}</p>}
            <button onClick={resetScanner} className="glass-button mt-6 px-6 py-3 text-white font-medium">
              Scan Lagi
            </button>
          </div>
        ) : (
          <div className="glass-card p-4">
            <div id="qr-reader" className="w-full" />
            <p className="text-center text-gray-500 mt-4">Arahkan kamera ke QR Code tamu</p>
          </div>
        )}
      </div>
    </div>
  );
}
