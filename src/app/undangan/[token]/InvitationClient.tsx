'use client';

import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import {
  Landmark,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  Mail,
  FileText,
  BookOpen,
  Mic,
  Camera,
  Star,
} from "lucide-react";
import Divider from "@/components/ornaments/Divider";
import CornerAccent from "@/components/ornaments/CornerAccent";
import HeaderArch from "@/components/ornaments/HeaderArch";
import RSVPForm from "./RSVPForm";

interface TamuRsvp {
  id: string;
  kehadiran: string;
  jumlah: number;
  kehadiran_ortu: string | null;
  kehadiran_anak: string | null;
  pesan: string | null;
  created_at: string;
}

interface TamuCheckin {
  id: string;
  checkin_at: string;
}

interface Tamu {
  id: string;
  nama_ayah: string | null;
  nama_ibu: string | null;
  nama_siswa: string;
  jenis_kelamin: string;
  token: string;
  rsvp: TamuRsvp[];
  checkin: TamuCheckin[];
}

interface InvitationClientProps {
  tamu: Tamu;
  token: string;
}

export default function InvitationClient({ tamu, token }: InvitationClientProps) {
  const hasRsvp = tamu.rsvp && tamu.rsvp.length > 0;
  const hasCheckin = tamu.checkin && tamu.checkin.length > 0;
  const latestRsvp = hasRsvp ? tamu.rsvp[0]! : null;
  const isLegacyRsvp = latestRsvp ? !latestRsvp.kehadiran_ortu : false;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as const;

  const qrVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  } as const;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Header */}
      <div className="relative bg-islamic-teal text-white py-16 px-4 text-center overflow-hidden">
        {/* Arch decoration */}
        <HeaderArch />
        {/* Crescent/star corner hints could go here - skipping to keep minimal */}

        {/* Animated Bismillah */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Landmark className="w-14 h-14 mx-auto mb-4 text-gold opacity-90" />
          <p className="text-2xl font-serif mb-3 text-gold drop-shadow-md">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </p>
        </motion.div>

        <motion.h1
          className="text-3xl font-bold mb-2 text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Akhirusannah
        </motion.h1>

        <motion.p
          className="text-white/90 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Perpisahan Sekolah
        </motion.p>

        {/* Decorative gold bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
      </div>

      {/* Main Content */}
      <motion.div
        className="max-w-md mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* QR Code Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border-2 border-gold ring-2 ring-islamic-teal ring-offset-2 p-6 mb-6 relative overflow-hidden"
          variants={qrVariants}
        >
          {/* Corner ornaments */}
          <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
            <CornerAccent />
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none transform rotate-90">
            <CornerAccent />
          </div>
          <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none transform -scale-x-100">
            <CornerAccent />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none transform -scale-x-100 -rotate-90">
            <CornerAccent />
          </div>

          <h3 className="font-bold text-gray-800 mb-4 text-center">
            QR Code Check-in
          </h3>
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-cream to-white rounded-xl border border-gold/30">
              <QRCode value={token} size={180} />
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-islamic-teal" />
            Tunjukkan QR Code ini saat check-in di lokasi acara
          </p>
          {hasCheckin && (
            <motion.div
              className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-center gap-2 text-green-700 border border-green-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Sudah Check-in</span>
            </motion.div>
          )}
        </motion.div>

        {/* Guest Greeting Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 relative border border-gold/20 hover:shadow-[0_20px_60px_-15px_rgba(212,175,55,0.2)] transition-all duration-300"
          variants={itemVariants}
        >
          {/* Top gold border accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/80 via-transparent to-gold/80 rounded-t-2xl" />

          <div className="flex items-start gap-3 mb-2">
            <Mail className="w-5 h-5 text-gold mt-1 shrink-0" />
            <p className="text-gray-500 text-sm">Kepada Yth.</p>
          </div>
          <h2 className="text-xl font-bold text-charcoal mb-1 pb-2 border-b-2 border-gold/30">
            Bapak/Ibu {tamu.nama_ayah || tamu.nama_ibu || ""}
          </h2>
          <p className="text-gray-600">
            {tamu.nama_ayah && tamu.nama_ibu && `dan Ibu ${tamu.nama_ibu}`}
            {tamu.nama_ayah && !tamu.nama_ibu && "dan Ibu"}
            {!tamu.nama_ayah && tamu.nama_ibu && "dan Bapak"}
          </p>
          <p className="text-gray-600 mt-1">
            bersama{" "}
            <span className="text-islamic-teal font-medium italic">
              {tamu.jenis_kelamin === "Laki-laki" ? "Ananda" : "Anak kami"}{" "}
              {tamu.nama_siswa}
            </span>
          </p>
        </motion.div>

        {/* Event Details Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gold/20"
          variants={itemVariants}
        >
          <Divider />
          <h3 className="font-bold text-gray-800 mb-4">Detail Acara</h3>

          {/* Vertical timeline */}
          <div className="relative border-l-2 border-double border-gold/40 ml-1.5 pl-6 space-y-6">
            {/* Date */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-islamic-teal border-2 border-gold flex items-center justify-center">
                <Calendar className="w-3 h-3 text-white" />
              </span>
              <div>
                <p className="font-medium text-gray-800">Sabtu, 21 Juni 2025</p>
                <p className="text-sm font-amiri text-gold-dark mt-0.5">
                  15 Dzulqa'dah 1446 H
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-islamic-teal border-2 border-gold flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  Pukul 08.00 - 12.00 WIB
                </p>
              </div>
            </div>

            {/* Venue */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-islamic-teal border-2 border-gold flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </span>
              <div>
                <p className="font-medium text-gray-800">MTsN 1 Kota</p>
                <p className="text-sm text-gray-500">Jl. Pendidikan No. 123</p>
              </div>
            </div>

            {/* Live Streaming */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-islamic-teal border-2 border-gold flex items-center justify-center">
                <Video className="w-3 h-3 text-white" />
              </span>
              <div>
                <p className="font-medium text-gray-800">Live Streaming</p>
                <a
                  href="#"
                  className="text-sm text-islamic-teal hover:underline font-medium"
                >
                  Link YouTube
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Agenda Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gold/20"
          variants={itemVariants}
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-gold">📋</span> Susunan Acara
          </h3>

          <div className="relative border-l-2 border-gold/60 ml-3 pl-6 space-y-5">
            {/* 08.00 - 08.30 */}
            <div className="group relative">
              {/* Timeline circle */}
              <span className="absolute -left-[21px] top-1 w-5 h-5 rounded-full bg-islamic-teal text-white text-xs font-bold flex items-center justify-center ring-2 ring-gold/60">
                08
              </span>
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-gold mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    08.00 - 08.30
                  </p>
                  <p className="text-gray-600">Pembukaan & Doa</p>
                </div>
              </div>
            </div>

            {/* 08.30 - 09.30 */}
            <div className="group relative">
              <span className="absolute -left-[21px] top-1 w-5 h-5 rounded-full bg-islamic-teal text-white text-xs font-bold flex items-center justify-center ring-2 ring-gold/60">
                08
              </span>
              <div className="flex items-start gap-2">
                <Mic className="w-4 h-4 text-gold mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    08.30 - 09.30
                  </p>
                  <p className="text-gray-600">Laporan & Pidato</p>
                </div>
              </div>
            </div>

            {/* 09.30 - 10.30 */}
            <div className="group relative">
              <span className="absolute -left-[21px] top-1 w-5 h-5 rounded-full bg-islamic-teal text-white text-xs font-bold flex items-center justify-center ring-2 ring-gold/60">
                09
              </span>
              <div className="flex items-start gap-2">
                <Video className="w-4 h-4 text-gold mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    09.30 - 10.30
                  </p>
                  <p className="text-gray-600">Pemutaran Video Kenangan</p>
                </div>
              </div>
            </div>

            {/* 10.30 - 11.30 */}
            <div className="group relative">
              <span className="absolute -left-[21px] top-1 w-5 h-5 rounded-full bg-islamic-teal text-white text-xs font-bold flex items-center justify-center ring-2 ring-gold/60">
                10
              </span>
              <div className="flex items-start gap-2">
                <Camera className="w-4 h-4 text-gold mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    10.30 - 11.30
                  </p>
                  <p className="text-gray-600">Salam & Foto Bersama</p>
                </div>
              </div>
            </div>

            {/* 11.30 - 12.00 */}
            <div className="group relative">
              <span className="absolute -left-[21px] top-1 w-5 h-5 rounded-full bg-islamic-teal text-white text-xs font-bold flex items-center justify-center ring-2 ring-gold/60">
                11
              </span>
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-gold mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    11.30 - 12.00
                  </p>
                  <p className="text-gray-600">Penutupan</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RSVP Form */}
        <motion.div variants={itemVariants}>
          <RSVPForm
            token={token}
            existingRsvp={isLegacyRsvp ? null : latestRsvp}
            legacyRsvp={isLegacyRsvp ? latestRsvp : null}
          />
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t-2 border-gold/30 mt-12">
        <div className="flex items-center justify-center gap-2">
          <span className="font-amiri text-lg">© ٢٠٢٥</span>
          <span className="text-gold text-lg">✦</span>
          <span>Akhirusannah. Semua hak dilindungi.</span>
        </div>
      </footer>
    </div>
  );
}
