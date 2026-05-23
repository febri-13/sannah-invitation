import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
    const allowedExts = ["mp3", "wav", "ogg", "aac", "flac", "m4a"];
    const allowedMimes = [
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
      "audio/aac", "audio/flac", "audio/x-m4a", "audio/m4a",
    ];
    if (!allowedExts.includes(ext) || !allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be MP3, WAV, OGG, AAC, FLAC, or M4A" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data: konten } = await adminSupabase
      .from("konten_undangan")
      .select("music_url")
      .eq("sekolah_id", sekolahId)
      .maybeSingle();

    const oldMusicUrl = konten?.music_url;
    if (oldMusicUrl) {
      const bucketPath = oldMusicUrl.split("/school-music/")[1];
      if (bucketPath) {
        const decodedPath = decodeURIComponent(bucketPath);
        const { data: existingFiles } = await adminSupabase.storage
          .from("school-music")
          .list("", { search: decodedPath });
        if (existingFiles && existingFiles.length > 0) {
          await adminSupabase.storage
            .from("school-music")
            .remove([decodedPath]);
        }
      }
    }

    const fileName = `${sekolahId}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminSupabase.storage
      .from("school-music")
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
      .from("school-music")
      .getPublicUrl(fileName);

    const musicUrl = publicUrl.publicUrl;

    await adminSupabase
      .from("konten_undangan")
      .update({ music_url: musicUrl })
      .eq("sekolah_id", sekolahId);

    return NextResponse.json({ music_url: musicUrl });
  } catch (error) {
    console.error("Error uploading music:", error);
    return NextResponse.json(
      { error: "Failed to upload music" },
      { status: 500 }
    );
  }
}
