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
    created_at: string | null;
  } | null;
  legacyRsvp: {
    kehadiran: string;
    jumlah: number;
    pesan: string | null;
    created_at: string | null;
  } | null;
}

const pillStyle = (active: boolean) => ({
  flex: 1,
  padding: "12px 6px",
  background: active ? "#C26A4A" : "rgba(255,248,235,0.55)",
  backdropFilter: "blur(10px)" as const,
  color: active ? "#F5EEE0" : "#2A2520",
  border: active ? "1px solid #C26A4A" : "1px solid rgba(255,255,255,0.6)",
  borderRadius: 14,
  cursor: "pointer" as const,
  display: "flex" as const,
  flexDirection: "column" as const,
  alignItems: "center" as const,
  gap: 6,
  boxShadow: active ? "0 6px 16px rgba(194,106,74,0.3)" : "0 2px 6px rgba(58,36,20,0.05)",
  transition: "all 0.15s ease",
});

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
      <div className="px-[22px] py-[10px]">
        <motion.div
          className="glass-card p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: "#5C7058" }} />
          <h3 className="font-serif-display text-[24px] italic font-medium mb-2" style={{ color: "#2A2520" }}>
            Jazakumullah khair
          </h3>
          <p className="text-[14px] leading-[1.6]" style={{ color: "#7a6655" }}>
            Konfirmasi Anda telah diterima. Kami tunggu kehadiran Anda.
          </p>
        </motion.div>
      </div>
    );
  }

  if (legacyRsvp && !showNewForm) {
    return (
      <div className="px-[22px] py-[10px]">
        <motion.div
          className="glass-chip p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(255,248,235,0.45)" }}
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#C9A35E" }} />
            <div className="flex-1">
              <h4 className="font-semibold text-[14px]" style={{ color: "#8B4A2F" }}>
                Data Konfirmasi Lama
              </h4>
              <p className="text-[13px] leading-relaxed mt-1" style={{ color: "#7a6655" }}>
                Status: <span className="font-semibold" style={{ color: "#2A2520" }}>{legacyRsvp.kehadiran}</span>
                <br />
                Jumlah: {legacyRsvp.jumlah} orang
                {legacyRsvp.pesan && (
                  <>
                    <br />
                    Pesan: <span className="italic">&ldquo;{legacyRsvp.pesan}&rdquo;</span>
                  </>
                )}
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="mt-3 text-[13px] font-medium underline hover:no-underline transition-all"
                style={{ color: "#C26A4A" }}
              >
                Update Kehadiran →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-[22px] py-[10px]">
      <motion.div
        className="glass-card p-[24px_20px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-serif-display text-[22px] italic" style={{ color: "#2A2520" }}>
          Konfirmasi Kehadiran
        </p>
        <p className="font-mono-label text-[9px] tracking-[0.22em] mb-4" style={{ color: "#8B4A2F" }}>
          MOHON ISI SEBELUM HARI H
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="font-mono-label text-[9px] tracking-[0.22em] mb-2" style={{ color: "#8B4A2F" }}>
              ORANG TUA
            </p>
            <div className="flex gap-2">
              {(["Offline", "Online", "Tidak Hadir"] as const).map((opt) => (
                <button key={opt} type="button" onClick={() => setKehadiranOrtu(opt)} style={pillStyle(kehadiranOrtu === opt)}>
                  {opt === "Offline" && <MapPin size={16} style={{ color: kehadiranOrtu === opt ? "#F5EEE0" : "#C26A4A" }} />}
                  {opt === "Online" && <Video size={16} style={{ color: kehadiranOrtu === opt ? "#F5EEE0" : "#C26A4A" }} />}
                  {opt === "Tidak Hadir" && <X size={16} style={{ color: kehadiranOrtu === opt ? "#F5EEE0" : "#7a6655" }} />}
                  <span className="font-mono-label text-[9px] tracking-[0.16em] font-semibold">{opt.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono-label text-[9px] tracking-[0.22em] mb-2" style={{ color: "#8B4A2F" }}>
              ANAK
            </p>
            <div className="flex gap-2">
              {(["Offline", "Online", "Tidak Hadir"] as const).map((opt) => (
                <button key={opt} type="button" onClick={() => setKehadiranAnak(opt)} style={pillStyle(kehadiranAnak === opt)}>
                  {opt === "Offline" && <MapPin size={16} style={{ color: kehadiranAnak === opt ? "#F5EEE0" : "#C26A4A" }} />}
                  {opt === "Online" && <Video size={16} style={{ color: kehadiranAnak === opt ? "#F5EEE0" : "#C26A4A" }} />}
                  {opt === "Tidak Hadir" && <X size={16} style={{ color: kehadiranAnak === opt ? "#F5EEE0" : "#7a6655" }} />}
                  <span className="font-mono-label text-[9px] tracking-[0.16em] font-semibold">{opt.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-chip p-3 text-center" style={{ background: "rgba(194,106,74,0.12)" }}>
            <p className="font-mono-label text-[10px] tracking-[0.2em] font-semibold" style={{ color: "#C26A4A" }}>
              TOTAL HADIR: {totalHadir} ORANG
            </p>
          </div>

          <div>
            <p className="font-mono-label text-[9px] tracking-[0.22em] mb-2" style={{ color: "#8B4A2F" }}>
              UCAPAN &amp; DOA
            </p>
            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="glass-input w-full px-4 py-3 resize-none outline-none text-[13px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#2A2520" }}
              rows={3}
              placeholder="Tulis doa atau ucapan untuk siswa…"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono-label text-[9px] tracking-[0.18em]" style={{ color: "#a09080" }}>
                {pesan.length}/200
              </span>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="p-3 text-[13px] rounded-[12px]"
                style={{ background: "rgba(181,64,59,0.12)", color: "#B5403B" }}
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

          <button
            type="submit"
            disabled={loading || !kehadiranOrtu || !kehadiranAnak}
            className="glass-button w-full py-[14px] text-[#F5EEE0] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[10px]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.22em",
              fontSize: 11,
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                MENGIRIM...
              </>
            ) : (
              <>
                KIRIM KONFIRMASI <CheckCircle size={14} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
