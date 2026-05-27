"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(false);
  const pendingClearRef = useRef<Promise<void>>(Promise.resolve());
  const autoResetRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [namaTamu, setNamaTamu] = useState("");

  const stopCameraTracks = () => {
    try {
      document.querySelectorAll("video").forEach((v) => {
        if (v.srcObject instanceof MediaStream) {
          v.srcObject.getTracks().forEach((t) => t.stop());
        }
      });
    } catch {}
  };

  const destroyScanner = () => {
    clearTimeout(autoResetRef.current);
    if (scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      pendingClearRef.current = scanner.clear().catch(() => {});
    }
  };

  const startScanner = async () => {
    await pendingClearRef.current;

    if (!mountedRef.current || scannerRef.current) return;

    document.getElementById("qr-reader")?.replaceChildren();

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        if (processingRef.current) return;
        processingRef.current = true;

        try {
          scanner.pause(true);

          const res = await fetch("/api/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: decodedText }),
          });

          if (!mountedRef.current) return;

          let data: Record<string, unknown>;
          try {
            data = await res.json();
          } catch {
            setStatus("error");
            setMessage("Gagal memproses respons server");
            destroyScanner();
            return;
          }

          clearTimeout(autoResetRef.current);
          destroyScanner();
          if (!mountedRef.current) return;

          if (res.ok) {
            setStatus("success");
            setNamaTamu(`${data.nama_ortu} dan ${data.nama_siswa}`);
            setMessage("Berhasil check-in!");
            autoResetRef.current = setTimeout(() => {
              if (mountedRef.current) resetScanner();
            }, 1500);
          } else {
            setStatus("error");
            setMessage((data.error as string) || "Terjadi kesalahan");
            autoResetRef.current = setTimeout(() => {
              if (mountedRef.current) resetScanner();
            }, 2500);
          }
        } catch {
          destroyScanner();
          if (mountedRef.current) {
            setStatus("error");
            setMessage("Gagal terhubung ke server");
            autoResetRef.current = setTimeout(() => {
              if (mountedRef.current) resetScanner();
            }, 2500);
          }
        } finally {
          processingRef.current = false;
        }
      },
      () => {},
    );

    if (mountedRef.current) setStatus("scanning");
  };

  const resetScanner = async () => {
    clearTimeout(autoResetRef.current);
    setStatus("idle");
    setMessage("");
    setNamaTamu("");
    destroyScanner();
    await startScanner();
  };

  useEffect(() => {
    mountedRef.current = true;
    startScanner();

    return () => {
      mountedRef.current = false;
      stopCameraTracks();
      destroyScanner();
    };
  }, []);

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="glass p-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-secondary">Scanner QR Code</h1>
      </header>

      <div className="max-w-md mx-auto">
        <div className={`glass-card p-4 ${status === "idle" || status === "scanning" ? "" : "hidden"}`}>
          <div id="qr-reader" className="w-full" />
          <p className="text-center text-gray-500 mt-4">Arahkan kamera ke QR Code tamu</p>
        </div>

        {(status === "success" || status === "error") && (
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
        )}
      </div>
    </div>
  );
}
