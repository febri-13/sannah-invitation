import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { tamuUpdateSchema } from "@/lib/schemas";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("sekolah_id")
      .eq("id", id)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Tamu tidak ditemukan" }, { status: 404 });
    }

    if (sekolahId && tamu.sekolah_id !== sekolahId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = tamuUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const v = validation.data;

    const { data: updated, error } = await supabaseAdmin
      .from("tamu")
      .update({
        ...(v.nama_siswa !== undefined && { nama_siswa: v.nama_siswa }),
        ...(v.jenis_kelamin !== undefined && { jenis_kelamin: v.jenis_kelamin }),
        ...(v.kelas !== undefined && { kelas: v.kelas }),
        ...(v.nama_ayah !== undefined && { nama_ayah: v.nama_ayah }),
        ...(v.nama_ibu !== undefined && { nama_ibu: v.nama_ibu }),
        ...(v.no_wa_ayah !== undefined && { no_wa_ayah: v.no_wa_ayah }),
        ...(v.no_wa_ibu !== undefined && { no_wa_ibu: v.no_wa_ibu }),
      } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    // Verify the tamu belongs to this admin's sekolah before deleting
    const { data: tamu, error: tamuError } = await supabaseAdmin
      .from("tamu")
      .select("sekolah_id, event_id")
      .eq("id", id)
      .single();

    if (tamuError || !tamu) {
      return NextResponse.json({ error: "Tamu tidak ditemukan" }, { status: 404 });
    }

    if (sekolahId && tamu.sekolah_id !== sekolahId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from("tamu")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}