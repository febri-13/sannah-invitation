"use client";

import { Users } from "lucide-react";

interface GenderPieChartProps {
  total: number;
  laki: number;
  perempuan: number;
  belum: number;
}

const SEGMENTS = [
  { key: "laki", label: "Laki-laki", color: "#3B82F6" },
  { key: "perempuan", label: "Perempuan", color: "#EC4899" },
  { key: "belum", label: "Belum diisi", color: "#D1D5DB" },
] as const;

export default function GenderPieChart({
  total,
  laki,
  perempuan,
  belum,
}: GenderPieChartProps) {
  // Guard zero total before any math
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="pie-base pie-donut flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-300">-</span>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Distribusi Jenis Kelamin
        </p>
        <p className="text-xs text-gray-400">Belum ada data</p>
      </div>
    );
  }

  // Percentages — use fractional degrees so tiny values stay visible
  const pct = {
    laki: (laki / total) * 360,
    perempuan: (perempuan / total) * 360,
    belum: (belum / total) * 360,
  };

  // Cumulative stops
  let running = 0;
  const stops = SEGMENTS.map((s) => {
    const start = running;
    running += pct[s.key];
    return { ...s, start, end: running };
  });

  // Build conic-gradient string
  const gradient = stops
    .map(({ color, start, end }) => `${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`)
    .join(", ");

  // Build inline CSS variables for each segment
  const pieStyle: React.CSSProperties = {
    "--s1": stops[0]!.color,
    "--s2": stops[1]!.color,
    "--s3": stops[2]!.color,
    "--d1": `${pct.laki}deg`,
    "--d2": `${pct.laki + pct.perempuan}deg`,
    background: `conic-gradient(${gradient})`,
  } as React.CSSProperties;

  const counts = { laki, perempuan, belum } as const;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="pie-base pie-donut" style={pieStyle}>
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{total}</span>
          <span className="text-xs text-gray-500">total</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 font-medium">
        Distribusi Jenis Kelamin
      </p>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
        {stops.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-gray-600">
              {seg.label}
            </span>
            <span className="text-gray-800 font-semibold">
              ({counts[seg.key as keyof typeof counts]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
