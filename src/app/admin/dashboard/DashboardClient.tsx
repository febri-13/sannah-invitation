"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DonutChart from "./DonutChart";
import TamuTable from "@/components/TamuTable";
import type { KontenUndangan } from "@/lib/database.types";
import { setActiveEvent } from "@/lib/event-cookie";

/* ─── Inline SVG icons ─── */
const icons = {
  dash: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/></svg>,
  users: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 20c0-2 2-3.5 4-3.5"/></svg>,
  scan: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M3 12h18" strokeDasharray="2 3"/></svg>,
  file: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v4h4M8 13h8M8 17h5"/></svg>,
  cog: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"/></svg>,
  out: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3"/><path d="M20 12h-9M17 9l3 3-3 3"/></svg>,
  add: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>,
  up: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3M12 4v12M7 9l5-5 5 5"/></svg>,
  search: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/></svg>,
  bell: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
  arrow: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  send: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>,
  cal: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  check: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>,
  x: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6l-12 12"/></svg>,
};

/* ─── Background orbs ─── */
function BgOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[520px] h-[520px] -left-[180px] -top-[160px] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #E89B6B 0%, rgba(0,0,0,0) 65%)" }} />
      <div className="absolute w-[460px] h-[460px] left-[620px] top-[180px] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #D9B281 0%, rgba(0,0,0,0) 65%)", opacity: 0.9 }} />
      <div className="absolute w-[420px] h-[420px] left-[1080px] -top-[80px] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #A9C0A2 0%, rgba(0,0,0,0) 65%)", opacity: 0.85 }} />
      <div className="absolute w-[460px] h-[460px] -left-[100px] top-[700px] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #C97A5D 0%, rgba(0,0,0,0) 65%)", opacity: 0.9 }} />
      <div className="absolute w-[540px] h-[540px] left-[800px] top-[880px] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #8FA68B 0%, rgba(0,0,0,0) 65%)", opacity: 0.7 }} />
      <div className="absolute w-[500px] h-[500px] left-[1200px] top-[1400px] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #E89B6B 0%, rgba(0,0,0,0) 65%)", opacity: 0.7 }} />
      <div className="absolute w-[460px] h-[460px] -left-[160px] top-[1500px] rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #D9B281 0%, rgba(0,0,0,0) 65%)", opacity: 0.8 }} />
    </div>
  );
}

/* ─── Tag chip ─── */
function Tag({ tone = "neutral", children }: { tone?: "sage" | "gold" | "danger" | "neutral" | "terra"; children: React.ReactNode }) {
  const map: Record<string, { bg: string; fg: string; bd: string }> = {
    sage: { bg: "rgba(92,112,88,0.18)", fg: "var(--sage-deep)", bd: "rgba(92,112,88,0.45)" },
    gold: { bg: "rgba(201,163,94,0.20)", fg: "var(--clay)", bd: "rgba(201,163,94,0.5)" },
    danger: { bg: "rgba(181,64,59,0.14)", fg: "var(--danger)", bd: "rgba(181,64,59,0.4)" },
    neutral: { bg: "rgba(255,248,235,0.6)", fg: "var(--ink-55)", bd: "rgba(122,102,85,0.3)" },
    terra: { bg: "rgba(194,106,74,0.18)", fg: "var(--terracotta)", bd: "rgba(194,106,74,0.4)" },
  };
  const c = map[tone] || map.neutral;
  return (
    <span className="font-mono-label inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[9px] tracking-[0.18em]"
      style={{ color: c.fg, background: c.bg, border: `1px solid ${c.bd}`, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
      {children}
    </span>
  );
}

/* ─── Sidebar ─── */
function EventSwitcher({ events, activeEventId, onCreate }: { events: { id: string; nama: string; slug: string }[]; activeEventId?: string; onCreate?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const active = events.find(e => e.id === activeEventId);

  const switchEvent = useCallback((eventId: string) => {
    setActiveEvent(eventId);
    setOpen(false);
    window.location.reload();
  }, []);

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-[14px] py-[10px] rounded-[12px] cursor-pointer text-left"
        style={{
          background: "rgba(245,238,224,0.1)",
          border: "1px solid rgba(245,238,224,0.15)",
          color: "#F5EEE0",
        }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v4M15 4v4"/>
        </svg>
        <div className="flex-1 min-w-0">
          <div className="font-mono-label text-[7px] tracking-[0.22em]" style={{ color: "rgba(245,238,224,0.5)" }}>EVENT AKTIF</div>
          <div className="font-medium text-[12px] truncate">{active?.nama || "Pilih event"}</div>
        </div>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden rounded-[12px]"
          style={{
            background: "rgba(58, 36, 20, 0.95)",
            backdropFilter: "blur(22px)",
            border: "1px solid rgba(245,238,224,0.15)",
            boxShadow: "0 10px 40px rgba(20,12,4,0.35)",
          }}>
          {events.map(e => (
            <button
              key={e.id}
              onClick={() => switchEvent(e.id)}
              className="w-full flex items-center gap-3 px-[14px] py-[10px] text-left cursor-pointer"
              style={{
                color: e.id === activeEventId ? "#C9A35E" : "rgba(245,238,224,0.7)",
                background: e.id === activeEventId ? "rgba(201,163,94,0.12)" : "transparent",
              }}>
              <span className="w-[6px] h-[6px] rounded-full shrink-0"
                style={{ background: e.id === activeEventId ? "#C9A35E" : "rgba(245,238,224,0.25)" }} />
              <div className="font-mono-label text-[10px] tracking-[0.16em]">{e.nama.toUpperCase()}</div>
              {e.id === activeEventId && <span className="ml-auto text-[8px] tracking-[0.2em]" style={{ color: "#C9A35E" }}>AKTIF</span>}
            </button>
          ))}
          <div style={{ borderTop: "1px solid rgba(245,238,224,0.1)", margin: "4px 8px" }} />
          <button
            onClick={() => { setOpen(false); onCreate?.(); }}
            className="w-full flex items-center gap-3 px-[14px] py-[10px] text-left cursor-pointer"
            style={{ color: "#C9A35E", background: "transparent" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <div className="font-mono-label text-[10px] tracking-[0.16em]">BUAT EVENT BARU</div>
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ activeKey = "dashboard", sekolahNama = "Sekolah", eventsList, activeEventId, onCreateEvent }: { activeKey?: string; sekolahNama?: string; eventsList?: { id: string; nama: string; slug: string }[]; activeEventId?: string; onCreateEvent?: () => void }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: icons.dash },
    { key: "tamu", label: "Daftar Tamu", icon: icons.users, href: "/admin/tamu/baru" },
    { key: "scan", label: "Scanner Check-in", icon: icons.scan, href: "/scan" },
    { key: "konten", label: "Konten Undangan", icon: icons.file, href: "/admin/konten-undangan" },
    { key: "pengaturan", label: "Pengaturan", icon: icons.cog, href: "/admin/pengaturan" },
  ];

  return (
    <aside className="w-[256px] shrink-0 m-5 mr-0 flex flex-col"
      style={{
        background: "rgba(58, 36, 20, 0.78)", backdropFilter: "blur(22px) saturate(1.2)",
        WebkitBackdropFilter: "blur(22px) saturate(1.2)",
        border: "1px solid rgba(255, 255, 255, 0.10)", borderRadius: 24,
        boxShadow: "0 10px 40px rgba(20, 12, 4, 0.25)", color: "#F5EEE0",
      }}>
      <div className="px-[22px] pb-6 pt-[26px]" style={{ borderBottom: "1px solid rgba(245,238,224,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C26A4A, #8B4A2F)", color: "#F5EEE0", boxShadow: "0 4px 14px rgba(194,106,74,0.45)" }}>
            <span className="font-serif-display text-[22px] italic leading-[1] font-semibold">A</span>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div className="font-serif-display text-[18px] italic font-medium" style={{ color: "#F5EEE0" }}>{sekolahNama}</div>
            <div className="font-mono-label text-[8px] tracking-[0.26em]" style={{ color: "rgba(245,238,224,0.55)" }}>ADMIN PANEL · v2.0</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <EventSwitcher events={eventsList || []} activeEventId={activeEventId} onCreate={onCreateEvent} />
        <div className="font-mono-label text-[8px] tracking-[0.28em] px-[10px] pb-[10px]" style={{ color: "rgba(245,238,224,0.45)" }}>
          — MENU UTAMA
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const active = it.key === activeKey;
            const btn = (
              <button style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                background: active ? "rgba(194,106,74,0.28)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
                borderRadius: 12, cursor: "pointer", textAlign: "left",
                fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? "#F5EEE0" : "rgba(245,238,224,0.7)",
                boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(194,106,74,0.2)" : "none",
                width: "100%",
              }}>
                <span style={{ color: active ? "#C9A35E" : "rgba(245,238,224,0.55)" }}>{it.icon}</span>
                <span style={{ flex: 1 }}>{it.label}</span>
              </button>
            );
            if (it.href) return <Link key={it.key} href={it.href}>{btn}</Link>;
            return <div key={it.key}>{btn}</div>;
          })}
        </nav>

        <div className="font-mono-label text-[8px] tracking-[0.28em] px-[10px] pb-[10px] pt-[26px]" style={{ color: "rgba(245,238,224,0.45)" }}>
          — QUICK ACTIONS
        </div>
        <nav className="flex flex-col gap-0.5">
          {[
            { label: "Tambah Tamu Manual", icon: icons.add, href: "/admin/tamu/baru" },
            { label: "Upload CSV", icon: icons.up, href: "/admin/tamu/upload" },
            { label: "Broadcast WhatsApp", icon: icons.send, href: "/admin/pengaturan" },
          ].map((a, i) => (
            <Link key={i} href={a.href} className="flex items-center gap-3 px-3 py-[10px] rounded-[12px]"
              style={{ color: "rgba(245,238,224,0.7)", fontSize: 12 }}>
              <span style={{ color: "rgba(245,238,224,0.5)" }}>{a.icon}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-[18px] pt-4 pb-[26px]" style={{ borderTop: "1px solid rgba(245,238,224,0.12)" }}>
        <form action="/admin/login" method="post">
          <button style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: 10, background: "rgba(245,238,224,0.06)", border: "1px solid rgba(245,238,224,0.18)",
            borderRadius: 12, color: "rgba(245,238,224,0.85)", cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em",
            backdropFilter: "blur(10px)",
          }}>
            {icons.out} LOG OUT
          </button>
        </form>
      </div>
    </aside>
  );
}

/* ─── Top bar ─── */
function TopBar({ totalTamu }: { totalTamu: number }) {
  return (
    <div className="mx-5 mt-5 px-6 py-4 flex items-center gap-[18px]"
      style={{
        background: "rgba(255, 248, 235, 0.55)", backdropFilter: "blur(22px) saturate(1.1)",
        WebkitBackdropFilter: "blur(22px) saturate(1.1)",
        border: "1px solid rgba(255, 255, 255, 0.55)", borderRadius: 24,
        boxShadow: "0 10px 40px rgba(58, 36, 20, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}>
      <div className="flex-1">
        <div className="font-mono-label text-[9px] tracking-[0.28em]" style={{ color: "#8B4A2F" }}>
          DASHBOARD / OVERVIEW
        </div>
        <div className="font-serif-display text-[26px] italic leading-[1.1] mt-[2px]" style={{ color: "#2A2520" }}>
          Selamat datang kembali, Admin.
        </div>
      </div>

      <div className="flex items-center gap-[10px] px-[14px] py-[9px] w-[320px]"
        style={{
          background: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: 12, color: "#7a6655",
        }}>
        {icons.search}
        <input placeholder="Cari nama siswa, token, orang tua…" className="flex-1 border-none outline-none bg-transparent text-[13px]"
          style={{ fontFamily: "inherit", color: "#2A2520" }} />
        <span className="font-mono-label text-[9px] px-[6px] py-[2px] rounded-[6px]" style={{ border: "1px solid rgba(122,102,85,0.3)", color: "#7a6655" }}>⌘K</span>
      </div>

      <div className="flex items-center gap-2 px-[14px] py-[9px] font-mono-label"
        style={{
          background: "rgba(255, 248, 235, 0.45)", backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255, 255, 255, 0.55)",
          borderRadius: 14,
        }}>
        <span style={{ color: "#C26A4A" }}>{icons.cal}</span>
        <span className="text-[10px] tracking-[0.22em]" style={{ color: "#5b4b3e" }}>
          {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}
        </span>
      </div>

      <button className="w-10 h-10 rounded-[12px] flex items-center justify-center relative cursor-pointer"
        style={{
          background: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.6)",
          color: "#2A2520",
        }}>
        {icons.bell}
        <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "#C26A4A", color: "#F5EEE0", boxShadow: "0 2px 6px rgba(194,106,74,0.5)" }}>
          3
        </span>
      </button>
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, delta, deltaDir = "up", caption, accent = "#C26A4A" }: {
  label: string; value: string; delta?: string; deltaDir?: "up" | "down"; caption?: string; accent?: string;
}) {
  return (
    <div className="relative flex flex-col gap-1 overflow-hidden min-h-[160px] p-[22px_22px_20px]"
      style={{
        background: "rgba(255, 248, 235, 0.55)", backdropFilter: "blur(22px) saturate(1.1)",
        WebkitBackdropFilter: "blur(22px) saturate(1.1)",
        border: "1px solid rgba(255, 255, 255, 0.55)", borderRadius: 24,
        boxShadow: "0 10px 40px rgba(58, 36, 20, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}>
      <div className="absolute -top-10 -right-10 w-[140px] h-[140px] rounded-full pointer-events-none opacity-[0.18]"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent} 0%, rgba(0,0,0,0) 70%)` }} />
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <div className="font-mono-label text-[9px] tracking-[0.26em]" style={{ color: "#7a6655" }}>{label}</div>
      </div>
      <div className="flex items-baseline gap-[10px] mt-[6px]">
        <div className="font-serif-display text-[56px] leading-[0.95] italic font-medium" style={{ color: "#2A2520" }}>
          {value}
        </div>
        {delta && (
          <span className="font-mono-label text-[10px] px-[9px] py-[4px] tracking-[0.14em] rounded-[14px]"
            style={{
              color: deltaDir === "up" ? "#5C7058" : "#B5403B",
              background: deltaDir === "up" ? "rgba(92,112,88,0.18)" : "rgba(181,64,59,0.12)",
              border: deltaDir === "up" ? "1px solid rgba(92,112,88,0.35)" : "1px solid rgba(181,64,59,0.3)",
              backdropFilter: "blur(14px)",
            }}>
            {deltaDir === "up" ? "\u25B2" : "\u25BC"} {delta}
          </span>
        )}
      </div>
      {caption && (
        <div className="text-[12px] leading-[1.5] mt-1" style={{ color: "#5b4b3e" }}>{caption}</div>
      )}
    </div>
  );
}

/* ─── Chart card with donut ─── */
function ChartCard({ eyebrow, title, segments, footnote }: {
  eyebrow: string; title: string; segments: { label: string; value: number; color: string }[]; footnote?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="flex flex-col flex-1 min-w-0 p-[26px_28px]"
      style={{
        background: "rgba(255, 248, 235, 0.55)", backdropFilter: "blur(22px) saturate(1.1)",
        WebkitBackdropFilter: "blur(22px) saturate(1.1)",
        border: "1px solid rgba(255, 255, 255, 0.55)", borderRadius: 24,
        boxShadow: "0 10px 40px rgba(58, 36, 20, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}>
      <div className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "#C26A4A" }}>
        ——— {eyebrow}
      </div>
      <div className="font-serif-display text-[24px] italic leading-[1.15] mt-1 mb-[14px]" style={{ color: "#2A2520" }}>
        {title}
      </div>
      <div className="flex items-center gap-6 flex-1">
        <DonutChart segments={segments} size={186} thickness={26} />
        <div className="flex-1 flex flex-col gap-[10px]">
          {segments.map((s, i) => {
            const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-3 px-[12px] py-[9px]"
                style={{
                  background: "rgba(255, 248, 235, 0.45)", backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255, 255, 255, 0.55)", borderRadius: 14,
                }}>
                <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                <div className="flex-1 leading-[1.2]">
                  <div className="font-mono-label text-[9px] tracking-[0.2em]" style={{ color: "#7a6655" }}>{s.label.toUpperCase()}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif-display text-[20px] italic font-medium leading-[1.1]" style={{ color: "#2A2520" }}>{s.value}</span>
                    <span className="font-mono-label text-[10px] tracking-[0.14em]" style={{ color: "#7a6655" }}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
      {footnote && (
        <div className="font-mono-label text-[9px] tracking-[0.2em] mt-4 pt-3" style={{ color: "#7a6655", borderTop: "1px dashed rgba(122,102,85,0.3)" }}>
          ✦ {footnote}
        </div>
      )}
    </div>
  );
}

/* ─── Create Event Modal (rendered inside DashboardClient) ─── */
function CreateEventModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [newEventName, setNewEventName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(20,12,4,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-[380px] p-[28px] rounded-[24px]"
        style={{
          background: "rgba(255,248,235,0.95)",
          backdropFilter: "blur(22px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 20px 60px rgba(20,12,4,0.3)",
        }}>
        <div className="font-serif-display text-[22px] italic font-medium mb-1" style={{ color: "#2A2520" }}>
          Buat Event Baru
        </div>
        <div className="font-mono-label text-[9px] tracking-[0.2em] mb-5" style={{ color: "#7a6655" }}>
          ——— AKHIRUSANNAH / AWWALUSANNAH
        </div>
        <input
          value={newEventName}
          onChange={e => setNewEventName(e.target.value)}
          placeholder="Nama event, misal: Awwalusannah"
          className="w-full px-4 py-3 rounded-[14px] outline-none mb-4"
          style={{
            background: "rgba(255,248,235,0.6)",
            border: "1px solid rgba(122,102,85,0.25)",
            color: "#2A2520", fontSize: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }} />
        {createError && (
          <div className="font-mono-label text-[10px] mb-4 px-3 py-2 rounded-[10px]"
            style={{ background: "rgba(181,64,59,0.1)", color: "#B5403B", border: "1px solid rgba(181,64,59,0.2)" }}>
            {createError}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => { setNewEventName(""); setCreateError(""); onClose(); }}
            className="flex-1 py-3 rounded-[14px] cursor-pointer"
            style={{
              background: "rgba(122,102,85,0.12)", color: "#5b4b3e",
              border: "1px solid rgba(122,102,85,0.2)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em",
            }}>
            BATAL
          </button>
          <button
            disabled={creating || !newEventName.trim()}
            onClick={async () => {
              setCreating(true);
              setCreateError("");
              try {
                const res = await fetch("/api/admin/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nama: newEventName.trim() }),
                });
                if (!res.ok) {
                  const err = await res.json();
                  setCreateError(err.error || "Gagal membuat event");
                  return;
                }
                const event = await res.json();
                setActiveEvent(event.id);
                window.location.reload();
              } catch {
                setCreateError("Gagal terhubung ke server");
              } finally {
                setCreating(false);
              }
            }}
            className="flex-1 py-3 rounded-[14px] cursor-pointer disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #C26A4A, #8B4A2F)", color: "#F5EEE0",
              border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em",
              boxShadow: "0 6px 18px rgba(194,106,74,0.35)",
            }}>
            {creating ? "MENYIMPAN..." : "BUAT EVENT"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Activity feed ─── */
const ACTIVITY_LABELS: Record<string, { label: string; color: string }> = {
  invitation_viewed: { label: "VIEW", color: "#C9A35E" },
  rsvp_submitted: { label: "RSVP", color: "#5C7058" },
  rsvp_updated: { label: "RSVP", color: "#5C7058" },
  music_played: { label: "MUSIC", color: "#8B4A2F" },
  music_toggled: { label: "MUSIC", color: "#8B4A2F" },
  map_clicked: { label: "MAP", color: "#C26A4A" },
  youtube_clicked: { label: "YOUTUBE", color: "#B5403B" },
  checkin_scanned: { label: "CHECKIN", color: "#C9A35E" },
};

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatActivityDesc(type: string, metadata: Record<string, unknown>): string {
  if (type === "invitation_viewed") return "Membuka undangan";
  if (type === "rsvp_submitted") {
    const o = metadata.kehadiran_ortu || "";
    const a = metadata.kehadiran_anak || "";
    return `Ortu: ${o}, Anak: ${a}`;
  }
  if (type === "rsvp_updated") return "Memperbarui RSVP";
  if (type === "music_played") return "Memutar musik";
  if (type === "music_toggled") return (metadata.action as string) === "pause" ? "Menjeda musik" : "Memutar musik";
  if (type === "map_clicked") return "Membuka peta lokasi";
  if (type === "youtube_clicked") return "Membuka link YouTube";
  if (type === "checkin_scanned") return "Check-in di lokasi";
  return type;
}

function ActivityCard({ eventId }: { eventId?: string }) {
  const [activities, setActivities] = useState<{ id: string; activity_type: string; metadata: Record<string, unknown>; created_at: string; tamu: { nama_siswa: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    fetch(`/api/admin/activity?event_id=${eventId}&limit=10`)
      .then(r => r.json())
      .then(d => setActivities(d.activities || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="w-[360px] shrink-0 flex flex-col relative overflow-hidden p-[26px_26px_22px]"
      style={{
        background: "rgba(58, 36, 20, 0.78)", backdropFilter: "blur(22px) saturate(1.2)",
        WebkitBackdropFilter: "blur(22px) saturate(1.2)",
        border: "1px solid rgba(255, 255, 255, 0.10)", borderRadius: 24,
        boxShadow: "0 10px 40px rgba(20, 12, 4, 0.25)", color: "#F5EEE0",
      }}>
      <div className="absolute -top-[60px] -right-[60px] w-[220px] h-[220px] rounded-full pointer-events-none opacity-[0.15]"
        style={{ background: "radial-gradient(circle, #C9A35E 0%, rgba(0,0,0,0) 65%)" }} />
      <div className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "#C9A35E" }}>——— LIVE FEED</div>
      <div className="font-serif-display text-[24px] italic leading-[1.15] mt-1 mb-4" style={{ color: "#F5EEE0" }}>
        Aktivitas terkini.
      </div>
      <div className="flex-1 relative pl-[14px]">
        <div className="absolute left-1 top-[6px] bottom-[6px] w-px" style={{ background: "rgba(245,238,224,0.18)" }} />
        {loading ? (
          <div className="text-[12px] pt-4" style={{ color: "rgba(245,238,224,0.5)" }}>Memuat aktivitas...</div>
        ) : activities.length === 0 ? (
          <div className="text-[12px] pt-4" style={{ color: "rgba(245,238,224,0.5)" }}>Belum ada aktivitas.</div>
        ) : activities.map((e, i) => {
          const info = ACTIVITY_LABELS[e.activity_type] || { label: "?", color: "#7a6655" };
          return (
            <div key={e.id} style={{ position: "relative", padding: "11px 0", borderBottom: i < activities.length - 1 ? "1px solid rgba(245,238,224,0.08)" : "none" }}>
              <span className="absolute -left-[14px] top-[18px] w-[9px] h-[9px] rounded-full"
                style={{ background: info.color, boxShadow: `0 0 0 3px rgba(58,36,20,0.85), 0 0 10px ${info.color}` }} />
              <div className="flex items-baseline gap-2 mb-[3px]">
                <span className="font-mono-label text-[9px] tracking-[0.18em]" style={{ color: "#C9A35E" }}>{formatActivityTime(e.created_at)}</span>
                <span style={{ opacity: 0.5, fontSize: 9 }}>·</span>
                <span className="font-mono-label text-[8px] tracking-[0.22em]" style={{ color: info.color }}>{info.label}</span>
              </div>
              <div className="text-[13px] font-medium" style={{ color: "#F5EEE0" }}>{e.tamu?.nama_siswa || "Tamu"}</div>
              <div className="text-[11px] leading-[1.5]" style={{ color: "rgba(245,238,224,0.65)" }}>{formatActivityDesc(e.activity_type, e.metadata)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Countdown helper ─── */
function parseTanggal(tanggal: string): Date | null {
  const months: Record<string, number> = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
  };
  const clean = tanggal.replace(/^[^,]*,?\s*/i, "");
  const parts = clean.split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const month = months[parts[1]?.toLowerCase()];
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
}

function useCountdownText(tanggal: string): string {
  return useMemo(() => {
    const target = parseTanggal(tanggal);
    if (!target) return "";
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return "Acara telah berlangsung";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${d} hari · ${h < 10 ? "0" + h : h} jam`;
  }, [tanggal]);
}

/* ─── Event banner ─── */
function EventBanner({ konten }: { konten?: KontenUndangan | null }) {
  const countdownText = useCountdownText(konten?.tanggal || "");

  return (
    <div className="relative flex items-stretch gap-6 px-[30px] py-[26px] overflow-hidden"
      style={{
        background: "rgba(58, 36, 20, 0.78)", backdropFilter: "blur(22px) saturate(1.2)",
        WebkitBackdropFilter: "blur(22px) saturate(1.2)",
        border: "1px solid rgba(255, 255, 255, 0.10)", borderRadius: 24,
        boxShadow: "0 10px 40px rgba(20, 12, 4, 0.25)", color: "#F5EEE0",
      }}>
      <div className="absolute -top-20 -left-10 w-[280px] h-[280px] rounded-full pointer-events-none opacity-[0.55]"
        style={{ background: "radial-gradient(circle, #C26A4A 0%, rgba(0,0,0,0) 65%)" }} />
      <div className="absolute bottom-20 right-[200px] w-[320px] h-[320px] rounded-full pointer-events-none opacity-[0.35]"
        style={{ background: "radial-gradient(circle, #C9A35E 0%, rgba(0,0,0,0) 60%)" }} />

      <div className="flex-1 relative">
        <div className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "#C9A35E" }}>——— ACARA AKTIF</div>
        <div className="flex items-baseline gap-[14px] mt-1 flex-wrap">
          <div className="font-serif-display text-[32px] italic leading-[1.05] font-medium" style={{ color: "#F5EEE0" }}>
            {konten?.judul || "Wisuda Tahfidz & Pelepasan Siswa"}
          </div>
          <Tag tone="terra"><span className="mr-1">●</span> LIVE · DRAFT TERKIRIM</Tag>
        </div>
        <div className="flex gap-7 mt-[18px] flex-wrap">
          {[
            { l: "TANGGAL", v: konten?.tanggal || "Belum diatur", gold: false },
            { l: "WAKTU", v: konten?.waktu || "Belum diatur", gold: false },
            { l: "LOKASI", v: konten?.lokasi_nama || "Belum diatur", gold: false },
            ...(countdownText ? [{ l: "COUNTDOWN", v: countdownText, gold: true as const }] : []),
          ].map((m, i) => (
            <div key={i}>
              <div className="font-mono-label text-[9px] tracking-[0.22em]" style={{ color: "rgba(245,238,224,0.65)" }}>{m.l}</div>
              <div className="font-serif-display text-[18px] italic mt-[2px]" style={{ color: m.gold ? "#C9A35E" : "#F5EEE0" }}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[10px] items-stretch justify-center relative">
        <Link href="/admin/konten-undangan" className="inline-flex items-center justify-center gap-[10px] whitespace-nowrap px-[22px] py-[11px] rounded-[12px] cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #C9A35E, #b78840)", color: "#2A2520",
            border: "1px solid rgba(255,255,255,0.2)",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em",
            boxShadow: "0 6px 18px rgba(201,163,94,0.35)",
          }}>
          EDIT KONTEN UNDANGAN {icons.arrow}
        </Link>
        <Link href="/undangan/demo" className="inline-flex items-center justify-center gap-[10px] whitespace-nowrap px-[22px] py-[11px] rounded-[12px] cursor-pointer"
          style={{
            background: "rgba(245,238,224,0.1)", color: "#F5EEE0",
            border: "1px solid rgba(245,238,224,0.3)",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em",
            backdropFilter: "blur(10px)",
          }}>
          PRATINJAU UNDANGAN
        </Link>
      </div>
    </div>
  );
}

/* ─── Quick actions grid ─── */
function QuickActions() {
  const items = [
    { icon: icons.add, label: "TAMBAH TAMU", caption: "Input manual nama siswa & orang tua", primary: true, href: "/admin/tamu/baru" },
    { icon: icons.up, label: "UPLOAD CSV", caption: "Bulk import dari spreadsheet", href: "/admin/tamu/upload" },
    { icon: icons.scan, label: "BUKA SCANNER", caption: "QR check-in di lokasi acara", href: "/scan" },
    { icon: icons.send, label: "BROADCAST WA", caption: "Kirim undangan via WhatsApp", href: "/admin/pengaturan" },
    { icon: icons.file, label: "KONTEN", caption: "Edit teks & detail undangan", href: "/admin/konten-undangan" },
  ];
  return (
    <div className="grid grid-cols-5 gap-[14px]">
      {items.map((a, i) => (
        <Link key={i} href={a.href}
          className="flex flex-col gap-[10px] p-[18px_20px] rounded-[24px] cursor-pointer"
          style={{
            background: a.primary
              ? "linear-gradient(135deg, rgba(194,106,74,0.95), rgba(139,74,47,0.95))"
              : "rgba(255, 248, 235, 0.55)",
            backdropFilter: "blur(22px) saturate(1.1)",
            WebkitBackdropFilter: "blur(22px) saturate(1.1)",
            border: a.primary ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.55)",
            color: a.primary ? "#F5EEE0" : "#2A2520",
            boxShadow: a.primary
              ? "0 8px 24px rgba(194,106,74,0.4), inset 0 1px 0 rgba(255,255,255,0.18)"
              : "0 10px 40px rgba(58, 36, 20, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
            fontFamily: "inherit",
          }}>
          <span style={{ color: a.primary ? "#F5EEE0" : "#C26A4A" }}>{a.icon}</span>
          <div className="font-mono-label text-[10px] tracking-[0.24em]">{a.label}</div>
          <div className="text-[12px] leading-[1.5]" style={{ color: a.primary ? "rgba(245,238,224,0.85)" : "#5b4b3e" }}>{a.caption}</div>
        </Link>
      ))}
    </div>
  );
}

/* ─── Main dashboard component ─── */
interface DashboardClientProps {
  totalTamu: number;
  hadir: number;
  tidakHadir: number;
  totalCheckin: number;
  genderStats: { total: number; laki: number; perempuan: number; belum: number };
  attendanceStats: { total: number; offline: number; online: number; tidakHadir: number; belum: number };
  tamuList: unknown[];
  sekolahNama?: string;
  konten?: KontenUndangan | null;
  eventsList?: { id: string; nama: string; slug: string; is_active: boolean | null }[];
  activeEventId?: string;
}

export default function DashboardClient({ totalTamu, hadir, tidakHadir, totalCheckin, genderStats, attendanceStats, tamuList, sekolahNama, konten, eventsList, activeEventId }: DashboardClientProps) {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const totalRsvp = hadir + tidakHadir;
  const rsvpPct = totalTamu > 0 ? Math.round((totalRsvp / totalTamu) * 100) : 0;
  const akanHadir = hadir;
  const akanHadirPct = totalTamu > 0 ? Math.round((akanHadir / totalTamu) * 100) : 0;
  const activeEventSlug = eventsList?.find(e => e.id === activeEventId)?.slug;

  return (
    <div className="min-h-screen flex relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FDF6E8 0%, #F4E6D0 25%, #F8E5D6 55%, #ECE8DC 80%, #FDF6E8 100%)",
        color: "#2A2520",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
      <BgOrbs />
      <div className="relative flex h-full w-full">
        <Sidebar activeKey="dashboard" sekolahNama={sekolahNama} eventsList={eventsList} activeEventId={activeEventId} onCreateEvent={() => setShowCreateEvent(true)} />
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <TopBar totalTamu={totalTamu} />
          <div className="p-5 pt-4 flex flex-col gap-4">
            <EventBanner konten={konten} />

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="TOTAL UNDANGAN" value={String(totalTamu)} delta={`+${totalTamu > 0 ? Math.round(totalTamu * 0.1) : 0}`} caption="Bertambah sejak minggu lalu." accent="#C26A4A" />
              <StatCard label="RSVP KONFIRMASI" value={String(totalRsvp)} delta={`${rsvpPct}%`} caption={`${rsvpPct}% sudah mengisi konfirmasi kehadiran.`} accent="#5C7058" />
              <StatCard label="AKAN HADIR" value={String(akanHadir)} delta={`+${akanHadir > 0 ? Math.round(akanHadir * 0.06) : 0}`} caption={`Termasuk online via livestream.`} accent="#C9A35E" />
              <StatCard label="SUDAH CHECK-IN" value={String(totalCheckin)} caption={totalCheckin === 0 ? "Belum hari H — check-in dibuka 08:00 WIB." : "Sudah melakukan check-in."} accent="#7a6655" />
            </div>

            {/* Charts row */}
            <div className="flex gap-4 items-stretch">
              <ChartCard
                eyebrow="DEMOGRAFI"
                title="Distribusi gender siswa."
                segments={[
                  { label: "Laki-laki", value: genderStats.laki, color: "#C26A4A" },
                  { label: "Perempuan", value: genderStats.perempuan, color: "#5C7058" },
                  { label: "Belum diisi", value: genderStats.belum, color: "#a09080" },
                ]}
                footnote="Auto-detect dari nama data tamu"
              />
              <ChartCard
                eyebrow="KEHADIRAN"
                title="Distribusi RSVP."
                segments={[
                  { label: "Hadir offline", value: attendanceStats.offline || hadir, color: "#C26A4A" },
                  { label: "Online stream", value: attendanceStats.online || 0, color: "#C9A35E" },
                  { label: "Tidak hadir", value: attendanceStats.tidakHadir || tidakHadir, color: "#B5403B" },
                  { label: "Belum konfirmasi", value: attendanceStats.belum || (totalTamu - totalRsvp), color: "#a09080" },
                ]}
                footnote={`Total ${totalRsvp} konfirmasi dari ${totalTamu} undangan terkirim`}
              />
              <ActivityCard eventId={activeEventId} />
            </div>

            {/* Quick actions */}
            <QuickActions />

            {/* Tamu table */}
            <div className="rounded-[24px] overflow-hidden"
              style={{
                background: "rgba(255, 248, 235, 0.55)", backdropFilter: "blur(22px) saturate(1.1)",
                WebkitBackdropFilter: "blur(22px) saturate(1.1)",
                border: "1px solid rgba(255, 255, 255, 0.55)",
                boxShadow: "0 10px 40px rgba(58, 36, 20, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}>
              <div className="px-7 pt-[22px] pb-[18px] flex items-end gap-[18px] flex-wrap"
                style={{ borderBottom: "1px solid rgba(122,102,85,0.18)" }}>
                <div className="flex-1 min-w-[280px]">
                  <div className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "#C26A4A" }}>——— DATA TAMU</div>
                  <div className="font-serif-display text-[28px] italic leading-[1.1] mt-1" style={{ color: "#2A2520" }}>
                    Daftar lengkap undangan.
                  </div>
                </div>
              </div>
              <TamuTable data={tamuList as any[]} eventSlug={activeEventSlug} />
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal show={showCreateEvent} onClose={() => setShowCreateEvent(false)} />
    </div>
  );
}
