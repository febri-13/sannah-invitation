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
import TamuTable from "@/components/TamuTable";
import GenderPieChart from "./GenderPieChart";

async function getStats(sekolahId?: string) {
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
    // checkin row doesn't store sekolah_id; join via tamu
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

  return { totalTamu: totalTamu || 0, hadir, tidakHadir, totalCheckin };
}

async function getGenderStats(sekolahId?: string) {
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
}

async function getTamu(sekolahId?: string) {
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
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const sekolahId = user.app_metadata?.sekolah_id as string | undefined;

  const stats = await getStats(sekolahId);
  const genderStats = await getGenderStats(sekolahId);
  const tamuList = await getTamu(sekolahId);

  const handleLogout = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  };

return (
    <div className="min-h-screen">
      <header className="glass p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-secondary">Dashboard Panitia</h1>
          <form action={handleLogout}>
            <button className="flex items-center gap-2 text-gray-600 hover:text-danger">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Undangan</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalTamu}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-500">RSVP Hadir</p>
                <p className="text-2xl font-bold text-gray-800">{stats.hadir}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <XCircle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <p className="text-sm text-gray-500">RSVP Tidak Hadir</p>
                <p className="text-2xl font-bold text-gray-800">{stats.tidakHadir}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <QrCode className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sudah Check-in</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCheckin}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <GenderPieChart {...genderStats} />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/admin/tamu/baru"
            className="glass-button flex items-center gap-2 px-4 py-2 text-white"
          >
            <Plus className="w-5 h-5" />
            Tambah Manual
          </Link>
          <Link
            href="/admin/tamu/upload"
            className="glass-button flex items-center gap-2 px-4 py-2 text-white"
          >
            <Upload className="w-5 h-5" />
            Upload CSV
          </Link>
           <Link
             href="/scan"
             className="glass-button flex items-center gap-2 px-4 py-2 text-white"
           >
             <Scan className="w-5 h-5" />
             Scanner
           </Link>
           <Link
             href="/admin/pengaturan"
             className="glass-button flex items-center gap-2 px-4 py-2 text-white"
           >
             <Settings className="w-5 h-5" />
             Pengaturan
           </Link>
        </div>

        <TamuTable data={tamuList} />
      </main>
    </div>
  );
}