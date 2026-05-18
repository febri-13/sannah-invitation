import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { KontenUndangan } from "@/lib/database.types";
import DashboardClient from "./DashboardClient";

const defaultStats = { totalTamu: 0, hadir: 0, tidakHadir: 0, totalCheckin: 0 };
const defaultGenderStats = { total: 0, laki: 0, perempuan: 0, belum: 0 };
const defaultAttendanceStats = { total: 0, offline: 0, online: 0, tidakHadir: 0, belum: 0 };

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

async function getAttendanceStats(sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const tamuQuery = supabase
      .from("tamu")
      .select("*", { count: "exact", head: true });
    if (sekolahId) tamuQuery.eq("sekolah_id", sekolahId);
    const { count: totalTamu } = await tamuQuery;

    const rsvpQuery = supabase
      .from("rsvp")
      .select("kehadiran_ortu, kehadiran_anak");
    if (sekolahId) rsvpQuery.eq("sekolah_id", sekolahId);
    const { data: rsvps } = await rsvpQuery;

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
    const belum = (totalTamu || 0) - (rsvps?.length || 0) + (rsvps?.filter(r => !r.kehadiran_ortu && !r.kehadiran_anak).length || 0);
    const total = totalResponded + belum;

    return { total, offline, online, tidakHadir, belum };
  } catch (error) {
    console.error("Gagal mengambil statistik kehadiran:", error);
    return defaultAttendanceStats;
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
  let attendanceStats = defaultAttendanceStats;
  let tamuList: Awaited<ReturnType<typeof getTamu>> = [];
  let sekolahNama = "Sekolah";
  let konten: KontenUndangan | null = null;

  try {
    stats = await getStats(sekolahId);
    genderStats = await getGenderStats(sekolahId);
    attendanceStats = await getAttendanceStats(sekolahId);
    tamuList = await getTamu(sekolahId);

    if (sekolahId) {
      const { data: sekolah } = await createAdminClient()
        .from("sekolah")
        .select("nama")
        .eq("id", sekolahId)
        .single();
      if (sekolah) sekolahNama = sekolah.nama;

      const { data: kontenData } = await createAdminClient()
        .from("konten_undangan")
        .select("*")
        .eq("sekolah_id", sekolahId)
        .single();
      if (kontenData) konten = kontenData;
    }
  } catch (error) {
    console.error("Gagal memuat dashboard:", error);
  }

  return (
    <DashboardClient
      totalTamu={stats.totalTamu}
      hadir={stats.hadir}
      tidakHadir={stats.tidakHadir}
      totalCheckin={stats.totalCheckin}
      genderStats={genderStats}
      attendanceStats={attendanceStats}
      tamuList={tamuList}
      sekolahNama={sekolahNama}
      konten={konten}
    />
  );
}
