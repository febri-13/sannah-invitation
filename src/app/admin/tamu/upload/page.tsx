"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, CheckCircle, FileSpreadsheet } from "lucide-react";

interface ParsedRow {
  nama_siswa: string;
  jenis_kelamin: string;
  nama_ayah?: string;
  nama_ibu?: string;
  no_wa_ayah?: string;
  no_wa_ibu?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("File harus berformat CSV");
      return;
    }

    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      
      const data: ParsedRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(";");
        if (parts.length >= 2) {
          const nama_siswa = parts[0].trim();
          const jenis_kelamin = parts[1].trim();
          const nama_ayah = parts[2]?.trim() || undefined;
          const nama_ibu = parts[3]?.trim() || undefined;
          const no_wa_ayah = parts[4]?.trim() || undefined;
          const no_wa_ibu = parts[5]?.trim() || undefined;
          
          if (nama_siswa && jenis_kelamin) {
            data.push({ 
              nama_siswa, 
              jenis_kelamin,
              nama_ayah: nama_ayah || undefined,
              nama_ibu: nama_ibu || undefined,
              no_wa_ayah: no_wa_ayah || undefined,
              no_wa_ibu: no_wa_ibu || undefined,
            });
          }
        }
      }
      
      setParsedData(data);
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setLoading(true);
    setError("");

    let successCount = 0;
    let failedCount = 0;

    for (const row of parsedData) {
      try {
        const res = await fetch("/api/tamu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });

        if (res.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    setResults({ success: successCount, failed: failedCount });
    setSuccess(true);
    setLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setSuccess(false);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/90 backdrop-blur-md w-full sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-white/40">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface hover:bg-white/40 px-3 py-2 rounded-full transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-on-surface">Upload Tamu (CSV)</h1>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {!success ? (
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-2xl p-5">
              <h3 className="font-semibold text-on-surface mb-3">Format CSV</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Gunakan delimiter <code className="bg-white/60 px-1.5 py-0.5 rounded text-xs font-mono">;</code> (titik koma)
              </p>
              <div className="bg-white/60 rounded-xl p-3 mt-3 font-mono text-xs text-on-surface-variant leading-relaxed break-all">
                nama_siswa;jenis_kelamin;nama_ayah;nama_ibu;no_wa_ayah;no_wa_ibu
              </div>
              <p className="text-xs text-on-surface-variant mt-3">
                Contoh: <span className="font-mono">Fatimah;Perempuan;Ahmad Wijaya;Siti Aminah;081234567890;</span>
              </p>
              <p className="text-xs text-on-surface-variant mt-2">
                *) <span className="font-medium">jenis_kelamin</span> wajib: &quot;Laki-laki&quot; atau &quot;Perempuan&quot;
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 glass-input"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">{file ? file.name : "Pilih file CSV"}</span>
              </button>
            </div>

            {parsedData.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-semibold text-on-surface text-sm">
                    {parsedData.length} data ditemukan
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto bg-surface-container-low rounded-2xl p-3 space-y-1">
                  {parsedData.map((row, i) => (
                    <div key={i} className="text-sm py-1.5 px-3 rounded-xl bg-white/60 text-on-surface">
                      {row.nama_siswa} <span className="text-on-surface-variant">({row.jenis_kelamin})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 text-danger text-sm rounded-2xl">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || parsedData.length === 0}
              className="bg-primary text-white hover:bg-blue-700 w-full py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {parsedData.length} Tamu
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">Upload Selesai</h2>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Berhasil</span>
                <span className="font-semibold text-success bg-success/10 px-3 py-1 rounded-full text-sm">{results?.success}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Gagal</span>
                <span className="font-semibold text-danger bg-danger/10 px-3 py-1 rounded-full text-sm">{results?.failed}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="bg-primary text-white hover:bg-blue-700 flex-1 py-3 rounded-full font-semibold shadow-sm transition-colors"
              >
                Lihat Dashboard
              </button>
              <button
                onClick={handleReset}
                className="glass-panel text-on-surface hover:bg-white/80 flex-1 py-3 rounded-full font-semibold transition-colors"
              >
                Upload Lagi
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}