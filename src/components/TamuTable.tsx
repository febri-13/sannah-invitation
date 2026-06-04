"use client";

import { useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, Trash2, Users, QrCode, Send, Pencil, Loader2 } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/utils";

interface TamuData {
  id: string;
  nama_siswa: string;
  kelas?: string | null;
  nama_ayah: string | null;
  nama_ibu: string | null;
  no_wa_ayah: string | null;
  no_wa_ibu: string | null;
  jenis_kelamin: string | null;
  token: string;
  rsvp: { kehadiran: string; kehadiran_ortu?: string; kehadiran_anak?: string; jumlah: number; jumlah_ortu?: number }[] | null;
  checkin: { waktu: string | null }[] | null;
  guest_activity_log?: { activity_type: string }[] | null;
}

interface TamuTableProps {
  data: TamuData[];
  eventSlug?: string;
  initialTab?: "tamu" | "undangan";
}

type Tab = "tamu" | "undangan";

interface ColumnDef {
  key: string;
  label: string;
}

const TAMU_COLUMNS: ColumnDef[] = [
  { key: "status", label: "Status" },
  { key: "token", label: "Token" },
  { key: "nama_siswa", label: "Nama Siswa" },
  { key: "kelas", label: "Kelas" },
  { key: "nama_ortu", label: "Nama Orang Tua" },
  { key: "no_wa", label: "No. WA" },
  { key: "aksi", label: "Aksi" },
];

const UNDANGAN_COLUMNS: ColumnDef[] = [
  { key: "nama_siswa", label: "Nama Siswa" },
  { key: "kelas", label: "Kelas" },
  { key: "jenis_kelamin", label: "JK" },
  { key: "rsvp", label: "RSVP" },
  { key: "checkin", label: "Check-in" },
  { key: "aksi", label: "Aksi" },
];

function ClientPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function DeleteModal({ id, onClose, onConfirm }: { id: string; onClose: () => void; onConfirm: (id: string) => void }) {
  return (
    <ClientPortal>
      <div className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: "rgba(20,12,4,0.6)", backdropFilter: "blur(8px)" }}>
        <div className="w-full max-w-sm mx-4 p-6 rounded-[20px]"
          style={{ background: "rgba(255,248,235,0.97)", backdropFilter: "blur(22px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 20px 60px rgba(20,12,4,0.3)" }}>
          <h3 className="text-lg font-bold" style={{ color: "#2A2520" }}>Hapus Tamu?</h3>
          <p className="mb-4" style={{ color: "#5b4b3e" }}>Data yang dihapus tidak dapat dikembalikan.</p>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-2 rounded-[12px] text-sm font-medium cursor-pointer" style={{ background: "rgba(122,102,85,0.12)", color: "#5b4b3e", border: "1px solid rgba(122,102,85,0.2)" }}>Batal</button>
            <button onClick={() => onConfirm(id)} className="flex-1 py-2 rounded-[12px] text-sm font-medium cursor-pointer" style={{ background: "linear-gradient(135deg, #C26A4A, #8B4A2F)", color: "#F5EEE0", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 6px 18px rgba(194,106,74,0.35)" }}>Hapus</button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}

function EditModal({ tamu, onClose, onRefresh }: { tamu: TamuData; onClose: () => void; onRefresh: () => void }) {
  const [namaSiswa, setNamaSiswa] = useState(tamu.nama_siswa);
  const [jenisKelamin, setJenisKelamin] = useState(tamu.jenis_kelamin || "");
  const [kelas, setKelas] = useState(tamu.kelas || "");
  const [namaAyah, setNamaAyah] = useState(tamu.nama_ayah || "");
  const [namaIbu, setNamaIbu] = useState(tamu.nama_ibu || "");
  const [noWaAyah, setNoWaAyah] = useState(tamu.no_wa_ayah || "");
  const [noWaIbu, setNoWaIbu] = useState(tamu.no_wa_ibu || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!namaSiswa || !jenisKelamin) { setError("Nama siswa dan jenis kelamin harus diisi"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/tamu/${tamu.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama_siswa: namaSiswa, jenis_kelamin: jenisKelamin, kelas: kelas || undefined, nama_ayah: namaAyah || undefined, nama_ibu: namaIbu || undefined, no_wa_ayah: noWaAyah || undefined, no_wa_ibu: noWaIbu || undefined }) });
      if (res.ok) { onClose(); onRefresh(); }
      else { const err = await res.json(); setError(err.error || "Gagal menyimpan"); }
    } catch { setError("Gagal terhubung ke server"); }
    finally { setLoading(false); }
  };

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: "rgba(20,12,4,0.6)", backdropFilter: "blur(8px)" }}>
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-[20px]"
            style={{ background: "rgba(255,248,235,0.97)", backdropFilter: "blur(22px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 20px 60px rgba(20,12,4,0.3)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-[20px] italic font-medium" style={{ color: "#2A2520" }}>Edit Tamu</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6l-12 12"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Siswa <span className="text-danger">*</span></label>
                <input type="text" value={namaSiswa} onChange={e => setNamaSiswa(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm outline-none rounded-[10px]"
                  style={{ background: "rgba(255,248,235,0.6)", border: "1px solid rgba(122,102,85,0.25)", color: "#2A2520" }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Kelamin <span className="text-danger">*</span></label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setJenisKelamin("Laki-laki")}
                    className={`flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${jenisKelamin === "Laki-laki" ? "bg-primary text-white" : "text-gray-600"}`}
                    style={{ background: jenisKelamin === "Laki-laki" ? undefined : "rgba(122,102,85,0.1)", border: `1px solid ${jenisKelamin === "Laki-laki" ? "rgba(255,255,255,0.2)" : "rgba(122,102,85,0.18)"}` }}>
                    Laki-laki
                  </button>
                  <button type="button" onClick={() => setJenisKelamin("Perempuan")}
                    className={`flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${jenisKelamin === "Perempuan" ? "bg-pink-500 text-white" : "text-gray-600"}`}
                    style={{ background: jenisKelamin === "Perempuan" ? undefined : "rgba(122,102,85,0.1)", border: `1px solid ${jenisKelamin === "Perempuan" ? "rgba(255,255,255,0.2)" : "rgba(122,102,85,0.18)"}` }}>
                    Perempuan
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kelas</label>
                <input type="text" value={kelas} onChange={e => setKelas(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm outline-none rounded-[10px]"
                  style={{ background: "rgba(255,248,235,0.6)", border: "1px solid rgba(122,102,85,0.25)", color: "#2A2520" }} placeholder="Opsional" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Ayah</label>
                  <input type="text" value={namaAyah} onChange={e => setNamaAyah(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-[10px]"
                    style={{ background: "rgba(255,248,235,0.6)", border: "1px solid rgba(122,102,85,0.25)", color: "#2A2520" }} placeholder="Opsional" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Ibu</label>
                  <input type="text" value={namaIbu} onChange={e => setNamaIbu(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-[10px]"
                    style={{ background: "rgba(255,248,235,0.6)", border: "1px solid rgba(122,102,85,0.25)", color: "#2A2520" }} placeholder="Opsional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">No. WA Ayah</label>
                  <input type="tel" value={noWaAyah} onChange={e => setNoWaAyah(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-[10px]"
                    style={{ background: "rgba(255,248,235,0.6)", border: "1px solid rgba(122,102,85,0.25)", color: "#2A2520" }} placeholder="081234567890" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">No. WA Ibu</label>
                  <input type="tel" value={noWaIbu} onChange={e => setNoWaIbu(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-[10px]"
                    style={{ background: "rgba(255,248,235,0.6)", border: "1px solid rgba(122,102,85,0.25)", color: "#2A2520" }} placeholder="Opsional" />
                </div>
              </div>
              {error && (
                <div className="p-2.5 text-sm rounded-[10px]" style={{ background: "rgba(181,64,59,0.1)", color: "#B5403B", border: "1px solid rgba(181,64,59,0.2)" }}>{error}</div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-[12px] text-sm font-medium cursor-pointer" style={{ background: "rgba(122,102,85,0.12)", color: "#5b4b3e", border: "1px solid rgba(122,102,85,0.2)" }}>Batal</button>
                <button onClick={handleSave} disabled={loading || !namaSiswa || !jenisKelamin} className="flex-1 py-2.5 rounded-[12px] text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C26A4A, #8B4A2F)", color: "#F5EEE0", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 6px 18px rgba(194,106,74,0.35)" }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}

export default function TamuTable({ data, eventSlug, initialTab }: TamuTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || "tamu");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTamu, setEditingTamu] = useState<TamuData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [tamuVisible, setTamuVisible] = useState<Set<string>>(new Set(["status", "token", "nama_siswa", "kelas", "nama_ortu", "no_wa", "aksi"]));
  const [undanganVisible, setUndanganVisible] = useState<Set<string>>(new Set(["nama_siswa", "kelas", "jenis_kelamin", "rsvp", "checkin", "aksi"]));
  const [visibilityLoaded, setVisibilityLoaded] = useState(false);
  const initialLoad = useRef(true);

  const saveColumnVisibility = useCallback((tamu: Set<string>, undangan: Set<string>) => {
    // Skip save on initial load — only save when user explicitly changes
    if (initialLoad.current) return;
    fetch("/api/admin/admin-memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "tamu_column_visibility",
        value: { tamu: Array.from(tamu), undangan: Array.from(undangan) },
      }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/admin-memories?key=tamu_column_visibility")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.memories?.[0]?.value) {
          const v = data.memories[0].value as { tamu?: string[]; undangan?: string[] };
          if (v.tamu) setTamuVisible(new Set(v.tamu));
          if (v.undangan) setUndanganVisible(new Set(v.undangan));
        }
      })
      .catch(() => {})
      .finally(() => setVisibilityLoaded(true));
  }, []);

  useEffect(() => {
    if (!visibilityLoaded) return;
    saveColumnVisibility(tamuVisible, undanganVisible);
    // After first save attempt, allow future saves
    initialLoad.current = false;
  }, [tamuVisible, undanganVisible, visibilityLoaded, saveColumnVisibility]);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 60000);
    return () => clearInterval(interval);
  }, [router]);

  const saveTab = (tab: Tab) => {
    setActiveTab(tab);
    fetch("/api/admin/admin-memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "dashboard_tamu_tab", value: { tab } }),
    }).catch(() => {});
  };

  const toggleColumn = (key: string, show: boolean) => {
    if (activeTab === "tamu") {
      setTamuVisible((prev) => {
        const next = new Set(prev);
        if (show) next.add(key);
        else next.delete(key);
        return next;
      });
    } else {
      setUndanganVisible((prev) => {
        const next = new Set(prev);
        if (show) next.add(key);
        else next.delete(key);
        return next;
      });
    }
  };

  const currentColumns = activeTab === "tamu" ? TAMU_COLUMNS : UNDANGAN_COLUMNS;
  const currentVisible = activeTab === "tamu" ? tamuVisible : undanganVisible;

  const { filteredData, counts } = useMemo(() => {
    let filtered = data;

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (tamu) =>
          tamu.nama_siswa.toLowerCase().includes(lower) ||
          (tamu.kelas?.toLowerCase().includes(lower)) ||
          (tamu.nama_ayah?.toLowerCase().includes(lower)) ||
          (tamu.nama_ibu?.toLowerCase().includes(lower)) ||
          tamu.token.toLowerCase().includes(lower)
      );
    }

    const countTamu = data.length;
    const countUndangan = data.length;

    return { filteredData: filtered, counts: { tamu: countTamu, undangan: countUndangan } };
  }, [data, search, activeTab]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map((t) => t.id)));
    }
  };

  const handleBatchDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/tamu/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        setBatchDeleteConfirm(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal menghapus tamu:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tamu/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal menghapus tamu:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const getWhatsAppLink = async (tamu: TamuData, target: "ayah" | "ibu") => {
    const namaOrtu = target === "ayah" ? (tamu.nama_ayah || tamu.nama_siswa) : (tamu.nama_ibu || tamu.nama_siswa);
    const noWa = target === "ayah" ? tamu.no_wa_ayah : tamu.no_wa_ibu;
    return await generateWhatsAppLink(
      namaOrtu,
      tamu.token,
      tamu.nama_siswa,
      undefined, undefined, undefined,
      noWa ?? undefined
    );
  };

  const getStatusInfo = (tamu: TamuData) => {
    // Normalize: Supabase returns single rsvp as object, multiple as array
    const rsvpList = tamu.rsvp
      ? (Array.isArray(tamu.rsvp) ? tamu.rsvp : [tamu.rsvp])
      : [];
    const hasRsvp = rsvpList.length > 0;

    if (hasRsvp) {
      const r = rsvpList[0];
      const ortu = r.kehadiran_ortu as string;
      const anak = r.kehadiran_anak as string;
      const jmlOrtu = r.jumlah_ortu ?? (ortu === "Offline" ? 1 : ortu === "Online" ? 1 : 0);
      const jmlAnak = anak === "Tidak Hadir" ? 0 : 1;
      const totalOffline = (ortu === "Offline" ? jmlOrtu : 0) + (anak === "Offline" ? jmlAnak : 0);
      const totalOnline = (ortu === "Online" ? 1 : 0) + (anak === "Online" ? jmlAnak : 0);

      return {
        ortu: ortu || "-",
        anak: anak || "-",
        totalOffline,
        totalOnline,
        hasRsvp: true,
      };
    }

    const activityLog = tamu.guest_activity_log
      ? (Array.isArray(tamu.guest_activity_log) ? tamu.guest_activity_log : [tamu.guest_activity_log])
      : [];
    const hasViewed = activityLog.some((log) => log.activity_type === "invitation_viewed");

    return {
      ortu: "-",
      anak: "-",
      totalOffline: 0,
      totalOnline: 0,
      hasRsvp: false,
      hasViewed,
    };
  };

  return (
    <>
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <button
            onClick={() => saveTab("tamu")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "tamu"
                ? "bg-primary text-white"
                : "glass text-gray-600 hover:bg-primary/10"
            }`}
          >
            <Users className="w-4 h-4" />
            Daftar Tamu ({counts.tamu})
          </button>
          <button
            onClick={() => saveTab("undangan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "undangan"
                ? "bg-secondary text-white"
                : "glass text-gray-600 hover:bg-secondary/10"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Daftar Undangan/Kehadiran ({counts.undangan})
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa atau token..."
            className="glass-input w-full pl-9 pr-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {currentColumns
            .map((col) => {
              const on = currentVisible.has(col.key);
              return (
                <button
                  key={col.key}
                  onClick={() => toggleColumn(col.key, !on)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                    on
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{
                    background: on ? "#C26A4A" : "rgba(122,102,85,0.12)",
                    border: on ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(122,102,85,0.18)",
                  }}
                >
                  {col.label}
                </button>
              );
            })}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b"
          style={{ background: "rgba(194,106,74,0.08)", borderColor: "rgba(194,106,74,0.2)" }}>
          <span className="text-sm font-medium" style={{ color: "#2A2520" }}>
            {selectedIds.size} tamu terpilih
          </span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(122,102,85,0.12)", color: "#5b4b3e" }}>
            Batal pilih
          </button>
          <button
            onClick={() => setBatchDeleteConfirm(true)}
            className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 ml-auto"
            style={{ background: "#B5403B", color: "white" }}>
            <Trash2 className="w-3 h-3" /> Hapus {selectedIds.size} tamu
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 w-10">
                <input
                  type="checkbox"
                  checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "#C26A4A" }}
                />
              </th>
              {currentColumns
                .filter((c) => currentVisible.has(c.key))
                .map((col) => (
                  <th key={col.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                    {col.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredData.map((tamu) => {
              const status = getStatusInfo(tamu);
              const hasRsvp = tamu.rsvp ? (Array.isArray(tamu.rsvp) ? tamu.rsvp.length > 0 : true) : false;
              const hasCheckin = tamu.checkin ? (Array.isArray(tamu.checkin) ? tamu.checkin.length > 0 : true) : false;
              const hasWa = tamu.no_wa_ayah || tamu.no_wa_ibu;
              const visibleCols = currentColumns.filter((c) => currentVisible.has(c.key));

              return (
                <tr key={tamu.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(tamu.id)}
                      onChange={() => toggleSelect(tamu.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: "#C26A4A" }}
                    />
                  </td>
                  {visibleCols.map((col) => {
                    if (col.key === "status") {
                      const s = getStatusInfo(tamu);
                      if (!s.hasRsvp) {
                        const text = s.hasViewed ? "Terkirim" : "Belum";
                        const cls = s.hasViewed ? "bg-warning/10 text-warning" : "bg-gray-100 text-gray-400";
                        return (
                          <td key={col.key} className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{text}</span>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            {/* Ortu badge */}
                            <span className={`px-2 py-0.5 rounded-full text-xs inline-flex items-center gap-1 ${
                              s.ortu === "Offline" ? "bg-success/10 text-success"
                              : s.ortu === "Online" ? "bg-blue-100 text-blue-700"
                              : "bg-danger/10 text-danger"
                            }`}>
                              {s.ortu === "Offline" ? "🏠" : s.ortu === "Online" ? "📱" : "✕"} Ortu: {s.ortu}
                            </span>
                            {/* Anak badge */}
                            <span className={`px-2 py-0.5 rounded-full text-xs inline-flex items-center gap-1 ${
                              s.anak === "Offline" ? "bg-success/10 text-success"
                              : s.anak === "Online" ? "bg-blue-100 text-blue-700"
                              : "bg-danger/10 text-danger"
                            }`}>
                              {s.anak === "Offline" ? "🏠" : s.anak === "Online" ? "📱" : "✕"} Anak: {s.anak}
                            </span>
                          </div>
                        </td>
                      );
                    }
                    if (col.key === "token") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <span className="text-xs font-mono text-gray-500">{tamu.token}</span>
                        </td>
                      );
                    }
                    if (col.key === "nama_siswa") {
                      if (activeTab === "undangan") {
                        return (
                          <td key={col.key} className="px-3 py-3">
                            <div className="text-sm font-medium text-gray-800">{tamu.nama_siswa}</div>
                            {(tamu.nama_ayah || tamu.nama_ibu) && (
                              <div className="text-xs text-gray-500">
                                {tamu.nama_ayah && <span>A: {tamu.nama_ayah}</span>}
                                {tamu.nama_ayah && tamu.nama_ibu && ", "}
                                {tamu.nama_ibu && <span>I: {tamu.nama_ibu}</span>}
                              </div>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-800">{tamu.nama_siswa}</div>
                        </td>
                      );
                    }
                    if (col.key === "kelas") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <span className="text-sm text-gray-600">{tamu.kelas || "-"}</span>
                        </td>
                      );
                    }
                    if (col.key === "nama_ortu") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <div className="text-xs space-y-0.5">
                            {tamu.nama_ayah && (
                              <div><span className="text-gray-400">Ayah:</span> <span className="text-gray-700">{tamu.nama_ayah}</span></div>
                            )}
                            {tamu.nama_ibu && (
                              <div><span className="text-gray-400">Ibu:</span> <span className="text-gray-700">{tamu.nama_ibu}</span></div>
                            )}
                            {!tamu.nama_ayah && !tamu.nama_ibu && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                      );
                    }
                    if (col.key === "no_wa") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <div className="flex gap-1">
                            {tamu.no_wa_ayah && (
                              <button
                                onClick={async () => {
                                  const url = await getWhatsAppLink(tamu, "ayah");
                                  window.open(url, "_blank");
                                }}
                                className="glass px-2 py-1 text-xs text-success rounded flex items-center gap-1"
                                title="Kirim WA Ayah"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            )}
                            {tamu.no_wa_ibu && (
                              <button
                                onClick={async () => {
                                  const url = await getWhatsAppLink(tamu, "ibu");
                                  window.open(url, "_blank");
                                }}
                                className="glass px-2 py-1 text-xs text-success rounded flex items-center gap-1"
                                title="Kirim WA Ibu"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            )}
                            {!hasWa && (
                              <span className="text-xs text-gray-400 italic">-</span>
                            )}
                          </div>
                        </td>
                      );
                    }
                    if (col.key === "jenis_kelamin") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          {tamu.jenis_kelamin && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              tamu.jenis_kelamin === "Laki-laki"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}>
                              {tamu.jenis_kelamin === "Laki-laki" ? "L" : "P"}
                            </span>
                          )}
                        </td>
                      );
                    }
                    if (col.key === "rsvp") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          {hasRsvp && tamu.rsvp?.[0] ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              tamu.rsvp[0].kehadiran === "Hadir"
                                ? "bg-success/10 text-success"
                                : "bg-danger/10 text-danger"
                            }`}>
                              {tamu.rsvp[0].kehadiran === "Hadir" ? "Hadir" : "Tidak"} ({tamu.rsvp[0].jumlah})
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      );
                    }
                    if (col.key === "checkin") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          {hasCheckin ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                              ✓
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      );
                    }
                    if (col.key === "aksi") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTamu(tamu)}
                              className="p-1 text-gray-400 hover:text-primary"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(tamu.id)}
                              className="p-1 text-gray-400 hover:text-danger"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      );
                    }
                    return null;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && data.length > 0 && (
        <div className="p-6 text-center text-gray-500">
          Tidak ada data di tab ini
        </div>
      )}
      {data.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          Belum ada tamu. Tambahkan tamu pertama Anda.
        </div>
      )}
    </div>

    {deleteId && <DeleteModal id={deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />}

    {editingTamu && <EditModal tamu={editingTamu} onClose={() => setEditingTamu(null)} onRefresh={() => router.refresh()} />}

    {batchDeleteConfirm && (
      <ClientPortal>
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(20,12,4,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm mx-4 p-6 rounded-[20px]"
            style={{ background: "rgba(255,248,235,0.97)", backdropFilter: "blur(22px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 20px 60px rgba(20,12,4,0.3)" }}>
            <h3 className="text-lg font-bold" style={{ color: "#2A2520" }}>Hapus {selectedIds.size} tamu?</h3>
            <p className="mb-4" style={{ color: "#5b4b3e" }}>Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setBatchDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2 rounded-[12px] text-sm font-medium cursor-pointer disabled:opacity-50"
                style={{ background: "rgba(122,102,85,0.12)", color: "#5b4b3e", border: "1px solid rgba(122,102,85,0.2)" }}>Batal</button>
              <button
                onClick={handleBatchDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-[12px] text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #C26A4A, #8B4A2F)", color: "#F5EEE0", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 6px 18px rgba(194,106,74,0.35)" }}>
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      </ClientPortal>
    )}
    </>
  );
}