"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, MapPin, Video, X, FileText, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RSVPFormProps {
  token: string;
  existingRsvp: {
    kehadiran_ortu: string | null;
    kehadiran_anak: string | null;
    jumlah_ortu: number | null;
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
  background: active ? "var(--color-primary)" : "var(--color-glass-bg)",
  backdropFilter: "blur(10px)" as const,
  color: active ? "var(--color-on-primary)" : "var(--color-text)",
  border: active ? "1px solid var(--color-primary)" : "1px solid rgba(255,255,255,0.6)",
  borderRadius: 14,
  cursor: "pointer" as const,
  display: "flex" as const,
  flexDirection: "column" as const,
  alignItems: "center" as const,
  gap: 6,
  boxShadow: active ? "0 6px 16px rgba(var(--color-primary-rgb), 0.3)" : "0 2px 6px rgba(58,36,20,0.05)",
  transition: "all 0.15s ease",
});

export default function RSVPForm({ token, existingRsvp, legacyRsvp }: RSVPFormProps) {
  const [kehadiranOrtu, setKehadiranOrtu] = useState<"Offline" | "Online" | "Tidak Hadir" | "">(
    (existingRsvp?.kehadiran_ortu as "Offline" | "Online" | "Tidak Hadir" | null) || ""
  );
  const [kehadiranAnak, setKehadiranAnak] = useState<"Hadir" | "Tidak Hadir" | "">(
    (existingRsvp?.kehadiran_anak as "Hadir" | "Tidak Hadir" | null) || ""
  );
  const [pesan, setPesan] = useState(existingRsvp?.pesan || "");
  const [jumlahOrtu, setJumlahOrtu] = useState(existingRsvp?.jumlah_ortu || 1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showNewForm, setShowNewForm] = useState(!legacyRsvp);

  const isOrtuHadir = kehadiranOrtu === "Offline" || kehadiranOrtu === "Online";
  const totalHadir = (isOrtuHadir ? jumlahOrtu : 0) + (kehadiranAnak === "Hadir" ? 1 : 0);

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
          jumlah_ortu: isOrtuHadir ? jumlahOrtu : undefined,
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
          <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: "var(--color-success)" }} />
          <h3 className="font-serif-display text-[24px] italic font-medium mb-2" style={{ color: "var(--color-text)" }}>
            Jazakumullah khair
          </h3>
          <p className="text-[14px] leading-[1.6]" style={{ color: "var(--color-text-muted)" }}>
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
            <FileText className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-gold)" }} />
            <div className="flex-1">
              <h4 className="font-semibold text-[14px]" style={{ color: "var(--color-secondary)" }}>
                Data Konfirmasi Lama
              </h4>
              <p className="text-[13px] leading-relaxed mt-1" style={{ color: "var(--color-text-muted)" }}>
                Status: <span className="font-semibold" style={{ color: "var(--color-text)" }}>{legacyRsvp.kehadiran}</span>
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
                style={{ color: "var(--color-primary)" }}
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
        <p className="font-serif-display text-[22px] italic" style={{ color: "var(--color-text)" }}>
          Konfirmasi Kehadiran
        </p>
        <p className="font-mono-label text-[9px] tracking-[0.22em] mb-4" style={{ color: "var(--color-secondary)" }}>
          MOHON ISI SEBELUM HARI H
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="font-mono-label text-[9px] tracking-[0.22em] mb-2" style={{ color: "var(--color-secondary)" }}>
              ORANG TUA / PENDAMPING
            </p>
            <div className="flex gap-2">
              {(["Offline", "Online", "Tidak Hadir"] as const).map((opt) => (
                <button key={opt} type="button" onClick={() => { setKehadiranOrtu(opt); if (opt === "Tidak Hadir") setJumlahOrtu(1); }} style={pillStyle(kehadiranOrtu === opt)}>
                  {opt === "Offline" && <MapPin size={16} style={{ color: kehadiranOrtu === opt ? "var(--color-on-primary)" : "var(--color-primary)" }} />}
                  {opt === "Online" && <Video size={16} style={{ color: kehadiranOrtu === opt ? "var(--color-on-primary)" : "var(--color-primary)" }} />}
                  {opt === "Tidak Hadir" && <X size={16} style={{ color: kehadiranOrtu === opt ? "var(--color-on-primary)" : "var(--color-text-muted)" }} />}
                  <span className="font-mono-label text-[9px] tracking-[0.16em] font-semibold">{opt.toUpperCase()}</span>
                </button>
              ))}
            </div>
            {isOrtuHadir && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setJumlahOrtu(Math.max(1, jumlahOrtu - 1))}
                  disabled={jumlahOrtu <= 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: "rgba(122,102,85,0.12)",
                    color: "var(--color-text)",
                    border: "1px solid rgba(122,102,85,0.18)",
                  }}
                >−</button>
                <span className="font-serif-display text-[26px] italic font-medium min-w-[40px] text-center" style={{ color: "var(--color-text)" }}>
                  {jumlahOrtu}
                </span>
                <button
                  type="button"
                  onClick={() => setJumlahOrtu(Math.min(2, jumlahOrtu + 1))}
                  disabled={jumlahOrtu >= 2}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] font-bold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: "rgba(122,102,85,0.12)",
                    color: "var(--color-text)",
                    border: "1px solid rgba(122,102,85,0.18)",
                  }}
                >+</button>
                <span className="font-mono-label text-[9px] tracking-[0.18em] ml-2" style={{ color: "var(--color-text-muted)" }}>
                  ORANG
                </span>
              </div>
            )}
            <p className="font-mono-label text-[8px] tracking-[0.18em] mt-2 text-center" style={{ color: "var(--color-text-muted)" }}>
              <Users size={10} className="inline mr-1" />Maksimal 2 orang
            </p>
          </div>

          <div>
            <p className="font-mono-label text-[9px] tracking-[0.22em] mb-2" style={{ color: "var(--color-secondary)" }}>
              ANAK
            </p>
            <div className="flex gap-2">
              {(["Hadir", "Tidak Hadir"] as const).map((opt) => (
                <button key={opt} type="button" onClick={() => setKehadiranAnak(opt)} style={pillStyle(kehadiranAnak === opt)}>
                  {opt === "Hadir" && <CheckCircle size={16} style={{ color: kehadiranAnak === opt ? "var(--color-on-primary)" : "var(--color-primary)" }} />}
                  {opt === "Tidak Hadir" && <X size={16} style={{ color: kehadiranAnak === opt ? "var(--color-on-primary)" : "var(--color-text-muted)" }} />}
                  <span className="font-mono-label text-[9px] tracking-[0.16em] font-semibold">{opt.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-chip p-3 text-center" style={{ background: "rgba(var(--color-primary-rgb), 0.12)" }}>
            <p className="font-mono-label text-[10px] tracking-[0.2em] font-semibold" style={{ color: "var(--color-primary)" }}>
              TOTAL HADIR: {totalHadir} ORANG
            </p>
          </div>

          <div>
            <p className="font-mono-label text-[9px] tracking-[0.22em] mb-2" style={{ color: "var(--color-secondary)" }}>
              UCAPAN &amp; DOA
            </p>
            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="glass-input w-full px-4 py-3 resize-none outline-none text-[13px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--color-text)" }}
              rows={3}
              placeholder="Tulis doa atau ucapan untuk siswa…"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono-label text-[9px] tracking-[0.18em]" style={{ color: "var(--color-text-muted)" }}>
                {pesan.length}/200
              </span>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="p-3 text-[13px] rounded-[12px]"
                style={{ background: "rgba(181,64,59,0.12)", color: "var(--color-danger)" }}
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
            className="glass-button w-full py-[14px] text-[var(--color-on-primary)] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[10px]"
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
