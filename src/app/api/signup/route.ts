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
  "admin.alabidin@undangan.sch.id": "SMPI Alabidin Surakarta",
  "admin.smpi@undangan.sch.id": "SMPI Alabidin Surakarta",
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

    // Password strength: min 8 characters
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Only pre-approved admin emails are accepted
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // Look up sekolah_id from sekolah table if not provided
    let resolvedSekolahId: string | null = null;
    if (sekolah_id) {
      // Validate provided sekolah_id exists
      const { data: existing } = await supabaseAdmin
        .from("sekolah")
        .select("id")
        .eq("id", sekolah_id)
        .maybeSingle();
      resolvedSekolahId = existing?.id || null;
    }

    if (!resolvedSekolahId) {
      const { data: sekolahData, error: sekolahError } = await supabaseAdmin
        .from("sekolah")
        .select("id")
        .eq("nama", EMAIL_TO_SCHOOL[email] || "SMPI Alabidin Surakarta")
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

    // Don't expose full user object — return minimal response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
