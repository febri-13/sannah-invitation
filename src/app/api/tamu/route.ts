import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tamuInputSchema } from "@/lib/schemas";
import { generateToken } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: tamu, error } = await supabaseAdmin
      .from("tamu")
      .select(`
        *,
        rsvp (kehadiran, jumlah),
        checkin (waktu)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(tamu);
  } catch (error) {
    console.error("Error fetching tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = tamuInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { nama_siswa, jenis_kelamin, nama_ayah, nama_ibu, no_wa_ayah, no_wa_ibu } = validation.data;
    const token = generateToken();

    const supabaseAdmin = createAdminClient();
    const { data: tamu, error } = await supabaseAdmin
      .from("tamu")
      .insert({ 
        token, 
        nama_siswa,
        nama_ayah: nama_ayah || null,
        nama_ibu: nama_ibu || null,
        no_wa_ayah: no_wa_ayah || null,
        no_wa_ibu: no_wa_ibu || null,
        jenis_kelamin
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(tamu, { status: 201 });
  } catch (error) {
    console.error("Error creating tamu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}