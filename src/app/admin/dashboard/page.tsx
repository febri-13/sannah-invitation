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

async function getStats() {
  const supabase = createAdminClient();
  
  const { count: totalTamu } = await supabase
    .from("tamu")
    .select("*", { count: "exact", head: true });

  const { data: rsvps } = await supabase
    .from("rsvp")
    .select("kehadiran");

  const hadir = rsvps?.filter(r => r.kehadiran === "Hadir").length || 0;
  const tidakHadir = rsvps?.filter(r => r.kehadiran === "Tidak Hadir").length || 0;

  const { count: totalCheckin } = await supabase
    .from("checkin")
    .select("*", { count: "exact", head: true });

  return { totalTamu: totalTamu || 0, hadir, tidakHadir, totalCheckin };
}

async function getTamu() {
  const supabase = createAdminClient();
  
  const { data: tamu } = await supabase
    .from("tamu")
    .select(`
      *,
      rsvp (kehadiran, jumlah),
      checkin (waktu)
    `)
    .order("created_at", { ascending: false });

  return tamu || [];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const stats = await getStats();
  const tamuList = await getTamu();

  const handleLogout = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
  };

  return (
    <div className="min-h-screen bg-cream-light">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-leaf-green">Dashboard Panitia</h1>
          <form action={handleLogout}>
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-600">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-islamic-teal/10 rounded-lg">
                <Users className="w-6 h-6 text-islamic-teal" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Undangan</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalTamu}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">RSVP Hadir</p>
                <p className="text-2xl font-bold text-gray-800">{stats.hadir}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">RSVP Tidak Hadir</p>
                <p className="text-2xl font-bold text-gray-800">{stats.tidakHadir}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/20 rounded-lg">
                <QrCode className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sudah Check-in</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCheckin}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/admin/tamu/baru"
            className="flex items-center gap-2 px-4 py-2 bg-islamic-teal text-white rounded-lg hover:bg-leaf-green"
          >
            <Plus className="w-5 h-5" />
            Tambah Manual
          </Link>
          <Link
            href="/admin/tamu/upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-5 h-5" />
            Upload CSV
          </Link>
           <Link
             href="/scan"
             className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-yellow-600"
           >
             <Scan className="w-5 h-5" />
             Scanner
           </Link>
           <Link
             href="/admin/pengaturan"
             className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
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