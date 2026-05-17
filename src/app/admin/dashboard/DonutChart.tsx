"use client";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface CircleData {
  dash: number;
  offset: number;
  color: string;
}

function computeSegments(segments: DonutSegment[], total: number, circ: number): CircleData[] {
  let running = 0;
  return segments.map((s) => {
    const frac = s.value / total;
    const offset = -circ * running;
    const dash = Math.max(circ * frac - 2, 0);
    running += frac;
    return { dash, offset, color: s.color };
  });
}

export default function DonutChart({ segments, size = 186, thickness = 26 }: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - thickness / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(42,37,32,0.08)" strokeWidth={thickness} />
        <text x={c} y={c - 6} textAnchor="middle"
          style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 500, fontSize: 34, fill: "var(--ink-55)" }}>-</text>
        <text x={c} y={c + 18} textAnchor="middle"
          style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.22em", fontSize: 9, fill: "var(--ink-55)" }}>TOTAL</text>
      </svg>
    );
  }

  const circleData = computeSegments(segments, total, circ);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(42,37,32,0.08)" strokeWidth={thickness} />
      {circleData.map((s, i) => (
        <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${s.dash} ${circ - s.dash}`} strokeDashoffset={s.offset}
          transform={`rotate(-90 ${c} ${c})`} strokeLinecap="round" />
      ))}
      <text x={c} y={c - 6} textAnchor="middle"
        style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 500, fontSize: 36, fill: "var(--ink)" }}>
        {total}
      </text>
      <text x={c} y={c + 18} textAnchor="middle"
        style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.22em", fontSize: 9, fill: "var(--ink-55)" }}>
        TOTAL
      </text>
    </svg>
  );
}
