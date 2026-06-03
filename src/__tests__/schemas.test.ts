import { describe, it, expect } from "vitest";
import { rsvpNewSchema, tamuInputSchema, rsvpSchema } from "@/lib/schemas";

describe("rsvpNewSchema", () => {
  it("menerima data RSVP valid", () => {
    const result = rsvpNewSchema.safeParse({
      token: "abc123",
      kehadiran_ortu: "Offline",
      kehadiran_anak: "Offline",
      jumlah_ortu: 2,
      pesan: "Semoga lancar",
    });
    expect(result.success).toBe(true);
  });

  it("menerima kehadiran_anak: Online", () => {
    const result = rsvpNewSchema.safeParse({
      token: "abc",
      kehadiran_ortu: "Online",
      kehadiran_anak: "Online",
    });
    expect(result.success).toBe(true);
  });

  it("menerima kehadiran_anak: Hadir (backward compat)", () => {
    const result = rsvpNewSchema.safeParse({
      token: "abc",
      kehadiran_ortu: "Offline",
      kehadiran_anak: "Hadir",
      jumlah_ortu: 1,
    });
    expect(result.success).toBe(true);
  });

  it("menolak kehadiran_anak invalid", () => {
    const result = rsvpNewSchema.safeParse({
      token: "abc",
      kehadiran_ortu: "Offline",
      kehadiran_anak: "Mungkin",
    });
    expect(result.success).toBe(false);
  });

  it("menolak tanpa token", () => {
    const result = rsvpNewSchema.safeParse({
      kehadiran_ortu: "Offline",
      kehadiran_anak: "Offline",
    });
    expect(result.success).toBe(false);
  });

  it("jumlah_ortu opsional jika bukan Offline", () => {
    const result = rsvpNewSchema.safeParse({
      token: "abc",
      kehadiran_ortu: "Online",
      kehadiran_anak: "Online",
    });
    expect(result.success).toBe(true);
  });
});

describe("rsvpSchema (legacy)", () => {
  it("menerima data RSVP legacy valid", () => {
    const result = rsvpSchema.safeParse({
      token: "abc",
      kehadiran: "Hadir",
      jumlah: 2,
    });
    expect(result.success).toBe(true);
  });

  it("menolak kehadiran invalid", () => {
    const result = rsvpSchema.safeParse({
      token: "abc",
      kehadiran: "Mungkin",
      jumlah: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("tamuInputSchema", () => {
  it("menerima data tamu valid", () => {
    const result = tamuInputSchema.safeParse({
      nama_siswa: "Ahmad Fauzi",
      jenis_kelamin: "Laki-laki",
      kelas: "9A",
    });
    expect(result.success).toBe(true);
  });

  it("menolak nama_siswa dengan angka", () => {
    const result = tamuInputSchema.safeParse({
      nama_siswa: "Ahmad123",
      jenis_kelamin: "Laki-laki",
    });
    expect(result.success).toBe(false);
  });

  it("menolak jenis_kelamin invalid", () => {
    const result = tamuInputSchema.safeParse({
      nama_siswa: "Ahmad",
      jenis_kelamin: "Unknown",
    });
    expect(result.success).toBe(false);
  });

  it("menerima field opsional kosong", () => {
    const result = tamuInputSchema.safeParse({
      nama_siswa: "Siti",
      jenis_kelamin: "Perempuan",
    });
    expect(result.success).toBe(true);
  });
});
