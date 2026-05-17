"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  BookOpen,
  Mic,
  Video,
  Camera,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AgendaItem {
  waktu: string;
  icon: string;
  judul: string;
}

interface KontenData {
  id: string;
  judul: string;
  subtitle: string;
  bismillah: string;
  hero_desc: string;
  tanggal: string;
  waktu: string;
  lokasi_nama: string;
  lokasi_alamat: string;
  lokasi_maps: string;
  link_youtube: string;
  agenda: AgendaItem[];
  header_arabic: string;
  footer: string;
}

const ICON_OPTIONS = [
  { value: "BookOpen", label: "Pembukaan", component: BookOpen },
  { value: "Mic", label: "Mikrofon", component: Mic },
  { value: "Video", label: "Video", component: Video },
  { value: "Camera", label: "Kamera", component: Camera },
  { value: "Star", label: "Bintang", component: Star },
] as const;

const DEFAULT_AGENDA: AgendaItem[] = [
  { waktu: "08.00 - 08.30", icon: "BookOpen", judul: "Pembukaan & Doa" },
  { waktu: "08.30 - 09.30", icon: "Mic", judul: "Laporan & Pidato" },
  { waktu: "09.30 - 10.30", icon: "Video", judul: "Pemutaran Video Kenangan" },
  { waktu: "10.30 - 11.30", icon: "Camera", judul: "Salam & Foto Bersama" },
  { waktu: "11.30 - 12.00", icon: "Star", judul: "Penutupan" },
];

function AgendaIcon({ icon }: { icon: string }) {
  const Icon = ICON_OPTIONS.find((o) => o.value === icon)?.component;
  return Icon ? <Icon className="w-4 h-4" /> : null;
}

export default function KontenUndanganPage() {
  const router = useRouter();
  const [data, setData] = useState<KontenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [judul, setJudul] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bismillah, setBismillah] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktu, setWaktu] = useState("");
  const [lokasiNama, setLokasiNama] = useState("");
  const [lokasiAlamat, setLokasiAlamat] = useState("");
  const [lokasiMaps, setLokasiMaps] = useState("");
  const [linkYoutube, setLinkYoutube] = useState("");
  const [agenda, setAgenda] = useState<AgendaItem[]>(DEFAULT_AGENDA);
  const [headerArabic, setHeaderArabic] = useState("");
  const [footer, setFooter] = useState("");

  useEffect(() => {
    fetchKonten();
  }, []);

  const fetchKonten = async () => {
    try {
      const res = await fetch("/api/admin/konten-undangan");
      const result = await res.json();
      if (res.ok) {
        setData(result);
        setJudul(result.judul || "");
        setSubtitle(result.subtitle || "");
        setBismillah(result.bismillah || "");
        setHeroDesc(result.hero_desc || "");
        setTanggal(result.tanggal || "");
        setWaktu(result.waktu || "");
        setLokasiNama(result.lokasi_nama || "");
        setLokasiAlamat(result.lokasi_alamat || "");
        setLokasiMaps(result.lokasi_maps || "");
        setLinkYoutube(result.link_youtube || "");
        setAgenda(
          Array.isArray(result.agenda) && result.agenda.length > 0
            ? result.agenda
            : DEFAULT_AGENDA
        );
        setHeaderArabic(result.header_arabic || "");
        setFooter(result.footer || "");
      } else {
        setError(result.error || "Gagal mengambil data konten undangan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/konten-undangan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          subtitle,
          bismillah,
          hero_desc: heroDesc,
          tanggal,
          waktu,
          lokasi_nama: lokasiNama,
          lokasi_alamat: lokasiAlamat,
          lokasi_maps: lokasiMaps,
          link_youtube: linkYoutube,
          agenda,
          header_arabic: headerArabic,
          footer,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setData(result);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Gagal menyimpan konten undangan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    }

    setSaving(false);
  };

  const addAgendaItem = () => {
    setAgenda([...agenda, { waktu: "", icon: "BookOpen", judul: "" }]);
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (
    index: number,
    field: keyof AgendaItem,
    value: string
  ) => {
    const updated = [...agenda];
    updated[index] = { ...updated[index], [field]: value };
    setAgenda(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-secondary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Dashboard
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary">
              Konten Undangan
            </h1>
            <p className="text-gray-500 text-sm">
              Edit teks, tanggal, lokasi, dan susunan acara undangan
            </p>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-danger/10 border-l-4 border-danger text-danger rounded-r-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-6 p-4 bg-success/10 border-l-4 border-success text-success rounded-r-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              Konten undangan berhasil disimpan!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-card p-6 space-y-6">
          {/* Header Fields */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Header
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bismillah (Arab)
                </label>
                <input
                  value={bismillah}
                  onChange={(e) => setBismillah(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-noto-arabic text-lg"
                  placeholder="بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hero Description
                </label>
                <input
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(opsional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Acara
                </label>
                <input
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Akhirusannah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Perpisahan Sekolah"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Detail Acara
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Sabtu, 21 Juni 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu
                </label>
                <input
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Pukul 08.00 - 12.00 WIB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi (Nama Tempat)
                </label>
                <input
                  value={lokasiNama}
                  onChange={(e) => setLokasiNama(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="MTsN 1 Kota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link YouTube
                </label>
                <input
                  value={linkYoutube}
                  onChange={(e) => setLinkYoutube(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                value={lokasiAlamat}
                onChange={(e) => setLokasiAlamat(e.target.value)}
                rows={3}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Jl. Pendidikan No. 123"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Link{" "}
                <span className="text-gray-400 font-normal">
                  (buka Google Maps → Share → Copy link)
                </span>
              </label>
              <input
                value={lokasiMaps}
                onChange={(e) => setLokasiMaps(e.target.value)}
                className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://maps.google.com/?q=..."
              />
            </div>
          </div>

          {/* Agenda */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                Susunan Acara
              </h3>
              <button
                type="button"
                onClick={addAgendaItem}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>

            <div className="space-y-3">
              {agenda.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 glass rounded-xl"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Waktu
                      </label>
                      <input
                        value={item.waktu}
                        onChange={(e) =>
                          updateAgendaItem(index, "waktu", e.target.value)
                        }
                        className="glass-input w-full px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="08.00 - 08.30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Icon
                      </label>
                      <select
                        value={item.icon}
                        onChange={(e) =>
                          updateAgendaItem(index, "icon", e.target.value)
                        }
                        className="glass-input w-full px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm appearance-none"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Judul Acara
                      </label>
                      <input
                        value={item.judul}
                        onChange={(e) =>
                          updateAgendaItem(index, "judul", e.target.value)
                        }
                        className="glass-input w-full px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="Pembukaan & Doa"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5">
                    <span className="text-gray-400">
                      <AgendaIcon icon={item.icon} />
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(index)}
                      className="text-gray-400 hover:text-danger transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {agenda.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Belum ada agenda. Klik "Tambah" untuk menambahkan.
              </p>
            )}
          </div>

          {/* Footer */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Footer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teks Header Arab
                </label>
                <input
                  value={headerArabic}
                  onChange={(e) => setHeaderArabic(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary font-noto-arabic"
                  placeholder="© 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer
                </label>
                <input
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  className="glass-input w-full px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Akhirusannah. Semua hak dilindungi."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="glass-button flex items-center gap-2 px-6 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </motion.div>
    </div>
  );
}
