export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  undangan: {
    Tables: {
      admin_memories: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          key: string
          sekolah_id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          key: string
          sekolah_id: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          key?: string
          sekolah_id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_memories_sekolah_id_fkey"
            columns: ["sekolah_id"]
            isOneToOne: false
            referencedRelation: "sekolah"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin: {
        Row: {
          id: string
          scanned_by: string | null
          tamu_id: string | null
          waktu: string | null
        }
        Insert: {
          id?: string
          scanned_by?: string | null
          tamu_id?: string | null
          waktu?: string | null
        }
        Update: {
          id?: string
          scanned_by?: string | null
          tamu_id?: string | null
          waktu?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkin_tamu_id_fkey"
            columns: ["tamu_id"]
            isOneToOne: false
            referencedRelation: "tamu"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          nama: string
          sekolah_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nama: string
          sekolah_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nama?: string
          sekolah_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_sekolah_id_fkey"
            columns: ["sekolah_id"]
            isOneToOne: false
            referencedRelation: "sekolah"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          event_id: string | null
          id: string
          metadata: Json | null
          tamu_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          tamu_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          tamu_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_activity_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_activity_log_tamu_id_fkey"
            columns: ["tamu_id"]
            isOneToOne: false
            referencedRelation: "tamu"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_memories: {
        Row: {
          created_at: string | null
          id: string
          key: string
          tamu_id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          tamu_id: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          tamu_id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "guest_memories_tamu_id_fkey"
            columns: ["tamu_id"]
            isOneToOne: false
            referencedRelation: "tamu"
            referencedColumns: ["id"]
          },
        ]
      }
      konten_undangan: {
        Row: {
          agenda: Json
          bismillah: string
          created_at: string | null
          event_id: string
          footer: string
          header_arabic: string
          hero_desc: string
          id: string
          judul: string
          link_youtube: string
          lokasi_alamat: string
          lokasi_maps: string
          lokasi_nama: string
          music_auto_play: boolean
          music_url: string
          sekolah_id: string
          subtitle: string
          tanggal: string
          template_slug: string
          updated_at: string | null
          waktu: string
        }
        Insert: {
          agenda?: Json
          bismillah?: string
          created_at?: string | null
          event_id: string
          footer?: string
          header_arabic?: string
          hero_desc?: string
          id?: string
          judul?: string
          link_youtube?: string
          lokasi_alamat?: string
          lokasi_maps?: string
          lokasi_nama?: string
          music_auto_play?: boolean
          music_url?: string
          sekolah_id: string
          subtitle?: string
          tanggal?: string
          template_slug?: string
          updated_at?: string | null
          waktu?: string
        }
        Update: {
          agenda?: Json
          bismillah?: string
          created_at?: string | null
          event_id?: string
          footer?: string
          header_arabic?: string
          hero_desc?: string
          id?: string
          judul?: string
          link_youtube?: string
          lokasi_alamat?: string
          lokasi_maps?: string
          lokasi_nama?: string
          music_auto_play?: boolean
          music_url?: string
          sekolah_id?: string
          subtitle?: string
          tanggal?: string
          template_slug?: string
          updated_at?: string | null
          waktu?: string
        }
        Relationships: [
          {
            foreignKeyName: "konten_undangan_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "konten_undangan_sekolah_id_fkey"
            columns: ["sekolah_id"]
            isOneToOne: false
            referencedRelation: "sekolah"
            referencedColumns: ["id"]
          },
        ]
      }
      pengaturan: {
        Row: {
          description: string | null
          event_id: string
          key: string
          label: string
          sekolah_id: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          event_id: string
          key: string
          label: string
          sekolah_id: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          event_id?: string
          key?: string
          label?: string
          sekolah_id?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "pengaturan_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengaturan_sekolah_id_fkey"
            columns: ["sekolah_id"]
            isOneToOne: false
            referencedRelation: "sekolah"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvp: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          jumlah: number
          kehadiran: string
          kehadiran_anak: string | null
          kehadiran_ortu: string | null
          pesan: string | null
          sekolah_id: string | null
          tamu_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          jumlah?: number
          kehadiran: string
          kehadiran_anak?: string | null
          kehadiran_ortu?: string | null
          pesan?: string | null
          sekolah_id?: string | null
          tamu_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          jumlah?: number
          kehadiran?: string
          kehadiran_anak?: string | null
          kehadiran_ortu?: string | null
          pesan?: string | null
          sekolah_id?: string | null
          tamu_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvp_sekolah_id_fkey"
            columns: ["sekolah_id"]
            isOneToOne: false
            referencedRelation: "sekolah"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvp_tamu_id_fkey"
            columns: ["tamu_id"]
            isOneToOne: false
            referencedRelation: "tamu"
            referencedColumns: ["id"]
          },
        ]
      }
      sekolah: {
        Row: {
          alamat: string | null
          created_at: string | null
          id: string
          logo_url: string
          nama: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string
          nama: string
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string
          nama?: string
        }
        Relationships: []
      }
      tamu: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          jenis_kelamin: string | null
          kelas: string | null
          nama_ayah: string | null
          nama_ibu: string | null
          nama_ortu: string | null
          nama_siswa: string
          no_wa_ayah: string | null
          no_wa_ibu: string | null
          sekolah_id: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          jenis_kelamin?: string | null
          kelas?: string | null
          nama_ayah?: string | null
          nama_ibu?: string | null
          nama_ortu?: string | null
          nama_siswa: string
          no_wa_ayah?: string | null
          no_wa_ibu?: string | null
          sekolah_id?: string | null
          token: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          jenis_kelamin?: string | null
          kelas?: string | null
          nama_ayah?: string | null
          nama_ibu?: string | null
          nama_ortu?: string | null
          nama_siswa?: string
          no_wa_ayah?: string | null
          no_wa_ibu?: string | null
          sekolah_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tamu_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tamu_sekolah_id_fkey"
            columns: ["sekolah_id"]
            isOneToOne: false
            referencedRelation: "sekolah"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_sekolah_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "undangan">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  undangan: {
    Enums: {},
  },
} as const

export type KontenUndangan = Tables<"konten_undangan">;
export type Tamu = Tables<"tamu">;
export type Rsvp = Tables<"rsvp">;
export type Checkin = Tables<"checkin">;
export type Pengaturan = Tables<"pengaturan">;
export type Sekolah = Tables<"sekolah">;
