"use client";

import { useState, useEffect, useCallback } from "react";
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
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "@/lib/themes";

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
  template_slug: string;
  logo_url: string;
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
  const [eventId, setEventId] = useState<string | undefined>(undefined);

  const getEventId = useCallback(() => {
    const match = document.cookie.match(new RegExp("(^| )active_event_id=([^;]+)"));
    return match ? match[2] : undefined;
  }, []);

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
  const [templateSlug, setTemplateSlug] = useState("glass-premium");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const eid = getEventId();
    setEventId(eid);
    fetchKonten(eid);
  }, []);

  const fetchKonten = async (eid?: string) => {
    try {
      const url = eid ? `/api/admin/konten-undangan?event_id=${eid}` : "/api/admin/konten-undangan";
      const res = await fetch(url);
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
        setTemplateSlug(result.template_slug || "glass-premium");
        setLogoUrl(result.logo_url || "");
      } else {
        setError(result.error || "Gagal mengambil data konten undangan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setLogoUrl(result.logo_url);
      } else {
        setError(result.error || "Gagal upload logo");
      }
    } catch {
      setError("Gagal terhubung ke server");
    }

    setUploading(false);
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
          template_slug: templateSlug,
          logo_url: logoUrl,
          event_id: eventId,
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Sekolah
              </label>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {logoUrl ? (
                    <div className="relative">
                      <img
                        src={logoUrl}
                        alt="Logo sekolah"
                        className="w-20 h-20 object-contain rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoUrl("")}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLogo(file);
                        e.target.value = "";
                      }}
                    />
                    <span className="glass px-4 py-2.5 inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-primary/10 cursor-pointer transition-colors rounded-xl">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          Pilih Gambar
                        </>
                      )}
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, WebP, atau SVG. Maks 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              <Palette className="w-4 h-4 inline mr-2" />
              Template Tema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setTemplateSlug(t.slug)}
                  className={`p-4 rounded-xl text-left border-2 transition-all ${
                    templateSlug === t.slug
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg mb-2`}
                    style={{
                      background: t.slug === "glass-premium"
                        ? "linear-gradient(135deg, #C26A4A, #8B4A2F)"
                        : t.slug === "classic-gold"
                        ? "linear-gradient(135deg, #B8860B, #6B5B00)"
                        : "linear-gradient(135deg, #5C7058, #3D4F3A)"
                    }}
                  />
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                </button>
              ))}
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
