"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader2, Copy, CheckCircle, X, Send } from "lucide-react";

export default function TambahTamuPage() {
  const router = useRouter();
  const [namaSiswa, setNamaSiswa] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [kelas, setKelas] = useState("");
  const [namaAyah, setNamaAyah] = useState("");
  const [namaIbu, setNamaIbu] = useState("");
  const [noWaAyah, setNoWaAyah] = useState("");
  const [noWaIbu, setNoWaIbu] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const [lastCreated, setLastCreated] = useState<{ token: string; namaSiswa: string; noWaAyah: string; noWaIbu: string; namaAyah: string; namaIbu: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const getActiveEvent = () => {
    const match = document.cookie.match(new RegExp("(^| )active_event_id=([^;]+)"));
    return match ? match[2] : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const eventId = getActiveEvent();

    try {
      const res = await fetch("/api/tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_siswa: namaSiswa,
          jenis_kelamin: jenisKelamin,
          kelas: kelas || undefined,
          nama_ayah: namaAyah || undefined,
          nama_ibu: namaIbu || undefined,
          no_wa_ayah: noWaAyah || undefined,
          no_wa_ibu: noWaIbu || undefined,
          event_id: eventId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setLastCreated({ token: data.token, namaSiswa, noWaAyah: noWaAyah || "", noWaIbu: noWaIbu || "", namaAyah, namaIbu });
        setToast({ show: true, message: "Tamu berhasil ditambahkan!", type: "success" });
        
        setNamaSiswa("");
        setJenisKelamin("");
        setKelas("");
        setNamaAyah("");
        setNamaIbu("");
        setNoWaAyah("");
        setNoWaIbu("");
        
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
      } else {
        setToast({ show: true, message: data.error || "Terjadi kesalahan", type: "error" });
        setTimeout(() => setToast({ show: false, message: "", type: "error" }), 3000);
      }
    } catch (error) {
      console.error("Gagal menambah tamu:", error);
      setToast({ show: true, message: "Gagal terhubung ke server", type: "error" });
      setTimeout(() => setToast({ show: false, message: "", type: "error" }), 3000);
    } finally {
      setLoading(false);
    }
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
                Kelas
              </label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: VI A"
              />
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
            <div className="mt-3 flex gap-2">
              {lastCreated.noWaAyah && (
                <button
                  onClick={async () => {
                    const namaOrtu = lastCreated.namaAyah || lastCreated.namaSiswa;
                    const cleanPhone = lastCreated.noWaAyah.replace(/[^0-9]/g, "").replace(/^0/, "62");
                    const body = `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu ${namaOrtu},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah untuk Ananda ${lastCreated.namaSiswa}.\n\nSilakan klik link berikut untuk melihat undangan:\n${typeof window !== "undefined" ? window.location.origin : ""}/undangan/${lastCreated.token}\n\nKami tunggu kehadiran Anda.\nWassalamu'alaikum Wr. Wb.`;
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(body)}`, "_blank");
                  }}
                  className="flex-1 py-2 bg-success text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Kirim ke Ayah
                </button>
              )}
              {lastCreated.noWaIbu && (
                <button
                  onClick={async () => {
                    const namaOrtu = lastCreated.namaIbu || lastCreated.namaSiswa;
                    const cleanPhone = lastCreated.noWaIbu.replace(/[^0-9]/g, "").replace(/^0/, "62");
                    const body = `Assalamu'alaikum Wr. Wb.\n\nBapak/Ibu ${namaOrtu},\n\nDengan hormat, kami mengundang Anda untuk menghadiri acara perpisahan sekolah Akhirusannah untuk Ananda ${lastCreated.namaSiswa}.\n\nSilakan klik link berikut untuk melihat undangan:\n${typeof window !== "undefined" ? window.location.origin : ""}/undangan/${lastCreated.token}\n\nKami tunggu kehadiran Anda.\nWassalamu'alaikum Wr. Wb.`;
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(body)}`, "_blank");
                  }}
                  className="flex-1 py-2 bg-success text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Kirim ke Ibu
                </button>
              )}
            </div>
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