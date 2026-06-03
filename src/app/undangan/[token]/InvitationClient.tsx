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
import MusicPlayer from "./MusicPlayer";
import type { Tables, LayoutConfig, FooterConfig } from "@/lib/database.types";

interface AgendaItem {
  waktu: string;
  icon: string;
  judul: string;
}

interface TamuRsvp {
  id: string;
  kehadiran: string;
  jumlah: number;
  jumlah_ortu: number;
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
  sekolahLogo?: string;
  musicUrl?: string;
  musicAutoPlay?: boolean;
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
  const [c, setC] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    setC(calc());
    const id = setInterval(() => setC(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return c;
}

/** Parse date + time string into ISO datetime. Returns empty string if unparseable. */
function parseDateTimeToISO(dateStr: string, waktuStr: string): string {
  const months: Record<string, string> = {
    januari:"01",februari:"02",maret:"03",april:"04",mei:"05",juni:"06",
    juli:"07",agustus:"08",september:"09",oktober:"10",november:"11",desember:"12",
  };

  // Try ISO / yyyy-mm-dd first
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let y: string, m: string, d: string;
  if (isoMatch) {
    [, y, m, d] = isoMatch;
  } else {
    // Indonesian: "Ahad, 21 Juni 2026" or "21 Juni 2026"
    const parts = dateStr.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const dayPart = parts.find(p => /^\d{1,2}$/.test(p));
    const monthPart = parts.find(p => months[p]);
    if (!dayPart || !monthPart) return "";
    d = dayPart.padStart(2, "0");
    m = months[monthPart]!;
    y = parts.find(p => /^\d{4}$/.test(p)) || String(new Date().getFullYear());
  }

  // Parse start time from waktu: "Pukul 07.00 - 11.30 WIB" → 07:00
  let hh = "08", mm = "00";
  const timeMatch = waktuStr.match(/Pukul\s+(\d{1,2})[.:](\d{2})/i) || waktuStr.match(/(\d{1,2})[.:](\d{2})/);
  if (timeMatch) {
    hh = timeMatch[1]!.padStart(2, "0");
    mm = timeMatch[2]!;
  }

  return `${y}-${m}-${d}T${hh}:${mm}:00`;
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

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  items: {
    header_arabic: { visible: true, order: 1 },
    footer_text:   { visible: true, order: 2 },
    hormat_label:  { visible: true, order: 3 },
    keluarga_label:{ visible: true, order: 4 },
    sekolah_nama:  { visible: true, order: 5 },
  },
};

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  sections: {
    hero:     { visible: true, order: 1, label: "" },
    greeting: { visible: true, order: 2, label: "KEPADA YANG TERHORMAT" },
    countdown:{ visible: true, order: 3, label: "MENUJU HARI BAHAGIA" },
    details:  { visible: true, order: 4, label: "DETAIL ACARA" },
    agenda:   { visible: true, order: 5, label: "SUSUNAN ACARA" },
    qr:       { visible: true, order: 6, label: "QR CHECK-IN" },
    rsvp:     { visible: true, order: 7, label: "KONFIRMASI KEHADIRAN" },
    footer:   { visible: true, order: 8, label: "" },
  },
  custom_css: {
    primary_color: "",
    secondary_color: "",
  },
  rsvp_config: {
    max_jumlah_ortu: 2,
    show_offline: true,
    show_online: true,
    show_tidak_hadir: true,
  },
};

function parseLayoutConfig(json: unknown): LayoutConfig {
  if (!json || typeof json !== "object") return DEFAULT_LAYOUT_CONFIG;
  const cfg = json as Record<string, unknown>;
  const sections = cfg.sections as Record<string, unknown> | undefined;
  const merged: LayoutConfig = JSON.parse(JSON.stringify(DEFAULT_LAYOUT_CONFIG));
  if (sections && typeof sections === "object") {
    for (const key of Object.keys(merged.sections) as (keyof typeof merged.sections)[]) {
      const s = sections[key] as Record<string, unknown> | undefined;
      if (s && typeof s === "object") {
        if (typeof s.visible === "boolean") merged.sections[key].visible = s.visible;
        if (typeof s.order === "number") merged.sections[key].order = s.order;
        if (typeof s.label === "string") merged.sections[key].label = s.label;
      }
    }
  }
  const css = cfg.custom_css as Record<string, unknown> | undefined;
  if (css && typeof css === "object") {
    if (typeof css.primary_color === "string") merged.custom_css.primary_color = css.primary_color;
    if (typeof css.secondary_color === "string") merged.custom_css.secondary_color = css.secondary_color;
  }
  const rsvpCfg = cfg.rsvp_config as Record<string, unknown> | undefined;
  if (rsvpCfg && typeof rsvpCfg === "object" && merged.rsvp_config) {
    if (typeof rsvpCfg.max_jumlah_ortu === "number") merged.rsvp_config.max_jumlah_ortu = rsvpCfg.max_jumlah_ortu;
    if (typeof rsvpCfg.show_offline === "boolean") merged.rsvp_config.show_offline = rsvpCfg.show_offline;
    if (typeof rsvpCfg.show_online === "boolean") merged.rsvp_config.show_online = rsvpCfg.show_online;
    if (typeof rsvpCfg.show_tidak_hadir === "boolean") merged.rsvp_config.show_tidak_hadir = rsvpCfg.show_tidak_hadir;
  }
  return merged;
}

function parseFooterConfig(json: unknown): FooterConfig {
  if (!json || typeof json !== "object") return DEFAULT_FOOTER_CONFIG;
  const cfg = json as Record<string, unknown>;
  const items = cfg.items as Record<string, unknown> | undefined;
  if (!items || typeof items !== "object") return DEFAULT_FOOTER_CONFIG;
  const merged: FooterConfig = JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONFIG));
  for (const key of Object.keys(merged.items) as (keyof typeof merged.items)[]) {
    const item = items[key] as Record<string, unknown> | undefined;
    if (item && typeof item === "object") {
      if (typeof item.visible === "boolean") merged.items[key].visible = item.visible;
      if (typeof item.order === "number") merged.items[key].order = item.order;
    }
  }
  return merged;
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

export default function InvitationClient({ tamu, token, konten, sekolahNama = "SDIT Al-Hikmah", sekolahLogo = "", musicUrl = "", musicAutoPlay = false }: InvitationClientProps) {
  const hasRsvp = tamu.rsvp && tamu.rsvp.length > 0;
  const hasCheckin = tamu.checkin && tamu.checkin.length > 0;
  const latestRsvp = hasRsvp ? tamu.rsvp[0]! : null;
  const isLegacyRsvp = latestRsvp ? !latestRsvp.kehadiran_ortu : false;

  const agenda = (konten.agenda as unknown as AgendaItem[]) || [];

  const layoutConfig = parseLayoutConfig(konten.layout_config);
  const footerConfig = parseFooterConfig(layoutConfig.footer_config ?? null);
  const sortedSectionKeys = (Object.keys(layoutConfig.sections) as (keyof typeof layoutConfig.sections)[])
    .sort((a, b) => layoutConfig.sections[a].order - layoutConfig.sections[b].order)
    .filter((k) => layoutConfig.sections[k].visible);

  const targetISO = parseDateTimeToISO(konten.tanggal, konten.waktu || "");
  const hasPassed = targetISO ? new Date(targetISO).getTime() <= Date.now() : false;
  const c = useCountdown(targetISO);
  const countdownParts = [
    { v: c.d, l: "HARI" }, { v: c.h, l: "JAM" }, { v: c.m, l: "MENIT" }, { v: c.s, l: "DETIK" },
  ];

  const themeClass = konten.template_slug ? `theme-${konten.template_slug}` : "";

  const sectionLabel = (key: keyof typeof layoutConfig.sections) =>
    layoutConfig.sections[key].label || "";

  const customCssVars: Record<string, string> = {};
  if (layoutConfig.custom_css.primary_color) {
    customCssVars["--color-primary"] = layoutConfig.custom_css.primary_color;
  }
  if (layoutConfig.custom_css.secondary_color) {
    customCssVars["--color-secondary"] = layoutConfig.custom_css.secondary_color;
  }

  useEffect(() => {
    fetch("/api/activity/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, activity_type: "invitation_viewed" }),
    }).catch(() => {});
  }, [token]);

  const renderSection = (key: keyof typeof layoutConfig.sections) => {
    switch (key) {
      case "hero":
        return (
          <motion.div
            key={key}
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
                {sekolahLogo && (
                  <div className="flex justify-center mt-5">
                    <img
                      src={sekolahLogo}
                      alt="Logo Sekolah"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
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
                      {konten.waktu?.split(" ")[1] || konten.waktu?.split(" ")[0] || "08.00"}
                    </p>
                    <p className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "var(--color-secondary)" }}>
                      {konten.waktu?.includes("WIB") ? "WIB — SELESAI" : konten.waktu}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "greeting":
        return (
          <motion.div key={key} className="px-[22px] py-[10px]" variants={itemVariants}>
            <div className="glass-card p-[26px_24px] text-center">
              <p className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "var(--color-secondary)", marginBottom: 14 }}>
                {sectionLabel("greeting") || "KEPADA YANG TERHORMAT"}
              </p>
              <p className="text-[12px] leading-[1.6]" style={{ color: "var(--color-text-muted)" }}>
                Ayah/Bunda dari ananda
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
        );

      case "countdown":
        if (!targetISO) return null;
        return (
          <motion.div key={key} className="px-[22px] py-[10px]" variants={itemVariants}>
            <div className="glass-card p-[24px_18px] text-center">
              <p className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "var(--color-secondary)", marginBottom: 4 }}>
                {sectionLabel("countdown") || "MENUJU HARI BAHAGIA"}
              </p>
              {hasPassed ? (
                <>
                  <p className="font-serif-display text-[20px] italic" style={{ color: "var(--color-text)", marginBottom: 8 }}>
                    Alhamdulillah
                  </p>
                  <p className="font-mono-label text-[10px] tracking-[0.18em]" style={{ color: "var(--color-text-muted)" }}>
                    Acara telah dimulai ✦
                  </p>
                </>
              ) : (
                <>
                  <p className="font-serif-display text-[18px] italic" style={{ color: "var(--color-text)", marginBottom: 16 }}>
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
                </>
              )}
            </div>
          </motion.div>
        );

      case "details":
        return (
          <motion.div key={key} className="px-[22px] py-[10px]" variants={itemVariants}>
            <div className="glass-card p-[24px]">
              <p className="font-serif-display text-[22px] italic" style={{ color: "var(--color-text)", marginBottom: 2 }}>
                {sectionLabel("details") || "Detail Acara"}
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
        );

      case "agenda":
        if (agenda.length === 0) return null;
        return (
          <motion.div key={key} className="px-[22px] py-[10px]" variants={itemVariants}>
            <div className="glass-card p-[24px_22px]">
              <p className="font-serif-display text-[22px] italic" style={{ color: "var(--color-text)", marginBottom: 2 }}>
                {sectionLabel("agenda") || "Susunan Acara"}
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
        );

      case "qr":
        return (
          <motion.div key={key} className="px-[22px] py-[10px]" variants={qrVariants}>
            <div className="glass-card p-[26px_22px] text-center">
              <p className="font-serif-display text-[22px] italic" style={{ color: "var(--color-text)" }}>
                {sectionLabel("qr") || "QR Check-in"}
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
              <p className="text-[14px] font-semibold leading-[1.6] mt-[12px]" style={{ color: "var(--color-text-muted)", maxWidth: 280, margin: "12px auto 0" }}>
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
        );

      case "rsvp":
        return (
          <motion.div key={key} variants={itemVariants}>
      <RSVPForm
        token={token}
        existingRsvp={isLegacyRsvp ? null : latestRsvp}
        legacyRsvp={isLegacyRsvp ? latestRsvp : null}
        rsvpConfig={layoutConfig.rsvp_config}
      />
          </motion.div>
        );

      case "footer":
        const footerItemKeys = (Object.keys(footerConfig.items) as (keyof typeof footerConfig.items)[])
          .sort((a, b) => footerConfig.items[a].order - footerConfig.items[b].order)
          .filter((k) => footerConfig.items[k].visible);
        return (
          <motion.div key={key} className="px-[22px] py-[10px_22px_30px]" variants={itemVariants}>
            <div className="glass-card p-[26px_22px] text-center space-y-3">
              {footerItemKeys.map((fk) => {
                const content = (() => {
                  switch (fk) {
                    case "header_arabic": return konten.header_arabic;
                    case "footer_text": return konten.footer;
                    case "hormat_label": return konten.footer_hormat_label || "HORMAT KAMI,";
                    case "keluarga_label": return konten.footer_keluarga_label || "Keluarga Besar";
                    case "sekolah_nama": return sekolahNama;
                  }
                })();
                const classNames: Record<string, string> = {
                  header_arabic: "font-arabic text-[22px]",
                  footer_text: "font-serif-display text-[14px] italic",
                  hormat_label: "font-mono-label text-[9px] tracking-[0.28em]",
                  keluarga_label: "font-serif-display text-[18px] italic",
                  sekolah_nama: "font-serif-display text-[22px] font-semibold",
                };
                const colorStyles: Record<string, React.CSSProperties> = {
                  header_arabic: { color: "var(--color-primary)" },
                  footer_text: { color: "var(--color-text)" },
                  hormat_label: { color: "var(--color-secondary)" },
                  keluarga_label: { color: "var(--color-text)" },
                  sekolah_nama: { color: "var(--color-primary)" },
                };
                return (
                  <p key={fk} className={classNames[fk]} style={colorStyles[fk]}>
                    {content}
                  </p>
                );
              })}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen relative ${themeClass} pb-20`} style={{ background: "var(--color-bg-gradient)", ...customCssVars }}>
      <div className="max-w-[390px] mx-auto relative overflow-hidden">
        <BgOrbs />

        <div className="relative">
          {sortedSectionKeys.map(renderSection)}
        </div>
      </div>

      {musicUrl && <MusicPlayer src={musicUrl} autoPlay={musicAutoPlay} />}
    </div>
  );
}
