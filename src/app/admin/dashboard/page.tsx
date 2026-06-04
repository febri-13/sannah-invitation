import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { KontenUndangan } from "@/lib/database.types";
import DashboardClient from "./DashboardClient";

const defaultStats = { totalTamu: 0, hadir: 0, tidakHadir: 0, totalCheckin: 0 };
const defaultGenderStats = { total: 0, laki: 0, perempuan: 0, belum: 0 };
const defaultAttendanceStats = { total: 0, offline: 0, online: 0, tidakHadir: 0, belum: 0 };
const defaultViewStats = { totalViews: 0, avgViews: 0, viewedCount: 0 };

async function getStats(eventId?: string, sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const tamuFilter = (q: ReturnType<typeof supabase.from>) =>
      eventId ? q.eq("event_id", eventId) : sekolahId ? q.eq("sekolah_id", sekolahId) : q;

    const { count: totalTamu } = await tamuFilter(
      supabase.from("tamu").select("*", { count: "exact", head: true })
    );

    // Dapatkan semua tamu_id untuk filter RSVP + checkin (hindari filter event_id langsung di rsvp)
    let tamuIds: string[] = [];
    if (eventId || sekolahId) {
      let tamuIdQuery = supabase.from("tamu").select("id");
      if (eventId) tamuIdQuery = tamuIdQuery.eq("event_id", eventId);
      else if (sekolahId) tamuIdQuery = tamuIdQuery.eq("sekolah_id", sekolahId);
      const { data: ids } = await tamuIdQuery;
      tamuIds = ids?.map((t: { id: string }) => t.id) || [];
    }

    // RSVP — filter by tamu_id (rsvp tidak punya event_id)
    let rsvpQuery = supabase.from("rsvp").select("kehadiran");
    if (tamuIds.length > 0) rsvpQuery = rsvpQuery.in("tamu_id", tamuIds);
    const { data: rsvps } = await rsvpQuery;
    const hadir = rsvps?.filter((r: { kehadiran: string }) => r.kehadiran === "Hadir").length || 0;
    const tidakHadir = rsvps?.filter((r: { kehadiran: string }) => r.kehadiran === "Tidak Hadir").length || 0;

    // Checkin
    const checkinQuery = supabase.from("checkin").select("*", { count: "exact", head: true });
    if (tamuIds.length > 0) {
      checkinQuery.in("tamu_id", tamuIds);
    } else if (eventId || sekolahId) {
      return { totalTamu: totalTamu || 0, hadir, tidakHadir, totalCheckin: 0 };
    }
    const { count: totalCheckin } = await checkinQuery;

    return { totalTamu: totalTamu || 0, hadir, tidakHadir, totalCheckin: totalCheckin || 0 };
  } catch (error) {
    console.error("Gagal mengambil statistik:", error);
    return defaultStats;
  }
}

async function getGenderStats(eventId?: string, sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const query = supabase.from("tamu").select("jenis_kelamin");
    if (eventId) {
      query.eq("event_id", eventId);
    } else if (sekolahId) {
      query.eq("sekolah_id", sekolahId);
    }
    const { data } = await query;

    const total = data?.length || 0;
    const laki = data?.filter((t: { jenis_kelamin: string | null }) => t.jenis_kelamin === "Laki-laki").length || 0;
    const perempuan = data?.filter((t: { jenis_kelamin: string | null }) => t.jenis_kelamin === "Perempuan").length || 0;
    const belum = total - laki - perempuan;

    return { total, laki, perempuan, belum };
  } catch (error) {
    console.error("Gagal mengambil statistik gender:", error);
    return defaultGenderStats;
  }
}

async function getAttendanceStats(eventId?: string, sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const tamuQuery = supabase.from("tamu").select("*", { count: "exact", head: true });
    if (eventId) {
      tamuQuery.eq("event_id", eventId);
    } else if (sekolahId) {
      tamuQuery.eq("sekolah_id", sekolahId);
    }
    const { count: totalTamu } = await tamuQuery;

    // Dapatkan tamu_id untuk filter RSVP (hindari filter event_id langsung)
    let tamuIds: string[] = [];
    if (eventId || sekolahId) {
      let tamuIdQuery = supabase.from("tamu").select("id");
      if (eventId) tamuIdQuery = tamuIdQuery.eq("event_id", eventId);
      else if (sekolahId) tamuIdQuery = tamuIdQuery.eq("sekolah_id", sekolahId);
      const { data: ids } = await tamuIdQuery;
      tamuIds = ids?.map((t: { id: string }) => t.id) || [];
    }

    let rsvpQuery = supabase.from("rsvp").select("kehadiran_ortu, kehadiran_anak, jumlah_ortu");
    if (tamuIds.length > 0) rsvpQuery = rsvpQuery.in("tamu_id", tamuIds);
    const { data: rsvps } = await rsvpQuery;

    let offline = 0, online = 0, tidakHadir = 0;

    for (const r of rsvps || []) {
      if (r.kehadiran_ortu === "Offline") offline += (r.jumlah_ortu || 1);
      else if (r.kehadiran_ortu === "Online") online++;
      else if (r.kehadiran_ortu === "Tidak Hadir") tidakHadir++;

      if (r.kehadiran_anak === "Offline") offline++;
      else if (r.kehadiran_anak === "Online") online++;
      else if (r.kehadiran_anak === "Tidak Hadir") tidakHadir++;
    }

    const totalResponded = offline + online + tidakHadir;
    const belum = (totalTamu || 0) - (rsvps?.length || 0) + (rsvps?.filter((r: { kehadiran_ortu: string | null; kehadiran_anak: string | null }) => !r.kehadiran_ortu && !r.kehadiran_anak).length || 0);
    const total = totalResponded + belum;

    return { total, offline, online, tidakHadir, belum };
  } catch (error) {
    console.error("Gagal mengambil statistik kehadiran:", error);
    return defaultAttendanceStats;
  }
}

interface AttendanceSplit {
  ortu: { offline: number; online: number; tidakHadir: number };
  anak: { offline: number; online: number; tidakHadir: number };
}

async function getAttendanceSplitStats(eventId?: string, sekolahId?: string): Promise<AttendanceSplit> {
  const empty = { ortu: { offline: 0, online: 0, tidakHadir: 0 }, anak: { offline: 0, online: 0, tidakHadir: 0 } };
  try {
    const supabase = createAdminClient();

    // Get tamu IDs
    let tamuIds: string[] = [];
    if (eventId || sekolahId) {
      let q = supabase.from("tamu").select("id");
      if (eventId) q = q.eq("event_id", eventId);
      else if (sekolahId) q = q.eq("sekolah_id", sekolahId);
      const { data: ids } = await q;
      tamuIds = ids?.map((t: { id: string }) => t.id) || [];
    }

    if (tamuIds.length === 0) return empty;

    const { data: rsvps } = await supabase
      .from("rsvp")
      .select("kehadiran_ortu, kehadiran_anak, jumlah_ortu")
      .in("tamu_id", tamuIds);

    const split: AttendanceSplit = {
      ortu: { offline: 0, online: 0, tidakHadir: 0 },
      anak: { offline: 0, online: 0, tidakHadir: 0 },
    };

    for (const r of rsvps || []) {
      if (r.kehadiran_ortu === "Offline") split.ortu.offline += (r.jumlah_ortu || 1);
      else if (r.kehadiran_ortu === "Online") split.ortu.online++;
      else if (r.kehadiran_ortu === "Tidak Hadir") split.ortu.tidakHadir++;

      if (r.kehadiran_anak === "Offline") split.anak.offline++;
      else if (r.kehadiran_anak === "Online") split.anak.online++;
      else if (r.kehadiran_anak === "Tidak Hadir") split.anak.tidakHadir++;
    }

    return split;
  } catch (error) {
    console.error("Gagal mengambil split statistik:", error);
    return empty;
  }
}

async function getViewStats(eventId?: string) {
  try {
    const supabase = createAdminClient();
    if (!eventId) return defaultViewStats;

    const { data: tamuIds } = await supabase
      .from("tamu")
      .select("id")
      .eq("event_id", eventId);

    if (!tamuIds || tamuIds.length === 0) return defaultViewStats;

    const ids = tamuIds.map(t => t.id);

    const { data: memories } = await supabase
      .from("guest_memories")
      .select("value")
      .eq("key", "invitation_view_count")
      .in("tamu_id", ids);

    if (!memories || memories.length === 0) return defaultViewStats;

    let totalViews = 0;
    for (const m of memories) {
      const v = m.value as { count?: number };
      totalViews += v.count || 0;
    }

    return {
      totalViews,
      avgViews: Math.round(totalViews / tamuIds.length),
      viewedCount: memories.length,
    };
  } catch (error) {
    console.error("Gagal mengambil statistik view:", error);
    return defaultViewStats;
  }
}

async function getAdminMemory(adminId: string, sekolahId: string, key: string) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("admin_memories")
      .select("value")
      .eq("admin_id", adminId)
      .eq("sekolah_id", sekolahId)
      .eq("key", key)
      .maybeSingle();
    return data?.value as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

async function getTamu(eventId?: string, sekolahId?: string) {
  try {
    const supabase = createAdminClient();

    const query = supabase
      .from("tamu")
      .select(`
        *,
        rsvp (kehadiran, kehadiran_ortu, kehadiran_anak, jumlah, jumlah_ortu),
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const sekolahId = user.app_metadata?.sekolah_id as string | undefined;

  let stats = defaultStats;
  let genderStats = defaultGenderStats;
  let attendanceStats = defaultAttendanceStats;
  let attendanceSplit: AttendanceSplit = { ortu: { offline: 0, online: 0, tidakHadir: 0 }, anak: { offline: 0, online: 0, tidakHadir: 0 } };
  let viewStats = defaultViewStats;
  let tamuList: Awaited<ReturnType<typeof getTamu>> = [];
  let sekolahNama = "Sekolah";
  let konten: KontenUndangan | null = null;
  let eventsList: { id: string; nama: string; slug: string; is_active: boolean | null }[] = [];
  let activeEventId: string | undefined;
  let initialTab: string | undefined;

  try {
    const adminSupabase = createAdminClient();

    if (sekolahId) {
      const { data: sekolah } = await adminSupabase
        .from("sekolah")
        .select("nama")
        .eq("id", sekolahId)
        .single();
      if (sekolah) sekolahNama = sekolah.nama;

      const { data: events } = await adminSupabase
        .from("events")
        .select("id, nama, slug, is_active")
        .eq("sekolah_id", sekolahId)
        .order("created_at", { ascending: true });
      eventsList = events || [];

      const cookieStore = await cookies();
      const cookieEventId = cookieStore.get("active_event_id")?.value;
      activeEventId = cookieEventId && eventsList.some(e => e.id === cookieEventId)
        ? cookieEventId
        : eventsList.find(e => e.is_active)?.id || eventsList[0]?.id;

      if (activeEventId) {
        const { data: kontenData } = await adminSupabase
          .from("konten_undangan")
          .select("*")
          .eq("event_id", activeEventId)
          .single();
        if (kontenData) konten = kontenData;
      }

      stats = await getStats(activeEventId, sekolahId);
      genderStats = await getGenderStats(activeEventId, sekolahId);
      attendanceStats = await getAttendanceStats(activeEventId, sekolahId);
      attendanceSplit = await getAttendanceSplitStats(activeEventId, sekolahId);
      viewStats = await getViewStats(activeEventId);
      tamuList = await getTamu(activeEventId, sekolahId);

      if (user && sekolahId) {
        const tabMemory = await getAdminMemory(user.id, sekolahId, "dashboard_tamu_tab");
        initialTab = tabMemory?.tab as string | undefined;
      }
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
      viewStats={viewStats}
      genderStats={genderStats}
      attendanceStats={attendanceStats}
      attendanceSplit={attendanceSplit}
      tamuList={tamuList}
      sekolahNama={sekolahNama}
      konten={konten}
      eventsList={eventsList}
      activeEventId={activeEventId}
      initialTab={initialTab}
    />
  );
}
