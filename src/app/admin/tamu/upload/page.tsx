"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, CheckCircle, FileSpreadsheet, AlertCircle, UserRound, Users } from "lucide-react";

interface ParsedRow {
  nama_siswa: string;
  jenis_kelamin: string;
  kelas?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  no_wa_ayah?: string;
  no_wa_ibu?: string;
}

type CsvFormat = "standard" | "siswa" | null;

const MALE_FIRST_NAMES = new Set([
  "muhammad", "ahmad", "alif", "ilyas", "arsenio", "savino",
  "elbrian", "fathir", "fauzi", "dafi", "abiyu", "arjuna",
  "pranaja", "arkarega", "rayyan", "nawaf", "hiroshi", "alvin",
  "rasyid", "ismail", "faqih", "shaka", "rafardhan", "azzam",
  "lukman", "daniswara", "kenzie", "azhar", "pradipta",
  "virgatama", "fatih", "izhar", "abisatya", "gibran",
  "aliffiandra", "fahreza", "gilbran", "ahda", "khalid",
  "muzakki", "rahmat", "danang", "akhdan", "alfreyza",
  "maulana", "zaidan", "hafidz", "narendra", "bintang",
  "aldebaran", "zufar", "rafa", "erabbani", "saladin",
  "iqbal", "ervito", "erick", "rafi", "akhtar",
  "ghazali", "hamizan", "saeeduzzaman", "mirza", "yazid",
  "arrasyputra", "nugroho", "nur", "al", "abrizam",
  "arkana", "ardiansyah", "alvaro", "akmal", "attaqiy",
  "arasyputra", "azzamy", "ramadhan", "tsaqib", "tsaqif",
  "atmojo", "pratama", "pratista", "rachmat", "priambodo",
  "susilo", "raiful", "nadhifa", "mochammad", "armature",
  "attaqiy", "nadhifah", "sari", "rooneyavril", "raufa",
  "arsyad", "rahadhian", "gamantara", "santoso", "syihabuddin",
  "yafiq", "bryan", "cahya", "wicaksono", "tri",
  "azkarya", "kamaluddin", "ghozali", "reynard", "wardana",
  "wildan", "shahzada", "kenzie", "ozora", "setyawan",
  "azkarya", "arif", "hidayat", "fahri", "akhtar",
  "rayyan", "hutomo", "tri", "yoda", "wiatmaja",
  "al", "falih", "putra", "wisesa", "nur", "alviris",
  "ariadi", "prabowo", "wiratama", "bashofi",
]);

const FEMALE_FIRST_NAMES = new Set([
  "alisya", "dafinna", "khaliqa", "alya", "qisya", "carmella",
  "naura", "nadya", "aqeela", "frynda", "nabila", "ainiya",
  "raisya", "rumaisa", "aliya", "alisha", "aisha", "khyla",
  "daania", "yumna", "arisha", "reviokta", "dhiba", "gendhis",
  "ghania", "hafsah", "kanaya", "nasyra", "najwa",
  "keisha", "silmi", "aurora", "zhafrah", "adzkia",
  "ashyfa", "jihan", "maulida", "astika", "fathi",
  "ramadhani", "hasna", "meisyara", "faidha",
  "kayla", "naeva", "wafa", "faiha", "hafiza",
  "zahra", "almahyra", "fariha", "nadhifah", "akifa",
  "raiqa", "shaliha", "bilqis", "afrah", "latifa",
  "thalita", "adara", "joyce", "silitonga", "samha",
  "saufa", "tanzil", "ulfa", "adara", "putri",
  "kamilah", "shidqiyya", "shidqia", "wijaya", "izzati",
  "zara", "qaireen", "ghaniya", "avariella", "titis",
  "prabanggono", "kamilah", "nadhifa", "meisyara",
  "aljufri", "alhasanah", "kayla", "naeva",
  "almahyra", "nadhifah", "akifa", "naila",
  "shaliha", "althafunnisa", "ozil", "syazani",
  "karimah", "farhati", "queenza", "nugraha",
  "queenaisya", "syeeraf", "mumtazul", "uula",
  "athaya", "ayunda", "shaliha", "raisa", "fauzi",
  "ainsani", "manahil",
]);

function detectGender(name: string): string | null {
  const firstWord = name.toLowerCase().split(" ")[0];
  if (MALE_FIRST_NAMES.has(firstWord)) return "Laki-laki";
  if (FEMALE_FIRST_NAMES.has(firstWord)) return "Perempuan";
  return null;
}

function parsePhone(raw: string): string | undefined {
  const cleaned = raw.replace(/[\s\-]/g, "").replace(/^0+/, "");
  return cleaned || undefined;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [format, setFormat] = useState<CsvFormat>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const getActiveEvent = () => {
    const match = document.cookie.match(new RegExp("(^| )active_event_id=([^;]+)"));
    return match ? match[2] : undefined;
  };

  const maleCount = parsedData.filter((r) => r.jenis_kelamin === "Laki-laki").length;
  const femaleCount = parsedData.filter((r) => r.jenis_kelamin === "Perempuan").length;
  const unknownCount = parsedData.filter((r) => r.jenis_kelamin !== "Laki-laki" && r.jenis_kelamin !== "Perempuan").length;

  const allGenderSet = unknownCount === 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("File harus berformat CSV");
      return;
    }

    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        setError("File CSV kosong atau hanya berisi header");
        return;
      }

      const header = lines[0].trim();
      const isSiswaFormat = header.includes("No,") && header.includes("Nama") && header.includes("NO.HP");
      const delimiter = isSiswaFormat ? "," : ";";

      const data: ParsedRow[] = [];

      if (isSiswaFormat) {
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(delimiter);
          if (parts.length < 4) continue;

          const nama = parts[1]?.trim();
          const keterangan = parts[2]?.trim();
          const phone = parts[3]?.trim();

          if (!nama) continue;

          const gender = detectGender(nama);
          const cleanPhone = phone && phone !== "VCP" ? parsePhone(phone) : undefined;

          data.push({
            nama_siswa: nama,
            jenis_kelamin: gender || "",
            kelas: keterangan || undefined,
            no_wa_ayah: cleanPhone,
          });
        }
        setFormat("siswa");
      } else {
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(delimiter);
          if (parts.length >= 2) {
            const nama_siswa = parts[0].trim();
            const jenis_kelamin = parts[1].trim();
            const kelas = parts[2]?.trim() || undefined;
            const nama_ayah = parts[3]?.trim() || undefined;
            const nama_ibu = parts[4]?.trim() || undefined;
            const no_wa_ayah = parts[5]?.trim() || undefined;
            const no_wa_ibu = parts[6]?.trim() || undefined;
            
            if (nama_siswa && jenis_kelamin) {
              data.push({ nama_siswa, jenis_kelamin, kelas, nama_ayah, nama_ibu, no_wa_ayah, no_wa_ibu });
            }
          }
        }
        setFormat("standard");
      }

      if (data.length === 0) {
        setError("Tidak ada data valid yang ditemukan dalam CSV");
        return;
      }

      setParsedData(data);
    };
    reader.readAsText(selectedFile);
  };

  const setGenderForRow = (index: number, gender: string) => {
    setParsedData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], jenis_kelamin: gender };
      return updated;
    });
  };

  const setGenderAll = (gender: string) => {
    setParsedData((prev) =>
      prev.map((row) => ({ ...row, jenis_kelamin: gender }))
    );
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    if (!allGenderSet) {
      setError("Semua tamu harus memiliki jenis kelamin sebelum diupload");
      return;
    }

    setLoading(true);
    setError("");

    const eventId = getActiveEvent();

    let successCount = 0;
    let failedCount = 0;

    for (const row of parsedData) {
      try {
        const res = await fetch("/api/tamu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_siswa: row.nama_siswa,
            jenis_kelamin: row.jenis_kelamin,
            kelas: row.kelas || undefined,
            nama_ayah: row.nama_ayah || undefined,
            nama_ibu: row.nama_ibu || undefined,
            no_wa_ayah: row.no_wa_ayah || undefined,
            no_wa_ibu: row.no_wa_ibu || undefined,
            event_id: eventId,
          }),
        });

        if (res.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    setResults({ success: successCount, failed: failedCount });
    setSuccess(true);
    setLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setFormat(null);
    setSuccess(false);
    setResults(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/90 backdrop-blur-md w-full sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-white/40">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface hover:bg-white/40 px-3 py-2 rounded-full transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-on-surface">Upload Tamu (CSV)</h1>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {!success ? (
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-2xl p-5">
              <h3 className="font-semibold text-on-surface mb-3">Format CSV</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                <strong>Format 1 (Standar):</strong> delimiter <code className="bg-white/60 px-1.5 py-0.5 rounded text-xs font-mono">;</code> (titik koma)
              </p>
              <div className="bg-white/60 rounded-xl p-3 mt-2 font-mono text-xs text-on-surface-variant leading-relaxed break-all">
                nama_siswa;jenis_kelamin;kelas;nama_ayah;nama_ibu;no_wa_ayah;no_wa_ibu
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Contoh: <span className="font-mono">Fatimah;Perempuan;VI A;Ahmad Wijaya;Siti Aminah;081234567890;</span>
              </p>
              <hr className="my-3 border-white/40" />
              <p className="text-sm text-on-surface-variant leading-relaxed">
                <strong>Format 2 (Rekap Siswa):</strong> delimiter <code className="bg-white/60 px-1.5 py-0.5 rounded text-xs font-mono">,</code> (koma) — <span className="font-medium">auto-detect</span>
              </p>
              <div className="bg-white/60 rounded-xl p-3 mt-2 font-mono text-xs text-on-surface-variant leading-relaxed break-all">
                No,Nama,Keterangan,NO.HP
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                Kolom <span className="font-medium">Keterangan</span> (Beasiswa/Anak Pegawai/dll) akan masuk ke kolom Kelas.
                No. HP akan masuk ke WA Ayah. <span className="font-medium">Jenis kelamin</span> dideteksi otomatis dari nama depan.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 glass-input"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">{file ? file.name : "Pilih file CSV"}</span>
              </button>
            </div>

            {format === "siswa" && parsedData.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-success" />
                    </div>
                    <span className="font-semibold text-on-surface text-sm">
                      {parsedData.length} siswa ditemukan
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {maleCount} L
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      {femaleCount} P
                    </span>
                    {unknownCount > 0 && (
                      <span className="flex items-center gap-1 text-warning">
                        <AlertCircle className="w-3 h-3" />
                        {unknownCount} ?
                      </span>
                    )}
                  </div>
                </div>

                {unknownCount > 0 && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-warning/10 text-warning text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{unknownCount} siswa belum terdeteksi jenis kelaminnya. Atur manual per baris atau gunakan tombol di bawah.</span>
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setGenderAll("Laki-laki")}
                    className="px-3 py-1.5 text-xs rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 font-medium transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    Semua Laki-laki
                  </button>
                  <button
                    onClick={() => setGenderAll("Perempuan")}
                    className="px-3 py-1.5 text-xs rounded-full bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 font-medium transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    Semua Perempuan
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {parsedData.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/60 text-sm"
                    >
                      <span className="flex-1 truncate">{row.nama_siswa}</span>
                      {row.kelas && (
                        <span className="text-xs text-on-surface-variant bg-white/60 px-1.5 py-0.5 rounded">
                          {row.kelas}
                        </span>
                      )}
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setGenderForRow(i, "Laki-laki")}
                          className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
                            row.jenis_kelamin === "Laki-laki"
                              ? "bg-blue-500 text-white"
                              : "bg-white/60 text-on-surface-variant hover:bg-blue-500/10"
                          }`}
                        >
                          L
                        </button>
                        <button
                          onClick={() => setGenderForRow(i, "Perempuan")}
                          className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
                            row.jenis_kelamin === "Perempuan"
                              ? "bg-pink-500 text-white"
                              : "bg-white/60 text-on-surface-variant hover:bg-pink-500/10"
                          }`}
                        >
                          P
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {format === "standard" && parsedData.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-semibold text-on-surface text-sm">
                    {parsedData.length} data ditemukan
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto bg-surface-container-low rounded-2xl p-3 space-y-1">
                  {parsedData.map((row, i) => (
                    <div key={i} className="text-sm py-1.5 px-3 rounded-xl bg-white/60 text-on-surface">
                      {row.nama_siswa} <span className="text-on-surface-variant">({row.jenis_kelamin})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 text-danger text-sm rounded-2xl">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || parsedData.length === 0 || (format === "siswa" && !allGenderSet)}
              className="bg-primary text-white hover:bg-blue-700 w-full py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {parsedData.length} Tamu
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">Upload Selesai</h2>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Berhasil</span>
                <span className="font-semibold text-success bg-success/10 px-3 py-1 rounded-full text-sm">{results?.success}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Gagal</span>
                <span className="font-semibold text-danger bg-danger/10 px-3 py-1 rounded-full text-sm">{results?.failed}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="bg-primary text-white hover:bg-blue-700 flex-1 py-3 rounded-full font-semibold shadow-sm transition-colors"
              >
                Lihat Dashboard
              </button>
              <button
                onClick={handleReset}
                className="glass-panel text-on-surface hover:bg-white/80 flex-1 py-3 rounded-full font-semibold transition-colors"
              >
                Upload Lagi
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
