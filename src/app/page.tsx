import Link from "next/link";
import { Landmark } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <BgOrbs />
      <div className="glass-card p-8 max-w-md w-full relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-[16px] bg-primary/15 flex items-center justify-center mb-4">
            <Landmark className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif-display italic text-secondary mb-2">
            Undangan Digital
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            Platform undangan digital untuk acara sekolah
          </p>
        </div>
        <div className="flex flex-col gap-3 justify-center">
          <Link
            href="/admin/login"
            className="glass-button px-6 py-3 text-white font-medium text-center"
          >
            Login Panitia
          </Link>
          <Link
            href="/undangan/demo"
            className="px-6 py-3 text-[var(--color-primary)] font-medium rounded-[14px] border border-[var(--color-primary)] text-center hover:bg-primary/5 transition-all"
          >
            Coba Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

function BgOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute w-[380px] h-[380px]"
        style={{
          top: "-5%",
          right: "-15%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(194,106,74,0.15) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute w-[350px] h-[350px]"
        style={{
          bottom: "-10%",
          left: "-20%",
          background:
            "radial-gradient(circle at 70% 70%, rgba(201,163,94,0.12) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px]"
        style={{
          top: "40%",
          left: "-10%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(143,166,139,0.1) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}
