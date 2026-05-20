import { z } from "zod";

export const tamuInputSchema = z.object({
  nama_siswa: z.string().min(2).max(100).regex(/^[a-zA-Z\s.']+$/, "Hanya huruf & spasi"),
  jenis_kelamin: z.enum(["Laki-laki", "Perempuan"]),
  nama_ayah: z.string().max(100).optional(),
  nama_ibu: z.string().max(100).optional(),
  no_wa_ayah: z.string().max(20).optional(),
  no_wa_ibu: z.string().max(20).optional(),
  event_id: z.string().uuid().optional(),
});

export const rsvpSchema = z.object({
  token: z.string(),
  kehadiran: z.enum(["Hadir", "Tidak Hadir"]),
  jumlah: z.number().int().min(1).max(10),
  pesan: z.string().max(200).optional(),
});

// New RSVP schema with separate parent/child attendance
export const rsvpNewSchema = z.object({
  token: z.string(),
  kehadiran_ortu: z.enum(["Offline", "Online", "Tidak Hadir"]),
  kehadiran_anak: z.enum(["Offline", "Online", "Tidak Hadir"]),
  pesan: z.string().max(200).optional(),
});

export const checkinSchema = z.object({
  token: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type TamuInput = z.infer<typeof tamuInputSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
export type LoginInput = z.infer<typeof loginSchema>;