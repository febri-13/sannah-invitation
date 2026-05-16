"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2, Copy, CheckCircle, X } from "lucide-react";

export default function TambahTamuPage() {
  const router = useRouter();
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [namaAyah, setNamaAyah] = useState("");
  const [namaIbu, setNamaIbu] = useState("");
  const [noWaAyah, setNoWaAyah] = useState("");
  const [noWaIbu, setNoWaIbu] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const [lastCreated, setLastCreated] = useState<{ token: string; namaSiswa: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/tamu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama_siswa: namaSiswa,
        jenis_kelamin: jenisKelamin,
        nama_ayah: namaAyah || undefined,
        nama_ibu: namaIbu || undefined,
        no_wa_ayah: noWaAyah || undefined,
        no_wa_ibu: noWaIbu || undefined,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setLastCreated({ token: data.token, namaSiswa });
      setToast({ show: true, message: "Tamu berhasil ditambahkan!", type: "success" });
      
      setNamaSiswa("");
      setJenisKelamin("");
      setNamaAyah("");
      setNamaIbu("");
      setNoWaAyah("");
      setNoWaIbu("");
      
      setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    } else {
      setToast({ show: true, message: data.error || "Terjadi kesalahan", type: "error" });
      setTimeout(() => setToast({ show: false, message: "", type: "error" }), 3000);
    }

    setLoading(false);
  };

  const copyLink = () => {
    if (!lastCreated) return;
    const link = `${window.location.origin}/undangan/${lastCreated.token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <h1 className="text-xl font-bold text-secondary">Tambah Tamu</h1>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Siswa <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={namaSiswa}
                onChange={(e) => setNamaSiswa(e.target.value)}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Fatimah"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin <span className="text-danger">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setJenisKelamin("Laki-laki")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    jenisKelamin === "Laki-laki"
                      ? "bg-primary text-white"
                      : "glass hover:bg-primary/10"
                  }`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setJenisKelamin("Perempuan")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    jenisKelamin === "Perempuan"
                      ? "bg-pink-500 text-white"
                      : "glass hover:bg-pink-500/10"
                  }`}
                >
                  Perempuan
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Ayah
              </label>
              <input
                type="text"
                value={namaAyah}
                onChange={(e) => setNamaAyah(e.target.value)}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Opsional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Ibu
              </label>
              <input
                type="text"
                value={namaIbu}
                onChange={(e) => setNamaIbu(e.target.value)}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Opsional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. WA Ayah
              </label>
              <input
                type="tel"
                value={noWaAyah}
                onChange={(e) => setNoWaAyah(e.target.value)}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: 081234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. WA Ibu
              </label>
              <input
                type="tel"
                value={noWaIbu}
                onChange={(e) => setNoWaIbu(e.target.value)}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Opsional"
              />
            </div>

            {error && (
              <div className="p-3 bg-danger/10 text-danger text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !namaSiswa || !jenisKelamin}
              className="glass-button w-full py-3 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Tambah Tamu
                </>
              )}
            </button>
          </form>
        </div>

        {lastCreated && (
          <div className="glass p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Tamu terakhir: {lastCreated.namaSiswa}</span>
            </div>
            <div className="glass p-3">
              <p className="text-sm text-gray-500 mb-1">Link Undangan</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-700 break-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}/undangan/{lastCreated.token}
                </code>
                <button
                  onClick={copyLink}
                  className="p-2 text-primary hover:bg-primary/10 rounded"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                const waLink = `https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu ${namaAyah || lastCreated.namaSiswa},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah.\n\nSilakan klik link berikut untuk melihat undangan:\n${typeof window !== "undefined" ? window.location.origin : ""}/undangan/${lastCreated.token}\n\nKami tunggu kehadiran Anda.\nWassalamu'alaikum Wr. Wb.`)}`;
                window.open(waLink, "_blank");
              }}
              className="mt-3 w-full py-2 bg-success text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.173-.185.296-.3.396-.3.127 0 .347.1.528.3.214.233.734.794.734 1.854 0 .813-.594 1.423-1.447 1.683-.274.085-.611.104-.886.04-.304-.073-.609-.114-.87-.057-.26.054-.495.084-.705.084-.207 0-.542-.027-.78-.121-.237-.093-.398-.143-.571.214-.172.297-.591.794-.644.907-.053.113-.001.283.07.38.07.097.185.293.315.414.127.12.213.21.304.26.091.049.182.097.245.164.063.067.097.128.132.192.035.065.035.13.021.2-.014.07-.06.174-.09.26z" />
              </svg>
              Kirim WhatsApp
            </button>
          </div>
        )}
      </div>

      {toast.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === "success" ? "bg-success text-white" : "bg-danger text-white"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}