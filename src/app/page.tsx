import Link from "next/link";
import { Landmark } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-4 text-center">
      <Landmark className="w-16 h-16 text-islamic-teal mb-4" />
      <h1 className="text-3xl font-bold text-leaf-green mb-2">
        Akhirusannah
      </h1>
      <p className="text-gray-600 mb-8">Undangan Digital Perpisahan Sekolah</p>
      <div className="flex gap-4">
        <Link
          href="/admin/login"
          className="px-6 py-3 bg-islamic-teal text-white rounded-lg font-medium hover:bg-leaf-green transition-colors"
        >
          Login Panitia
        </Link>
      </div>
    </div>
  );
}