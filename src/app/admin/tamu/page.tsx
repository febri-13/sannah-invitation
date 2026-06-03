import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TamuTable from "@/components/TamuTable";

const icons = {
  add: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>,
  up: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3M12 4v12M7 9l5-5 5 5"/></svg>,
  users: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 20c0-2 2-3.5 4-3.5"/></svg>,
};

function StatCard({ label, value, caption, accent = "#C26A4A" }: { label: string; value: string; caption?: string; accent?: string }) {
  return (
    <div className="relative flex flex-col gap-1 overflow-hidden p-[18px_20px]"
      style={{
        background: "rgba(255, 248, 235, 0.55)", backdropFilter: "blur(22px) saturate(1.1)",
        WebkitBackdropFilter: "blur(22px) saturate(1.1)",
        border: "1px solid rgba(255, 255, 255, 0.55)", borderRadius: 18,
        boxShadow: "0 10px 40px rgba(58, 36, 20, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}>
      <div className="absolute -top-8 -right-8 w-[100px] h-[100px] rounded-full pointer-events-none opacity-[0.18]"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent} 0%, rgba(0,0,0,0) 70%)` }} />
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <div className="font-mono-label text-[9px] tracking-[0.26em]" style={{ color: "#7a6655" }}>{label}</div>
      </div>
      <div className="flex items-baseline gap-[10px] mt-[2px]">
        <div className="font-serif-display text-[36px] leading-[0.95] italic font-medium" style={{ color: "#2A2520" }}>
          {value}
        </div>
        {caption && (
          <span className="font-mono-label text-[10px] px-[9px] py-[3px] tracking-[0.14em] rounded-[14px]"
            style={{
              color: "#5C7058",
              background: "rgba(92,112,88,0.18)",
              border: "1px solid rgba(92,112,88,0.35)",
              backdropFilter: "blur(14px)",
            }}>
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}

const defaultGenderStats = { total: 0, laki: 0, perempuan: 0, belum: 0 };
const defaultAttendanceStats = { total: 0, offline: 0, online: 0, tidakHadir: 0, belum: 0 };

async function getTamu(eventId?: string, sekolahId?: string) {
  try {
    const supabase = createAdminClient();
    const query = supabase
      .from("tamu")
      .select(`
        *,
        rsvp (kehadiran, jumlah),
        checkin (waktu),
        guest_activity_log (activity_type)
      `)
      .order("created_at", { ascending: false });
    if (eventId) {
      query.eq("event_id", eventId);
    } else if (sekolahId) {
      query.eq("sekolah_id", sekolahId);
    }
    const { data } = await query;
    return data || [];
  } catch (error) {
    console.error("Gagal mengambil data tamu:", error);
    return [];
  }
}

async function getGenderStats(eventId?: string, sekolahId?: string) {
  try {
    const supabase = createAdminClient();
    const query = supabase.from("tamu").select("jenis_kelamin");
    if (eventId) query.eq("event_id", eventId);
    else if (sekolahId) query.eq("sekolah_id", sekolahId);
    const { data } = await query;
    const total = data?.length || 0;
    const laki = data?.filter((t) => t.jenis_kelamin === "Laki-laki").length || 0;
    const perempuan = data?.filter((t) => t.jenis_kelamin === "Perempuan").length || 0;
    return { total, laki, perempuan, belum: total - laki - perempuan };
  } catch {
    return defaultGenderStats;
  }
}

async function getRsvpStats(eventId?: string, sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    // Get tamu IDs for the event/sekolah (rsvp doesn't have event_id)
    let tamuIds: string[] = [];
    if (eventId || sekolahId) {
      let tamuIdQuery = supabase.from("tamu").select("id");
      if (eventId) tamuIdQuery = tamuIdQuery.eq("event_id", eventId);
      else if (sekolahId) tamuIdQuery = tamuIdQuery.eq("sekolah_id", sekolahId);
      const { data: ids } = await tamuIdQuery;
      tamuIds = ids?.map((t: { id: string }) => t.id) || [];
    }

    if (tamuIds.length === 0) {
      return { total: 0, offline: 0, online: 0, tidakHadir: 0, belum: 0 };
    }

    const { data: rsvps } = await supabase
      .from("rsvp")
      .select("kehadiran_ortu, kehadiran_anak")
      .in("tamu_id", tamuIds);

    let offline = 0, online = 0, tidakHadir = 0;
    for (const r of rsvps || []) {
      if (r.kehadiran_ortu === "Offline") offline++;
      else if (r.kehadiran_ortu === "Online") online++;
      else if (r.kehadiran_ortu === "Tidak Hadir") tidakHadir++;
      if (r.kehadiran_anak === "Offline") offline++;
      else if (r.kehadiran_anak === "Online") online++;
      else if (r.kehadiran_anak === "Tidak Hadir") tidakHadir++;
    }
    const totalResponded = offline + online + tidakHadir;
    return { total: totalResponded, offline, online, tidakHadir, belum: 0 };
  } catch {
    return defaultAttendanceStats;
  }
}

export default async function TamuPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const sekolahId = user.app_metadata?.sekolah_id as string | undefined;

  let tamuList: unknown[] = [];
  let eventsList: { id: string; nama: string; slug: string; is_active: boolean | null }[] = [];
  let activeEventId: string | undefined;
  let genderStats = defaultGenderStats;
  let rsvpStats = defaultAttendanceStats;
  let totalTamu = 0;

  try {
    const adminSupabase = createAdminClient();
    if (sekolahId) {
      const { data: events } = await adminSupabase
        .from("events")
        .select("id, nama, slug, is_active")
        .eq("sekolah_id", sekolahId)
        .order("created_at", { ascending: true });
      eventsList = events || [];
      const cookieEventId = (await cookies()).get("active_event_id")?.value;
      activeEventId = cookieEventId && eventsList.some(e => e.id === cookieEventId)
        ? cookieEventId
        : eventsList.find(e => e.is_active)?.id || eventsList[0]?.id;
      tamuList = await getTamu(activeEventId, sekolahId);
      totalTamu = tamuList.length;
      genderStats = await getGenderStats(activeEventId, sekolahId);
      rsvpStats = await getRsvpStats(activeEventId, sekolahId);
    }
  } catch (error) {
    console.error("Gagal memuat data tamu:", error);
  }

  const activeEventSlug = eventsList.find(e => e.id === activeEventId)?.slug;

  return (
    <div className="min-h-screen flex relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FDF6E8 0%, #F4E6D0 25%, #F8E5D6 55%, #ECE8DC 80%, #FDF6E8 100%)",
        color: "#2A2520",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
      <div className="relative w-full p-5">
        <div className="mx-auto" style={{ maxWidth: 1200 }}>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-3"
            style={{ color: "#8a7a6a", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>

          <div className="flex items-end gap-[18px] flex-wrap mb-4">
            <div className="flex-1 min-w-[280px]">
              <div className="font-mono-label text-[9px] tracking-[0.3em]" style={{ color: "#C26A4A" }}>——— DATA TAMU</div>
              <div className="font-serif-display text-[28px] italic leading-[1.1] mt-1" style={{ color: "#2A2520" }}>
                Daftar lengkap undangan.
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/tamu/baru"
                className="inline-flex items-center gap-2 px-4 py-[10px] rounded-[12px] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #C26A4A, #8B4A2F)", color: "#F5EEE0",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em",
                  boxShadow: "0 6px 18px rgba(194,106,74,0.35)",
                }}>
                {icons.add} TAMBAH TAMU
              </Link>
              <Link href="/admin/tamu/upload"
                className="inline-flex items-center gap-2 px-4 py-[10px] rounded-[12px] cursor-pointer"
                style={{
                  background: "rgba(255, 248, 235, 0.55)", color: "#2A2520",
                  border: "1px solid rgba(255,255,255,0.55)",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.22em",
                  backdropFilter: "blur(22px)",
                }}>
                {icons.up} UPLOAD CSV
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatCard label="TOTAL TAMU" value={String(totalTamu)} accent="#C26A4A" />
            <StatCard label="SUDAH RSVP" value={String(rsvpStats.total)} accent="#5C7058" />
            <StatCard label="LAKI-LAKI" value={String(genderStats.laki)} caption={`${genderStats.total > 0 ? Math.round(genderStats.laki / genderStats.total * 100) : 0}%`} accent="#C26A4A" />
            <StatCard label="PEREMPUAN" value={String(genderStats.perempuan)} caption={`${genderStats.total > 0 ? Math.round(genderStats.perempuan / genderStats.total * 100) : 0}%`} accent="#C9A35E" />
          </div>

          <div className="rounded-[24px] overflow-hidden"
            style={{
              background: "rgba(255, 248, 235, 0.55)", backdropFilter: "blur(22px) saturate(1.1)",
              WebkitBackdropFilter: "blur(22px) saturate(1.1)",
              border: "1px solid rgba(255, 255, 255, 0.55)",
              boxShadow: "0 10px 40px rgba(58, 36, 20, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}>
            <TamuTable data={tamuList as any[]} eventSlug={activeEventSlug} />
          </div>
        </div>
      </div>
    </div>
  );
}
