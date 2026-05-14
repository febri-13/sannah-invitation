import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import QRCode from "react-qr-code";
import { Landmark, Calendar, Clock, MapPin, Video, Users, CheckCircle } from "lucide-react";
import RSVPForm from "./RSVPForm";

export default async function UndanganPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
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

  const hasRsvp = tamu.rsvp && tamu.rsvp.length > 0;
  const hasCheckin = tamu.checkin && tamu.checkin.length > 0;

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-islamic-teal text-white py-12 px-4 text-center">
        <Landmark className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <p className="text-lg font-serif mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
        <h1 className="text-2xl font-bold mb-2">Akhirusannah</h1>
        <p className="text-white/80">Perpisahan Sekolah</p>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <p className="text-gray-500 text-sm mb-2">Kepada Yth.</p>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Bapak/Ibu {tamu.nama_ayah || tamu.nama_ibu || ""}
          </h2>
          <p className="text-gray-600">
            {tamu.nama_ayah && tamu.nama_ibu && `dan Ibu ${tamu.nama_ibu}`}
            {tamu.nama_ayah && !tamu.nama_ibu && "dan Ibu"}
            {!tamu.nama_ayah && tamu.nama_ibu && "dan Bapak"}
          </p>
          <p className="text-gray-600">
            bersama {tamu.jenis_kelamin === "Laki-laki" ? "Ananda" : "Anak kami"} {tamu.nama_siswa}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Detail Acara</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-islamic-teal mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Sabtu, 21 Juni 2025</p>
                <p className="text-sm text-gray-500">15 Dzulqa'dah 1446 H</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-islamic-teal mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Pukul 08.00 - 12.00 WIB</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-islamic-teal mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">MTsN 1 Kota</p>
                <p className="text-sm text-gray-500">Jl. Pendidikan No. 123</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-islamic-teal mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Live Streaming</p>
                <a href="#" className="text-sm text-islamic-teal hover:underline">
                  Link YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Susunan Acara</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>08.00 - 08.30 &nbsp; Pembukaan & Doa</p>
            <p>08.30 - 09.30 &nbsp; Laporan & Pidato</p>
            <p>09.30 - 10.30 &nbsp; Pemutaran Video Kenangan</p>
            <p>10.30 - 11.30 &nbsp; Salam & Foto Bersama</p>
            <p>11.30 - 12.00 &nbsp; Penutupan</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 text-center">QR Code Check-in</h3>
          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-gold rounded-xl">
              <QRCode value={token} size={180} />
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            Tunjukkan QR Code ini saat check-in di lokasi acara
          </p>
          {hasCheckin && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Sudah Check-in</span>
            </div>
          )}
        </div>

        <RSVPForm token={token} existingRsvp={hasRsvp ? tamu.rsvp[0] : null} />
      </div>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>© 2025 Akhirusannah. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}