import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sekolahId = user.app_metadata?.sekolah_id as string | undefined;
    if (!sekolahId) {
      return NextResponse.json(
        { error: "Admin account is not linked to a sekolah" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const allowedExts = ["png", "jpg", "jpeg", "webp"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: "File must be PNG, JPG, or WebP" },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 2MB" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const fileName = `${sekolahId}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminSupabase.storage
      .from("school-logos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const { data: publicUrl } = adminSupabase.storage
      .from("school-logos")
      .getPublicUrl(fileName);

    const logoUrl = publicUrl.publicUrl;

    await adminSupabase
      .from("sekolah")
      .update({ logo_url: logoUrl })
      .eq("id", sekolahId);

    return NextResponse.json({ logo_url: logoUrl });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}
