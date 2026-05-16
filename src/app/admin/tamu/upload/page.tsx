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
    <div className="min-h-screen p-4">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="glass p-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-secondary">Upload Tamu (CSV)</h1>
      </header>

      <div className="max-w-md mx-auto">
        {!success ? (
          <div className="glass-card p-6">
            <div className="glass p-4 rounded-lg mb-6">
              <h3 className="font-medium text-secondary mb-2">Format CSV</h3>
              <p className="text-sm text-gray-600">
                Format: <code>nama_siswa;jenis_kelamin;nama_ayah;nama_ibu;no_wa_ayah;no_wa_ibu</code>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Contoh: Fatimah;Perempuan;Ahmad Wijaya;Siti Aminah;081234567890;
              </p>
              <p className="text-xs text-gray-500 mt-2">
                *) jenis_kelamin wajib: &quot;Laki-laki&quot; atau &quot;Perempuan&quot;
              </p>
            </div>

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-primary hover:text-primary transition-colors glass-input"
              >
                <Upload className="w-5 h-5" />
                {file ? file.name : "Pilih file CSV"}
              </button>
            </div>

            {parsedData.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-success" />
                  <span className="font-medium text-gray-700">
                    {parsedData.length} data ditemukan
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto glass rounded-lg p-2">
                  {parsedData.map((row, i) => (
                    <div key={i} className="text-sm py-1 border-b last:border-0">
                      {row.nama_siswa} ({row.jenis_kelamin})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-danger/10 text-danger text-sm rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || parsedData.length === 0}
              className="glass-button w-full py-3 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="glass-card p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800">Upload Selesai</h2>
            </div>

            <div className="glass rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Berhasil:</span>
                <span className="font-medium text-success">{results?.success}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gagal:</span>
                <span className="font-medium text-danger">{results?.failed}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="glass-button flex-1 py-3 text-white font-medium"
              >
                Lihat Dashboard
              </button>
              <button
                onClick={handleReset}
                className="glass flex-1 py-3 text-gray-700 font-medium"
              >
                Upload Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}