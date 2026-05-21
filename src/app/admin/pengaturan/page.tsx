"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveEvent } from "@/lib/event-cookie";
import { Settings, Save, Eye, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Setting {
  key: string;
  value: string;
  label: string;
  description: string;
  updated_at: string;
  event_id: string | null;
}

export default function PengaturanPage() {
  const router = useRouter();
  const [setting, setSetting] = useState<Setting | null>(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Dummy data for preview
  const previewData = {
    namaOrtu: "Bapak Ahmad",
    namaSiswa: "Ananda Fatima",
    tanggalAcara: "Sabtu, 21 Juni 2025",
    waktuAcara: "08.00 - 12.00 WIB",
    lokasiAcara: "MTsN 1 Kota",
    link: "https://sannah-inv.vercel.app/undangan/ABC123",
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const eventId = getActiveEvent();
      const params = new URLSearchParams({ key: "wa_template_invitation" });
      if (eventId) params.set("event_id", eventId);

      const res = await fetch(`/api/admin/settings?${params}`);
      const data = await res.json();
      if (res.ok) {
        setSetting(data);
        setValue(data.value);
      } else {
        setError(data.error || "Gagal mengambil pengaturan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!setting) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: setting.key, value, event_id: setting.event_id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSetting(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        // Clear cache by forcing a refetch next time getWATemplate is called
        // Invalidate via cache-busting? For now TTL will handle
      } else {
        setError(data.error || "Gagal menyimpan pengaturan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    }

    setSaving(false);
  };

  const   insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("template-textarea") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + placeholder + value.slice(end);
    setValue(newValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Kembali ke Dashboard</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="glass p-3">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Pengaturan</h1>
            <p className="text-gray-500 text-sm">Kelola template pesan WhatsApp undangan</p>
          </div>
        </div>

        {/* Error & Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-danger/10 border-l-4 border-danger text-danger rounded-r-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-6 p-4 bg-success/10 border-l-4 border-success text-success rounded-r-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              Pengaturan berhasil disimpan!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Setting Card */}
        <div className="glass-card p-6">
          <div className="mb-4">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              {setting?.label || "Template Pesan"}
            </label>
            {setting?.description && (
              <p className="text-sm text-gray-500 mb-4">{setting.description}</p>
            )}

            {/* Placeholder helper */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-gray-500">Placeholders:</span>
              {[
                "{namaOrtu}",
                "{namaSiswa}",
                "{link}",
                "{tanggalAcara}",
                "{waktuAcara}",
                "{lokasiAcara}",
              ].map((ph) => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => insertPlaceholder(ph)}
                  className="px-2 py-1 glass hover:bg-primary/10 text-gray-700 text-xs font-mono rounded border border-gray-200 hover:border-primary/30 transition-colors"
                >
                  {ph}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              id="template-textarea"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={12}
              className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm leading-relaxed"
              placeholder="Tulis template pesan..."
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{value.length} / 5000 karakter</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="glass-button flex items-center gap-2 px-6 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="glass flex items-center gap-2 px-6 py-3 text-secondary font-medium hover:bg-primary/10 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 glass p-4">
          <h4 className="font-semibold text-primary mb-2">Placeholders yang tersedia:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <code className="glass px-2 py-0.5 rounded text-primary">{'{namaOrtu}'}</code> — Nama orang tua (Bapak/Ibu)</li>
          </ul>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <code className="glass px-2 py-0.5 rounded text-primary">{'{namaSiswa}'}</code> — Nama anak/siswa</li>
          </ul>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <code className="glass px-2 py-0.5 rounded text-primary">{'{link}'}</code> — Link undangan (otomatis diisi)</li>
          </ul>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <code className="glass px-2 py-0.5 rounded text-primary">{'{tanggalAcara}'}</code> — Tanggal acara</li>
          </ul>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <code className="glass px-2 py-0.5 rounded text-primary">{'{waktuAcara}'}</code> — Waktu acara</li>
          </ul>
           <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="glass px-2 py-0.5 rounded text-primary">{'{lokasiAcara}'}</code> — Lokasi acara</li>
              </ul>
          </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                className="glass-card max-w-md w-full p-6 relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Preview Pesan WhatsApp
                </h3>

                {/* WhatsApp chat bubble mock */}
                <div className="glass p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      A
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Admin Akhirusannah</p>
                      <div className="mt-1 whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                        {value
                          .replace(/{namaOrtu}/g, previewData.namaOrtu)
                          .replace(/{namaSiswa}/g, previewData.namaSiswa)
                          .replace(/{link}/g, previewData.link)
                          .replace(/{tanggalAcara}/g, previewData.tanggalAcara)
                          .replace(/{waktuAcara}/g, previewData.waktuAcara)
                          .replace(/{lokasiAcara}/g, previewData.lokasiAcara)}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 text-center">
                  *Preview dengan data dummy. Pesan sebenarnya akan diganti dengan data tamu.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
  }

