import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  QrCode, 
  LogOut,
  Plus,
  Scan,
  Upload,
  Settings
} from "lucide-react";
import dynamic from "next/dynamic";

const TamuTable = dynamic(() => import("@/components/TamuTable"), {
  loading: () => (
    <div className="rounded-2xl bg-white/70 p-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg mb-4 w-64" />
      <div className="h-10 bg-gray-200 rounded-lg mb-4 w-full" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  ),
});
import GenderPieChart from "./GenderPieChart";

const defaultStats = { totalTamu: 0, hadir: 0, tidakHadir: 0, totalCheckin: 0 };
const defaultGenderStats = { total: 0, laki: 0, perempuan: 0, belum: 0 };

async function getStats(sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const tamuQuery = supabase
      .from("tamu")
      .select("*", { count: "exact", head: true });
    if (sekolahId) tamuQuery.eq("sekolah_id", sekolahId);
    const { count: totalTamu } = await tamuQuery;

    const rsvpQuery = supabase
      .from("rsvp")
      .select("kehadiran");
    if (sekolahId) rsvpQuery.eq("sekolah_id", sekolahId);
    const { data: rsvps } = await rsvpQuery;

    const hadir = rsvps?.filter(r => r.kehadiran === "Hadir").length || 0;
    const tidakHadir = rsvps?.filter(r => r.kehadiran === "Tidak Hadir").length || 0;

    const checkinQuery = supabase
      .from("checkin")
      .select("*", { count: "exact", head: true });
    if (sekolahId) {
      const { data: tamuIds } = await supabase
        .from("tamu")
        .select("id")
        .eq("sekolah_id", sekolahId);
      const ids = tamuIds?.map(t => t.id) || [];
      if (ids.length === 0) {
        return { totalTamu: totalTamu || 0, hadir, tidakHadir, totalCheckin: 0 };
      }
      checkinQuery.in("tamu_id", ids);
    }
    const { count: totalCheckin } = await checkinQuery;

    return { totalTamu: totalTamu || 0, hadir, tidakHadir, totalCheckin: totalCheckin || 0 };
  } catch (error) {
    console.error("Gagal mengambil statistik:", error);
    return defaultStats;
  }
}

async function getGenderStats(sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const query = supabase
      .from("tamu")
      .select("jenis_kelamin");
    if (sekolahId) query.eq("sekolah_id", sekolahId);
    const { data } = await query;

    const total = data?.length || 0;
    const laki =
      data?.filter((t) => t.jenis_kelamin === "Laki-laki").length || 0;
    const perempuan =
      data?.filter((t) => t.jenis_kelamin === "Perempuan").length || 0;
    const belum = total - laki - perempuan;

    return { total, laki, perempuan, belum };
  } catch (error) {
    console.error("Gagal mengambil statistik gender:", error);
    return defaultGenderStats;
  }
}

async function getTamu(sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const query = supabase
      .from("tamu")
      .select(`
        *,
        rsvp (kehadiran, jumlah),
        checkin (waktu)
      `)
      .order("created_at", { ascending: false });
    if (sekolahId) query.eq("sekolah_id", sekolahId);

    const { data } = await query;
    return data || [];
  } catch (error) {
    console.error("Gagal mengambil data tamu:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sekolahId = user?.app_metadata?.sekolah_id as string | undefined;

  let stats = defaultStats;
  let genderStats = defaultGenderStats;
  let tamuList: Awaited<ReturnType<typeof getTamu>> = [];

  try {
    stats = await getStats(sekolahId);
    genderStats = await getGenderStats(sekolahId);
    tamuList = await getTamu(sekolahId);
  } catch (error) {
    console.error("Gagal memuat dashboard:", error);
  } finally {
    console.log("Dashboard selesai dimuat");
  }

  const handleLogout = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  };

return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/90 backdrop-blur-md w-full sticky top-0 z-50 flex justify-between items-center px-6 py-4 border-b border-white/40">
        <h1 className="text-xl font-bold text-on-surface">Dashboard Panitia</h1>
        <form action={handleLogout}>
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface hover:bg-white/40 px-4 py-2 rounded-full transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </form>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Total Undangan</p>
              <h3 className="text-2xl font-bold text-on-surface leading-none">{stats.totalTamu}</h3>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">RSVP Hadir</p>
              <h3 className="text-2xl font-bold text-on-surface leading-none">{stats.hadir}</h3>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">RSVP Tidak Hadir</p>
              <h3 className="text-2xl font-bold text-on-surface leading-none">{stats.tidakHadir}</h3>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Sudah Check-in</p>
              <h3 className="text-2xl font-bold text-on-surface leading-none">{stats.totalCheckin}</h3>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <GenderPieChart {...genderStats} />
        </section>

        <section className="flex flex-wrap gap-3">
          <Link
            href="/admin/tamu/baru"
            className="bg-primary text-white hover:bg-blue-700 px-5 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Manual
          </Link>
          <Link
            href="/admin/tamu/upload"
            className="glass-panel text-on-surface hover:bg-white/80 px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload CSV
          </Link>
          <Link
            href="/scan"
            className="glass-panel text-on-surface hover:bg-white/80 px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors"
          >
            <Scan className="w-5 h-5" />
            Scanner
          </Link>
          <Link
            href="/admin/pengaturan"
            className="glass-panel text-on-surface hover:bg-white/80 px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Pengaturan
          </Link>
        </section>

        <TamuTable data={tamuList} />
      </main>
    </div>
  );
}