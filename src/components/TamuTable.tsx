"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, MessageCircle, Users, QrCode, Send } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/utils";

interface TamuData {
  id: string;
  nama_siswa: string;
  nama_ayah: string | null;
  nama_ibu: string | null;
  no_wa_ayah: string | null;
  no_wa_ibu: string | null;
  jenis_kelamin: string | null;
  token: string;
  rsvp: { kehadiran: string; jumlah: number }[] | null;
  checkin: { waktu: string }[] | null;
}

interface TamuTableProps {
  data: TamuData[];
}

type Tab = "tamu" | "undangan";

export default function TamuTable({ data }: TamuTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("tamu");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { filteredData, counts } = useMemo(() => {
    let filtered = data;

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (tamu) =>
          tamu.nama_siswa.toLowerCase().includes(lower) ||
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
    const res = await fetch(`/api/tamu/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
    setDeleteId(null);
  };

  const getWhatsAppLink = async (tamu: TamuData, target: "ayah" | "ibu") => {
    const namaOrtu = target === "ayah" ? (tamu.nama_ayah || tamu.nama_siswa) : (tamu.nama_ibu || tamu.nama_siswa);
    return await generateWhatsAppLink(
      namaOrtu,
      tamu.token,
      tamu.nama_siswa
      // tanggalAcara, waktuAcara, lokasiAcara use defaults
    );
  };

  const hasWhatsApp = (tamu: TamuData) => tamu.no_wa_ayah || tamu.no_wa_ibu;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <button
            onClick={() => setActiveTab("tamu")}
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
            onClick={() => setActiveTab("undangan")}
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa atau token..."
            className="glass-input w-full pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {activeTab === "tamu" ? (
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Token</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama Siswa</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama Orang Tua</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Aksi</th>
              </tr>
            ) : (
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama Siswa</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">JK</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">RSVP</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Check-in</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Aksi</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y">
            {filteredData.map((tamu) => {
              const hasRsvp = tamu.rsvp && tamu.rsvp.length > 0;
              const hasCheckin = tamu.checkin && tamu.checkin.length > 0;

              if (activeTab === "tamu") {
                return (
                  <tr key={tamu.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      {hasWhatsApp(tamu) ? (
                        <MessageCircle className="w-5 h-5 text-success" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono text-gray-500">{tamu.token}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-gray-800">{tamu.nama_siswa}</div>
                    </td>
                    <td className="px-3 py-3">
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
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                         {tamu.no_wa_ayah && (
                           <button
                             onClick={async () => {
                               const url = await getWhatsAppLink(tamu, "ayah");
                               window.open(url, "_blank");
                             }}
                             className="glass px-2 py-1 text-xs text-success rounded flex items-center gap-1"
                           >
                             <Send className="w-3 h-3" />
                             Ayah
                           </button>
                         )}
                         {tamu.no_wa_ibu && (
                           <button
                             onClick={async () => {
                               const url = await getWhatsAppLink(tamu, "ibu");
                               window.open(url, "_blank");
                             }}
                             className="glass px-2 py-1 text-xs text-success rounded flex items-center gap-1"
                           >
                            <Send className="w-3 h-3" />
                            Ibu
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(tamu.id)}
                          className="p-1 text-gray-400 hover:text-danger"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={tamu.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-800">{tamu.nama_siswa}</div>
                    {(tamu.nama_ayah || tamu.nama_ibu) && (
                      <div className="text-xs text-gray-500">
                        {tamu.nama_ayah && <span>A: {tamu.nama_ayah}</span>}
                        {tamu.nama_ayah && tamu.nama_ibu && ", "}
                        {tamu.nama_ibu && <span>I: {tamu.nama_ibu}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
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
                  <td className="px-3 py-3">
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
                  <td className="px-3 py-3">
                    {hasCheckin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setDeleteId(tamu.id)}
                      className="p-1 text-gray-400 hover:text-danger"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
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