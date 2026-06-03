import { describe, it, expect } from "vitest";

/**
 * Tests for RSVP form business logic.
 * These test the totalHadir calculation and kehadiran normalization
 * without needing React rendering.
 */

interface RsvpState {
  kehadiran_ortu: string;
  kehadiran_anak: string;
  jumlah_ortu: number;
}

function calcTotalHadir(state: RsvpState, maxJumlahOrtu: number): number {
  const isOrtuHadir = state.kehadiran_ortu === "Offline" || state.kehadiran_ortu === "Online";
  const isOrtuOffline = state.kehadiran_ortu === "Offline";
  const isAnakHadir = state.kehadiran_anak === "Offline" || state.kehadiran_anak === "Online";
  return (
    (isOrtuOffline ? state.jumlah_ortu : isOrtuHadir ? 1 : 0) +
    (isAnakHadir ? 1 : 0)
  );
}

function normalizeKehadiranAnak(raw: string): string {
  return raw === "Hadir" ? "Offline" : raw;
}

describe("calcTotalHadir", () => {
  it("ortu offline 2 orang + anak offline = 3", () => {
    expect(
      calcTotalHadir(
        { kehadiran_ortu: "Offline", kehadiran_anak: "Offline", jumlah_ortu: 2 },
        2
      )
    ).toBe(3);
  });

  it("ortu online + anak online = 2", () => {
    expect(
      calcTotalHadir(
        { kehadiran_ortu: "Online", kehadiran_anak: "Online", jumlah_ortu: 1 },
        2
      )
    ).toBe(2);
  });

  it("ortu tidak hadir + anak offline = 1", () => {
    expect(
      calcTotalHadir(
        { kehadiran_ortu: "Tidak Hadir", kehadiran_anak: "Offline", jumlah_ortu: 1 },
        2
      )
    ).toBe(1);
  });

  it("ortu tidak hadir + anak tidak hadir = 0", () => {
    expect(
      calcTotalHadir(
        { kehadiran_ortu: "Tidak Hadir", kehadiran_anak: "Tidak Hadir", jumlah_ortu: 1 },
        2
      )
    ).toBe(0);
  });

  it("ortu online + anak tidak hadir = 1", () => {
    expect(
      calcTotalHadir(
        { kehadiran_ortu: "Online", kehadiran_anak: "Tidak Hadir", jumlah_ortu: 1 },
        2
      )
    ).toBe(1);
  });
});

describe("normalizeKehadiranAnak", () => {
  it("Hadir → Offline (backward compat)", () => {
    expect(normalizeKehadiranAnak("Hadir")).toBe("Offline");
  });

  it("Offline tetap Offline", () => {
    expect(normalizeKehadiranAnak("Offline")).toBe("Offline");
  });

  it("Online tetap Online", () => {
    expect(normalizeKehadiranAnak("Online")).toBe("Online");
  });

  it("Tidak Hadir tetap Tidak Hadir", () => {
    expect(normalizeKehadiranAnak("Tidak Hadir")).toBe("Tidak Hadir");
  });
});
