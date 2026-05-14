"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/server";
import { useRouter } from "next/navigation";
import { Settings, Save, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Setting {
  key: string;
  value: string;
  label: string;
  description: string;
  updated_at: string;
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
      const res = await fetch("/api/admin/settings?key=wa_template_invitation");
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
        body: JSON.stringify({ key: setting.key, value }),
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

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("template-textarea") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + placeholder + value.slice(end);
    setValue(newValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-islamic-teal"></div>
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gold/20 rounded-lg">
            <Settings className="w-6 h-6 text-gold-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Pengaturan</h1>
            <p className="text-gray-500 text-sm">Kelola template pesan WhatsApp undangan</p>
          </div>
        </div>

        {/* Error & Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              Pengaturan berhasil disimpan!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Setting Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gold/20 p-6">
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
                  className="px-2 py-1 bg-gray-100 hover:bg-gold/10 text-gray-700 text-xs font-mono rounded border border-gray-200 hover:border-gold/30 transition-colors"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-islamic-teal focus:ring-2 focus:ring-islamic-teal/20 focus:outline-none resize-none font-mono text-sm leading-relaxed bg-gray-50/50"
              placeholder="Tulis template pesan..."
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{value.length} / 5000 karakter</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-islamic-teal to-leaf-green text-white rounded-xl font-medium hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gold text-gold-dark rounded-xl font-medium hover:bg-gold/5 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 bg-islamic-teal/5 border border-islamic-teal/20 rounded-xl">
          <h4 className="font-semibold text-islamic-teal mb-2">Placeholders yang tersedia:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-gold-dark">{'{namaOrtu}'}</code> — Nama orang tua (Bapak/Ibu)</li>
            </ul>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="bg-gray-100 px-2 py-0.5 rounded text-gold-dark">{'{namaSiswa}'}</code> — Nama anak/siswa</li>
            </ul>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="bg-gray-100 px-2 py-0.5 rounded text-gold-dark">{'{link}'}</code> — Link undangan (otomatis diisi)</li>
            </ul>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="bg-gray-100 px-2 py-0.5 rounded text-gold-dark">{'{tanggalAcara}'}</code> — Tanggal acara</li>
            </ul>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <code className="bg-gray-100 px-2 py-0.5 rounded text-gold-dark">{'{waktuAcara}'}</code> — Waktu acara</li>
            </ul>
             <ul className="text-sm text-gray-600 space-y-1">
               <li>
                 <code className="bg-gray-100 px-2 py-0.5 rounded text-gold-dark">{'{lokasiAcara}'}</code> — Lokasi acara</li>
               </ul>
           </div>
      </motion.div>

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
              className="bg-white rounded-2xl max-w-md w-full p-6 relative"
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
                <Eye className="w-5 h-5 text-islamic-teal" />
                Preview Pesan WhatsApp
              </h3>

              {/* WhatsApp chat bubble mock */}
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
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
    </div>
  );
}
