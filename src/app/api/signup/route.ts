import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Allowed admin emails for self-registration
const ALLOWED_ADMIN_EMAILS = [
  "admin.abbs@undangan.sch.id",
  "admin.alabidin@undangan.sch.id",
  "admin.smpi@undangan.sch.id",
];

const EMAIL_TO_SCHOOL: Record<string, string> = {
  "admin.abbs@undangan.sch.id": "SMP ABBS Surakarta",
  "admin.alabidin@undangan.sch.id": "SMP I Alabidin Surakarta",
  "admin.smpi@undangan.sch.id": "SMP I Alabidin Surakarta",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, sekolah_id } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, password" },
        { status: 400 }
      );
    }

    // Only pre-approved admin emails are accepted
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // Look up sekolah_id from sekolah table if not provided
    let resolvedSekolahId: string | null = sekolah_id || null;
    if (!resolvedSekolahId) {
      const { data: sekolahData, error: sekolahError } = await supabaseAdmin
        .from("sekolah")
        .select("id")
        .eq("nama", EMAIL_TO_SCHOOL[email] || "SMP I Alabidin Surakarta")
        .single();
      resolvedSekolahId = sekolahData?.id || null;
      if (sekolahError) {
        console.warn("Sekolah lookup failed:", sekolahError.message);
      }
    }

    // Store sekolah_id in app_metadata so it appears in the JWT for RLS policies
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { sekolah_id: resolvedSekolahId || undefined },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}