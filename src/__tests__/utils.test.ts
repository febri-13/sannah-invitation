import { describe, it, expect } from "vitest";

// Copy the utility functions to test them in isolation
function generateToken(): string {
  // Use dynamic import for crypto in Node
  const crypto = require("crypto");
  return crypto.randomBytes(8).toString("hex");
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseDateTimeToISO(dateStr: string, waktuStr: string): string {
  const months: Record<string, string> = {
    januari: "01", februari: "02", maret: "03", april: "04",
    mei: "05", juni: "06", juli: "07", agustus: "08",
    september: "09", oktober: "10", november: "11", desember: "12",
  };

  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let y: string, m: string, d: string;
  if (isoMatch) {
    [, y, m, d] = isoMatch;
  } else {
    const parts = dateStr.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const dayPart = parts.find((p) => /^\d{1,2}$/.test(p));
    const monthPart = parts.find((p) => months[p]);
    if (!dayPart || !monthPart) return "";
    d = dayPart.padStart(2, "0");
    m = months[monthPart]!;
    y = parts.find((p) => /^\d{4}$/.test(p)) || String(new Date().getFullYear());
  }

  let hh = "08", mm = "00";
  const timeMatch =
    waktuStr.match(/Pukul\s+(\d{1,2})[.:](\d{2})/i) ||
    waktuStr.match(/(\d{1,2})[.:](\d{2})/);
  if (timeMatch) {
    hh = timeMatch[1]!.padStart(2, "0");
    mm = timeMatch[2]!;
  }

  return `${y}-${m}-${d}T${hh}:${mm}:00`;
}

describe("generateToken", () => {
  it("menghasilkan token 16 karakter hex", () => {
    const token = generateToken();
    expect(token).toHaveLength(16);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it("menghasilkan token unik setiap panggilan", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});

describe("formatDate", () => {
  it("format tanggal dengan benar (Bahasa Indonesia)", () => {
    const result = formatDate(new Date("2026-06-14"));
    expect(result).toContain("Juni");
    expect(result).toContain("2026");
  });
});

describe("parseDateTimeToISO", () => {
  it("parse format Indonesia: Ahad, 21 Juni 2026 + Pukul 07.00", () => {
    const result = parseDateTimeToISO("Ahad, 21 Juni 2026", "Pukul 07.00 - 11.30 WIB");
    expect(result).toBe("2026-06-21T07:00:00");
  });

  it("parse format ISO: 2026-06-14", () => {
    const result = parseDateTimeToISO("2026-06-14", "Pukul 08.00 - 12.00 WIB");
    expect(result).toBe("2026-06-14T08:00:00");
  });

  it("parse tanpa hari: 21 Juni 2026", () => {
    const result = parseDateTimeToISO("21 Juni 2026", "Pukul 09.30");
    expect(result).toBe("2026-06-21T09:30:00");
  });

  it("return empty untuk format tidak dikenal", () => {
    const result = parseDateTimeToISO("not a date", "waktu");
    expect(result).toBe("");
  });

  it("default jam 08:00 jika waktu tidak parseable", () => {
    const result = parseDateTimeToISO("2026-06-14", "waktu aneh");
    expect(result).toBe("2026-06-14T08:00:00");
  });

  it("parse waktu tanpa Pukul: 07.00", () => {
    const result = parseDateTimeToISO("2026-06-14", "07.00 - selesai");
    expect(result).toBe("2026-06-14T07:00:00");
  });
});
