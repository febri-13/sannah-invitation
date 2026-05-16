import Link from "next/link";
import { Landmark } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="glass-card p-8 max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Landmark className="w-16 h-16 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Akhirusannah
          </h1>
          <p className="text-gray-600 mb-8">Undangan Digital Perpisahan Sekolah</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin/login"
            className="glass-button px-6 py-3 text-white font-medium"
          >
            Login Panitia
          </Link>
        </div>
      </div>
    </div>
  );
}