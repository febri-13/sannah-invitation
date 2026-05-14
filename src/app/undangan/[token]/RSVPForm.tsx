"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Users } from "lucide-react";

interface RSVPFormProps {
  token: string;
  existingRsvp: {
    kehadiran: string;
    jumlah: number;
    pesan: string | null;
  } | null;
}

export default function RSVPForm({ token, existingRsvp }: RSVPFormProps) {
  const [kehadiran, setKehadiran] = useState(
    existingRsvp?.kehadiran || ""
  );
  const [jumlah, setJumlah] = useState(existingRsvp?.jumlah || 1);
  const [pesan, setPesan] = useState(existingRsvp?.pesan || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kehadiran) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          kehadiran,
          jumlah,
          pesan: pesan || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Terjadi kesalahan");
      }
    } catch {
      setError("Gagal terhubung ke server");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Jazakumullah khair
          </h3>
          <p className="text-gray-600">
            Konfirmasi Anda telah diterima. Kami tunggu kehadiran Anda.
          </p>
        </div>
      </div>
    );
  }

  if (existingRsvp && !success) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h3 className="font-bold text-gray-800">Konfirmasi Kehadiran Anda</h3>
          <p className="text-sm text-gray-500">
            Anda sudah pernah mengisi form ini
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span className="font-medium text-green-700">
              {existingRsvp.kehadiran}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Jumlah: <span className="font-medium">{existingRsvp.jumlah} orang</span>
          </p>
          {existingRsvp.pesan && (
            <p className="text-sm text-gray-600">
              Pesan: <span className="italic">{existingRsvp.pesan}</span>
            </p>
          )}
        </div>
        <p className="text-center text-gray-500 text-sm">
          Terima kasih sudah mengisi konfirmasi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold text-gray-800 mb-4">Konfirmasi Kehadiran</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apakah Anda akan menghadiri acara?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setKehadiran("Hadir")}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                kehadiran === "Hadir"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Hadir
            </button>
            <button
              type="button"
              onClick={() => setKehadiran("Tidak Hadir")}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                kehadiran === "Tidak Hadir"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tidak Hadir
            </button>
          </div>
        </div>

        {kehadiran === "Hadir" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah orang yang hadir
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setJumlah(Math.max(1, jumlah - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 font-bold text-gray-600"
              >
                -
              </button>
              <span className="text-xl font-bold w-8 text-center">{jumlah}</span>
              <button
                type="button"
                onClick={() => setJumlah(Math.min(10, jumlah + 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 font-bold text-gray-600"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pesan/Doa (opsional)
          </label>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-teal focus:border-transparent outline-none resize-none"
            rows={3}
            placeholder="Tulis pesan atau doa untuk siswa..."
            maxLength={200}
          />
          <p className="text-xs text-gray-400 mt-1">{ pesan.length}/200</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !kehadiran}
          className="w-full py-3 bg-islamic-teal text-white rounded-lg font-medium hover:bg-leaf-green transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Kirim Konfirmasi
            </>
          )}
        </button>
      </form>
    </div>
  );
}