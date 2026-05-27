"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Users, QrCode, Send, Columns } from "lucide-react";
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
  rsvp: { kehadiran: string; jumlah: number }[] | null;
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
  { key: "jenis_kelamin", label: "JK" },
  { key: "rsvp", label: "RSVP" },
  { key: "checkin", label: "Check-in" },
  { key: "aksi", label: "Aksi" },
];

function ColumnSelector({
  columns,
  visible,
  onChange,
  onClose,
}: {
  columns: ColumnDef[];
  visible: Set<string>;
  onChange: (key: string, show: boolean) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl overflow-hidden shadow-xl"
      style={{
        background: "rgba(255, 248, 235, 0.97)",
        backdropFilter: "blur(22px)",
        border: "1px solid rgba(122,102,85,0.2)",
      }}
    >
      <div className="px-3 py-2 font-mono-label text-[9px] tracking-[0.2em]" style={{ color: "#7a6655", borderBottom: "1px solid rgba(122,102,85,0.12)" }}>
        PILIH KOLOM
      </div>
      {columns.map((col) => (
        <label
          key={col.key}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-black/5 text-sm"
          style={{ color: "#2A2520" }}
        >
          <input
            type="checkbox"
            checked={visible.has(col.key)}
            onChange={(e) => onChange(col.key, e.target.checked)}
            className="accent-[#C26A4A]"
          />
          {col.label}
        </label>
      ))}
    </div>
  );
}

export default function TamuTable({ data, eventSlug, initialTab }: TamuTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || "tamu");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showColumns, setShowColumns] = useState(false);
  const [tamuVisible, setTamuVisible] = useState<Set<string>>(new Set(["status", "token", "nama_siswa", "kelas", "nama_ortu", "no_wa", "aksi"]));
  const [undanganVisible, setUndanganVisible] = useState<Set<string>>(new Set(["nama_siswa", "jenis_kelamin", "rsvp", "checkin", "aksi"]));
  const isAkhirusannah = eventSlug === "akhirusannah";

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 15000);
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

  const getStatusInfo = (tamu: TamuData): { text: string; className: string } => {
    const hasRsvp = tamu.rsvp && tamu.rsvp.length > 0;
    if (hasRsvp && tamu.rsvp?.[0]) {
      const hadir = tamu.rsvp[0].kehadiran === "Hadir";
      return {
        text: hadir ? "Hadir" : "Tidak Hadir",
        className: hadir ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
      };
    }
    const hasViewed = tamu.guest_activity_log?.some(
      (log) => log.activity_type === "invitation_viewed"
    );
    if (hasViewed) {
      return { text: "Terkirim", className: "bg-warning/10 text-warning" };
    }
    return { text: "Belum", className: "bg-gray-100 text-gray-400" };
  };

  return (
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

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa atau token..."
              className="glass-input w-full pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowColumns(!showColumns)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
              style={{
                background: "rgba(194,106,74,0.12)",
                color: "#C26A4A",
                border: "1px solid rgba(194,106,74,0.25)",
              }}
            >
              <Columns className="w-4 h-4" />
              Kolom
            </button>
            {showColumns && (
              <ColumnSelector
                columns={currentColumns}
                visible={currentVisible}
                onChange={toggleColumn}
                onClose={() => setShowColumns(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {currentColumns
                .filter((c) => currentVisible.has(c.key))
                .filter((c) => c.key !== "kelas" || isAkhirusannah)
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
              const hasRsvp = tamu.rsvp && tamu.rsvp.length > 0;
              const hasCheckin = tamu.checkin && tamu.checkin.length > 0;
              const hasWa = tamu.no_wa_ayah || tamu.no_wa_ibu;
              const visibleCols = currentColumns.filter((c) => currentVisible.has(c.key)).filter((c) => c.key !== "kelas" || isAkhirusannah);

              return (
                <tr key={tamu.id} className="hover:bg-gray-50">
                  {visibleCols.map((col) => {
                    if (col.key === "status") {
                      return (
                        <td key={col.key} className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${status.className}`}>
                            {status.text}
                          </span>
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
                          <button
                            onClick={() => setDeleteId(tamu.id)}
                            className="p-1 text-gray-400 hover:text-danger"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Tamu?</h3>
            <p className="text-gray-600 mb-4">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="glass flex-1 py-2 text-gray-700 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="glass-button flex-1 py-2 text-white rounded-lg font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
  );
}