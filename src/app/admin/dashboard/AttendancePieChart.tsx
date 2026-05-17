"use client";

import { CheckCircle } from "lucide-react";

interface AttendancePieChartProps {
  total: number;
  offline: number;
  online: number;
  tidakHadir: number;
  belum: number;
}

const SEGMENTS = [
  { key: "offline", label: "Offline", color: "#07CA6B" },
  { key: "online", label: "Online", color: "#1856FF" },
  { key: "tidakHadir", label: "Tidak Hadir", color: "#EA2143" },
  { key: "belum", label: "Belum RSVP", color: "#D1D5DB" },
] as const;

export default function AttendancePieChart({
  total,
  offline,
  online,
  tidakHadir,
  belum,
}: AttendancePieChartProps) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="pie-base pie-donut flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-300">-</span>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Distribusi Kehadiran
        </p>
        <p className="text-xs text-gray-400">Belum ada data</p>
      </div>
    );
  }

  const pct = {
    offline: (offline / total) * 360,
    online: (online / total) * 360,
    tidakHadir: (tidakHadir / total) * 360,
    belum: (belum / total) * 360,
  };

  let running = 0;
  const stops = SEGMENTS.map((s) => {
    const start = running;
    running += pct[s.key];
    return { ...s, start, end: running };
  });

  const gradient = stops
    .map(({ color, start, end }) => `${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`)
    .join(", ");

  const pieStyle: React.CSSProperties = {
    background: `conic-gradient(${gradient})`,
  } as React.CSSProperties;

  const counts = { offline, online, tidakHadir, belum } as const;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="pie-base pie-donut" style={pieStyle}>
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{total}</span>
          <span className="text-xs text-gray-500">total</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 font-medium">
        Distribusi Kehadiran
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
