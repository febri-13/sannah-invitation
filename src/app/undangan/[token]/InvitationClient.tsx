'use client';

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  Navigation,
} from "lucide-react";
import RSVPForm from "./RSVPForm";
import type { Tables } from "@/lib/database.types";

interface AgendaItem {
  waktu: string;
  icon: string;
  judul: string;
}

interface TamuRsvp {
  id: string;
  kehadiran: string;
  jumlah: number;
  kehadiran_ortu: string | null;
  kehadiran_anak: string | null;
  pesan: string | null;
  created_at: string | null;
}

interface TamuCheckin {
  id: string;
  waktu: string | null;
}

interface Tamu {
  id: string;
  nama_ayah: string | null;
  nama_ibu: string | null;
  nama_siswa: string;
  jenis_kelamin: string | null;
  token: string;
  sekolah_id: string | null;
  rsvp: TamuRsvp[];
  checkin: TamuCheckin[];
}

interface InvitationClientProps {
  tamu: Tamu;
  token: string;
  konten: Tables<"konten_undangan">;
  sekolahNama?: string;
}

function useCountdown(targetISO: string) {
  const calc = useCallback(() => {
    const diff = new Date(targetISO).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  }, [targetISO]);
  const [c, setC] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setC(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return c;
}

function parseDateToISO(dateStr: string): string {
  const months: Record<string, string> = {
    januari:"01",februari:"02",maret:"03",april:"04",mei:"05",juni:"06",
    juli:"07",agustus:"08",september:"09",oktober:"10",november:"11",desember:"12",
  };
  const parts = dateStr.toLowerCase().split(" ");
  const day = parts.find(p => /^\d+$/.test(p));
  const month = parts.find(p => months[p]);
  if (day && month) {
    const y = parts.find(p => /^\d{4}$/.test(p)) || "2025";
    return `${y}-${months[month]!}-${day!.padStart(2,"0")}T08:00:00`;
  }
  return "";
}

function BgOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[360px] h-[360px] -left-[100px] -top-[120px] rounded-full"
        style={{ background: "var(--orb-1)" }} />
      <div className="absolute w-[320px] h-[320px] -right-[90px] top-[400px] rounded-full"
        style={{ background: "var(--orb-2)" }} />
      <div className="absolute w-[380px] h-[380px] -left-[60px] top-[900px] rounded-full"
        style={{ background: "var(--orb-3)" }} />
      <div className="absolute w-[340px] h-[340px] -right-[120px] top-[1500px] rounded-full"
        style={{ background: "var(--orb-4)" }} />
      <div className="absolute w-[360px] h-[360px] -left-[80px] top-[2200px] rounded-full"
        style={{ background: "var(--orb-5)" }} />
      <div className="absolute w-[360px] h-[360px] -right-[100px] -bottom-[120px] rounded-full"
        style={{ background: "var(--orb-6)" }} />
    </div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
} as const;

const qrVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
} as const;

export default function InvitationClient({ tamu, token, konten, sekolahNama = "SDIT Al-Hikmah" }: InvitationClientProps) {
  const hasRsvp = tamu.rsvp && tamu.rsvp.length > 0;
  const hasCheckin = tamu.checkin && tamu.checkin.length > 0;
  const latestRsvp = hasRsvp ? tamu.rsvp[0]! : null;
  const isLegacyRsvp = latestRsvp ? !latestRsvp.kehadiran_ortu : false;

  const agenda = (konten.agenda as unknown as AgendaItem[]) || [];

  const targetISO = parseDateToISO(konten.tanggal);
  const c = useCountdown(targetISO);
  const countdownParts = [
    { v: c.d, l: "HARI" }, { v: c.h, l: "JAM" }, { v: c.m, l: "MENIT" }, { v: c.s, l: "DETIK" },
  ];

  const themeClass = konten.template_slug ? `theme-${konten.template_slug}` : "";

  return (
    <div className={`min-h-screen relative ${themeClass}`} style={{ background: "var(--color-bg-gradient)" }}>
      <div className="max-w-[390px] mx-auto relative overflow-hidden">
        <BgOrbs />

        <div className="relative">
          {/* Hero */}
          <motion.div
            className="px-[22px] pt-[30px] pb-[10px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="glass-card p-[30px_22px_28px] text-center relative overflow-hidden">
              <div className="absolute inset-[-20px] pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,210,180,0.5), transparent 60%)" }} />
              <div className="relative">
                <p className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "var(--color-secondary)", marginBottom: 14, opacity: 0.85 }}>
                  {sekolahNama.toUpperCase()} · INVITATION
                </p>
                <p className="font-arabic text-[26px] leading-[1.5]" style={{ color: "var(--color-secondary)", marginBottom: 18 }}>
                  {konten.bismillah}
                </p>
                <h1 className="font-serif-display text-[42px] leading-[0.95] font-medium italic" style={{ color: "var(--color-text)" }}>
                  {konten.judul}
                </h1>
                {konten.subtitle && (
                  <p className="font-serif-display text-[42px] leading-[0.95] font-medium italic" style={{ color: "var(--color-primary)", marginBottom: 6 }}>
                    {konten.subtitle}
                  </p>
                )}
                {konten.hero_desc && (
                  <p className="text-[13px] leading-[1.6]" style={{ color: "var(--color-text-muted)", marginTop: 8 }}>
                    {konten.hero_desc}
                  </p>
                )}

                <div className="glass-chip inline-flex items-center gap-4 mt-[22px] p-[14px_18px]">
                  <div className="text-center">
                    <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)" }}>
                      {(() => {
                        const d = new Date(konten.tanggal);
                        const days = ["MINGGU","SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];
                        return isNaN(d.getTime()) ? "" : days[d.getDay()] || "";
                      })()}
                    </p>
                    <p className="font-serif-display text-[36px] leading-[1] font-medium" style={{ color: "var(--color-text)" }}>
                      {(() => { const d = new Date(konten.tanggal); return isNaN(d.getTime()) ? "" : d.getDate(); })()}
                    </p>
                    <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)" }}>
                      {(() => {
                        const d = new Date(konten.tanggal);
                        const months = ["JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI","JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER"];
                        return isNaN(d.getTime()) ? "" : months[d.getMonth()] || "";
                      })()} {(() => { const d = new Date(konten.tanggal); return isNaN(d.getTime()) ? "" : d.getFullYear(); })()}
                    </p>
                  </div>
                  <div className="w-px h-[50px]" style={{ background: "rgba(var(--color-secondary-rgb), 0.25)" }} />
                  <div className="text-left">
                    <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)" }}>WAKTU</p>
                    <p className="font-serif-display text-[22px] leading-[1.1] font-medium italic" style={{ color: "var(--color-text)" }}>
                      {konten.waktu.split(" ")[1] || konten.waktu.split(" ")[0] || "08.00"}
                    </p>
                    <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)" }}>
                      {konten.waktu.includes("WIB") ? "WIB — SELESAI" : konten.waktu}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.div className="px-[22px] py-[10px]" variants={itemVariants}>
            <div className="glass-card p-[26px_24px] text-center">
              <p className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "var(--color-secondary)", marginBottom: 14 }}>
                KEPADA YANG TERHORMAT
              </p>
              <p className="font-serif-display text-[22px] leading-[1.3] italic" style={{ color: "var(--color-text)" }}>
                {tamu.nama_ayah ? `Bapak ${tamu.nama_ayah}` : ""}
              </p>
              {tamu.nama_ayah && tamu.nama_ibu && (
                <p className="font-serif-display text-[14px] leading-[1]" style={{ color: "var(--color-primary)", margin: "2px 0" }}>&amp;</p>
              )}
              <p className="font-serif-display text-[22px] leading-[1.3] italic" style={{ color: "var(--color-text)", marginBottom: 14 }}>
                {tamu.nama_ibu ? `Ibu ${tamu.nama_ibu}` : (tamu.nama_ayah ? "dan Ibu" : "")}
              </p>
              <div className="w-8 h-px mx-auto mb-[14px]" style={{ background: "var(--color-primary)" }} />
              <p className="text-[12px] leading-[1.6]" style={{ color: "var(--color-text-muted)" }}>
                bersama putra/putri tercinta
              </p>
              <p className="font-serif-display text-[20px] font-semibold" style={{ color: "var(--color-primary)", marginTop: 4 }}>
                {tamu.nama_siswa}
              </p>
              {tamu.jenis_kelamin && (
                <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-text-muted)", marginTop: 6 }}>
                  {tamu.jenis_kelamin.toUpperCase()}
                </p>
              )}
            </div>
          </motion.div>

          {/* Countdown */}
          {targetISO && (
            <motion.div className="px-[22px] py-[10px]" variants={itemVariants}>
              <div className="glass-card p-[24px_18px]">
                <p className="font-mono-label text-[9px] tracking-[0.3em] text-center" style={{ color: "var(--color-secondary)", marginBottom: 4 }}>
                  MENUJU HARI BAHAGIA
                </p>
                <p className="font-serif-display text-[18px] italic text-center" style={{ color: "var(--color-text)", marginBottom: 16 }}>
                  Hitung mundur
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {countdownParts.map((p, i) => (
                    <div key={i} className="glass-chip text-center p-[12px_4px_10px]" style={{ background: "var(--color-glass-chip-bg)" }}>
                      <p className="font-serif-display text-[28px] leading-[1] font-medium" style={{ color: "var(--color-primary)" }}>
                        {String(p.v).padStart(2, "0")}
                      </p>
                      <p className="font-mono-label text-[8px] tracking-[0.2em]" style={{ color: "var(--color-secondary)", marginTop: 6 }}>
                        {p.l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Event Details */}
          <motion.div className="px-[22px] py-[10px]" variants={itemVariants}>
            <div className="glass-card p-[24px]">
              <p className="font-serif-display text-[22px] italic" style={{ color: "var(--color-text)", marginBottom: 2 }}>
                Detail Acara
              </p>
              <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)", marginBottom: 16 }}>
                WAKTU &amp; TEMPAT
              </p>
              <div className="space-y-0">
                {[
                  { icon: <Calendar size={18} />, label: "TANGGAL", value: konten.tanggal },
                  { icon: <Clock size={18} />, label: "WAKTU", value: konten.waktu },
                  { icon: <MapPin size={18} />, label: "LOKASI", value: konten.lokasi_nama, sub: konten.lokasi_alamat },
                  ...(konten.link_youtube ? [{ icon: <Video size={18} />, label: "LIVE", value: "Streaming YouTube", link: konten.link_youtube }] : []),
                ].map((row, i, arr) => (
                  <div key={i}
                    className="flex gap-[14px] py-[14px]"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(var(--color-secondary-rgb), 0.15)" : "none" }}
                  >
                    <div className="w-10 h-10 rounded-[12px] shrink-0 flex items-center justify-center"
                      style={{ background: "rgba(var(--color-primary-rgb), 0.15)", color: "var(--color-primary)" }}>
                      {row.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)", marginBottom: 2 }}>
                        {row.label}
                      </p>
                      {"link" in row && row.link ? (
                        <a href={row.link} target="_blank" rel="noopener noreferrer"
                          className="text-[14px] font-semibold leading-[1.3] hover:underline"
                          style={{ color: "var(--color-primary)" }}>
                          {row.value}
                        </a>
                      ) : (
                        <p className="text-[14px] font-semibold leading-[1.3]" style={{ color: "var(--color-text)" }}>
                          {row.value}
                        </p>
                      )}
                      {"sub" in row && row.sub && (
                        <p className="text-[11px] leading-[1.5] mt-[2px]" style={{ color: "var(--color-text-muted)" }}>
                          {row.sub}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {konten.lokasi_maps && (
                <a href={konten.lokasi_maps} target="_blank" rel="noopener noreferrer"
                  className="w-full mt-4 p-[14px] rounded-[14px] inline-flex items-center justify-center gap-[10px] cursor-pointer"
                  style={{
                    background: "var(--color-primary)", color: "var(--color-on-primary)",
                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.22em", fontSize: 11,
                    boxShadow: "0 6px 18px rgba(var(--color-primary-rgb), 0.35)",
                  }}>
                  BUKA GOOGLE MAPS <Navigation size={14} />
                </a>
              )}
            </div>
          </motion.div>

          {/* Agenda */}
          {agenda.length > 0 && (
            <motion.div className="px-[22px] py-[10px]" variants={itemVariants}>
              <div className="glass-card p-[24px_22px]">
                <p className="font-serif-display text-[22px] italic" style={{ color: "var(--color-text)", marginBottom: 2 }}>
                  Susunan Acara
                </p>
                <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)", marginBottom: 18 }}>
                  RANGKAIAN ACARA
                </p>
                <div className="relative pl-[18px]">
                  <div className="absolute left-[5px] top-[6px] bottom-[6px] w-px"
                    style={{ background: "linear-gradient(180deg, var(--color-primary), rgba(194,106,74,0.1))" }} />
                  {agenda.map((a, i) => (
                    <div key={i} className="relative pb-4">
                      <span className="absolute -left-[18px] top-[6px] w-[11px] h-[11px] rounded-full border-2"
                        style={{
                          background: "var(--color-primary)",
                          borderColor: "var(--color-bg-start)",
                          boxShadow: "0 0 0 1px var(--color-primary)",
                        }} />
                      <p className="font-mono-label text-[10px] tracking-[0.22em] font-semibold" style={{ color: "var(--color-primary)" }}>
                        {a.waktu}
                      </p>
                      <p className="text-[14px] font-semibold mt-[2px]" style={{ color: "var(--color-text)" }}>
                        {a.judul}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* QR Check-in */}
          <motion.div className="px-[22px] py-[10px]" variants={qrVariants}>
            <div className="glass-card p-[26px_22px] text-center">
              <p className="font-serif-display text-[22px] italic" style={{ color: "var(--color-text)" }}>
                QR Check-in
              </p>
              <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)", marginBottom: 18 }}>
                PRESENSI DIGITAL
              </p>
              <div className="inline-block p-[14px] glass-chip rounded-[14px]" style={{ background: "rgba(255,255,255,0.85)" }}>
                <QRCode value={token} size={160} fgColor="var(--color-text)" bgColor="#FFFFFF" />
              </div>
              <div className="flex justify-center gap-[10px] mt-[14px]">
                <span className="font-mono-label text-[9px] tracking-[0.22em] px-[10px] py-[4px] rounded-full inline-flex items-center gap-[6px]"
                  style={{
                    color: "var(--color-success)",
                    background: "var(--color-success-bg)",
                  }}>
                  <CheckCircle size={12} /> AKTIF
                </span>
              </div>
              <p className="text-[11px] leading-[1.6] mt-[12px]" style={{ color: "var(--color-text-muted)", maxWidth: 280, margin: "12px auto 0" }}>
                Tunjukkan kode ini kepada panitia saat hadir di lokasi acara.
              </p>
              {hasCheckin && (
                <div className="mt-4 glass-chip p-[12px] flex items-center justify-center gap-2"
                  style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
                  <CheckCircle size={16} />
                  <span className="font-mono-label text-[10px] tracking-[0.2em]">SUDAH CHECK-IN</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* RSVP Form */}
          <motion.div variants={itemVariants}>
            <RSVPForm
              token={token}
              existingRsvp={isLegacyRsvp ? null : latestRsvp}
              legacyRsvp={isLegacyRsvp ? latestRsvp : null}
            />
          </motion.div>

          {/* Footer */}
          <motion.div className="px-[22px] py-[10px_22px_30px]" variants={itemVariants}>
            <div className="glass-card p-[26px_22px] text-center">
              <p className="font-arabic text-[22px]" style={{ color: "var(--color-primary)", marginBottom: 6 }}>
                {konten.header_arabic}
              </p>
              <p className="font-serif-display text-[14px] italic" style={{ color: "var(--color-text)", marginBottom: 18 }}>
                {konten.footer}
              </p>
              <p className="font-mono-label text-[9px] tracking-[0.28em]" style={{ color: "var(--color-secondary)", marginBottom: 4 }}>
                HORMAT KAMI,
              </p>
              <p className="font-serif-display text-[18px] italic" style={{ color: "var(--color-text)" }}>
                Keluarga Besar
              </p>
              <p className="font-serif-display text-[22px] font-semibold" style={{ color: "var(--color-primary)" }}>
                {sekolahNama}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
