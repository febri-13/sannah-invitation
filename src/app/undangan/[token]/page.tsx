import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import InvitationClient from "./InvitationClient";

export default async function UndanganPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  try {
    const { token } = await params;

    const supabase = createAdminClient();
    const { data: tamu, error } = await supabase
      .from("tamu")
      .select("*, rsvp(*), checkin(*)")
      .eq("token", token)
      .single();

    if (error || !tamu) {
      notFound();
    }

    return <InvitationClient tamu={tamu} token={token} />;
  } catch (error) {
    console.error("Gagal memuat undangan:", error);
    notFound();
  }
}
