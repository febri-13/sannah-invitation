"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, MapPin, Video, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RSVPFormProps {
  token: string;
  existingRsvp: {
    kehadiran_ortu: string | null;
    kehadiran_anak: string | null;
    pesan: string | null;
    created_at: string;
  } | null;
  legacyRsvp: {
    kehadiran: string;
    jumlah: number;
    pesan: string | null;
    created_at: string;
  } | null;
}

export default function RSVPForm({ token, existingRsvp, legacyRsvp }: RSVPFormProps) {
  const [kehadiranOrtu, setKehadiranOrtu] = useState<"Offline" | "Online" | "Tidak Hadir" | "">(
    (existingRsvp?.kehadiran_ortu as "Offline" | "Online" | "Tidak Hadir" | null) || ""
  );
  const [kehadiranAnak, setKehadiranAnak] = useState<"Offline" | "Online" | "Tidak Hadir" | "">(
    (existingRsvp?.kehadiran_anak as "Offline" | "Online" | "Tidak Hadir" | null) || ""
  );
  const [pesan, setPesan] = useState(existingRsvp?.pesan || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showNewForm, setShowNewForm] = useState(!legacyRsvp);

  const totalHadir =
    (kehadiranOrtu === "Offline" || kehadiranOrtu === "Online" ? 1 : 0) +
    (kehadiranAnak === "Offline" || kehadiranAnak === "Online" ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kehadiranOrtu || !kehadiranAnak) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          kehadiran_ortu: kehadiranOrtu,
          kehadiran_anak: kehadiranAnak,
          pesan: pesan || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Terjadi kesalahan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <motion.div
        className="glass-card p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle className="w-20 h-20 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Jazakumullah khair
        </h3>
        <p className="text-gray-600">
          Konfirmasi Anda telah diterima. Kami tunggu kehadiran Anda.
        </p>
      </motion.div>
    );
  }

  // Legacy RSVP display
  if (legacyRsvp && !showNewForm) {
    return (
      <motion.div
        className="glass p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-secondary">
              Data Konfirmasi Lama
            </h4>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Status: <span className="font-semibold">{legacyRsvp.kehadiran}</span>
              <br />
              Jumlah: {legacyRsvp.jumlah} orang
              {legacyRsvp.pesan && (
                <>
                  <br />
                  Pesan: <span className="italic">"{legacyRsvp.pesan}"</span>
                </>
              )}
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-3 text-sm font-medium text-primary underline hover:no-underline transition-all"
            >
              Update Kehadiran →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // New dual-selection form
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="font-bold text-gray-800 mb-4 text-lg">
        Konfirmasi Kehadiran
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Orang Tua */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kehadiran Orang Tua
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Offline", "Online", "Tidak Hadir"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setKehadiranOrtu(opt)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  kehadiranOrtu === opt
                    ? "border-primary ring-2 ring-primary ring-offset-2 bg-primary/5"
                    : "glass hover:border-primary/50"
                }`}
              >
                {opt === "Offline" && <MapPin className="w-5 h-5 text-primary" />}
                {opt === "Online" && <Video className="w-5 h-5 text-primary" />}
                {opt === "Tidak Hadir" && <X className="w-5 h-5 text-gray-400" />}
                <span className="text-xs font-medium text-gray-700">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Anak */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kehadiran Anak
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["Offline", "Online", "Tidak Hadir"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setKehadiranAnak(opt)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  kehadiranAnak === opt
                    ? "border-primary ring-2 ring-primary ring-offset-2 bg-primary/5"
                    : "glass hover:border-primary/50"
                }`}
              >
                {opt === "Offline" && <MapPin className="w-5 h-5 text-primary" />}
                {opt === "Online" && <Video className="w-5 h-5 text-primary" />}
                {opt === "Tidak Hadir" && <X className="w-5 h-5 text-gray-400" />}
                <span className="text-xs font-medium text-gray-700">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="glass p-3">
          <p className="text-center text-primary font-semibold">
            Total hadir: {totalHadir} orang
          </p>
        </div>

        {/* Pesan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pesan/Doa (opsional)
          </label>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-lg resize-none outline-none transition-colors"
            rows={3}
            placeholder="Tulis pesan atau doa untuk siswa..."
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {pesan.length}/200
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="p-3 bg-danger/10 border-l-4 border-danger text-danger text-sm rounded-r-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !kehadiranOrtu || !kehadiranAnak}
          className="glass-button w-full py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Simpan Kehadiran
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
