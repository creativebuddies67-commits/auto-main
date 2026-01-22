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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dealer_groups: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question_id: string
          rooftop_id: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id: string
          rooftop_id: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question_id?: string
          rooftop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_answers_rooftop_id_fkey"
            columns: ["rooftop_id"]
            isOneToOne: false
            referencedRelation: "rooftops"
            referencedColumns: ["id"]
          },
        ]
      }
      retell_agents: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          push_error: string | null
          push_status: string | null
          pushed_at: string | null
          pushed_by: string | null
          rooftop_id: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          push_error?: string | null
          push_status?: string | null
          pushed_at?: string | null
          pushed_by?: string | null
          rooftop_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          push_error?: string | null
          push_status?: string | null
          pushed_at?: string | null
          pushed_by?: string | null
          rooftop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retell_agents_rooftop_id_fkey"
            columns: ["rooftop_id"]
            isOneToOne: true
            referencedRelation: "rooftops"
            referencedColumns: ["id"]
          },
        ]
      }
      rooftop_documents: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          rooftop_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          rooftop_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          rooftop_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooftop_documents_rooftop_id_fkey"
            columns: ["rooftop_id"]
            isOneToOne: false
            referencedRelation: "rooftops"
            referencedColumns: ["id"]
          },
        ]
      }
      rooftops: {
        Row: {
          brands: string[]
          created_at: string
          created_by: string | null
          dealer_group_id: string
          id: string
          name: string
          questionnaire_status: Database["public"]["Enums"]["questionnaire_status"]
          timezone: string
          updated_at: string
          website_url: string
        }
        Insert: {
          brands?: string[]
          created_at?: string
          created_by?: string | null
          dealer_group_id: string
          id?: string
          name: string
          questionnaire_status?: Database["public"]["Enums"]["questionnaire_status"]
          timezone?: string
          updated_at?: string
          website_url: string
        }
        Update: {
          brands?: string[]
          created_at?: string
          created_by?: string | null
          dealer_group_id?: string
          id?: string
          name?: string
          questionnaire_status?: Database["public"]["Enums"]["questionnaire_status"]
          timezone?: string
          updated_at?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooftops_dealer_group_id_fkey"
            columns: ["dealer_group_id"]
            isOneToOne: false
            referencedRelation: "dealer_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      rulebook_edits: {
        Row: {
          content_snapshot: string
          created_at: string
          edit_note: string | null
          id: string
          rulebook_id: string
          user_id: string
        }
        Insert: {
          content_snapshot: string
          created_at?: string
          edit_note?: string | null
          id?: string
          rulebook_id: string
          user_id: string
        }
        Update: {
          content_snapshot?: string
          created_at?: string
          edit_note?: string | null
          id?: string
          rulebook_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rulebook_edits_rulebook_id_fkey"
            columns: ["rulebook_id"]
            isOneToOne: false
            referencedRelation: "rulebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      rulebooks: {
        Row: {
          content: string
          created_at: string
          id: string
          rooftop_id: string
          signed_off_at: string | null
          signed_off_by: string | null
          status: Database["public"]["Enums"]["rulebook_status"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rooftop_id: string
          signed_off_at?: string | null
          signed_off_by?: string | null
          status?: Database["public"]["Enums"]["rulebook_status"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rooftop_id?: string
          signed_off_at?: string | null
          signed_off_by?: string | null
          status?: Database["public"]["Enums"]["rulebook_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rulebooks_rooftop_id_fkey"
            columns: ["rooftop_id"]
            isOneToOne: true
            referencedRelation: "rooftops"
            referencedColumns: ["id"]
          },
        ]
      }
      website_extractions: {
        Row: {
          extracted_at: string
          extracted_by: string | null
          id: string
          rooftop_id: string
          saturday_hours: string | null
          service_address: string | null
          weekday_hours: string | null
        }
        Insert: {
          extracted_at?: string
          extracted_by?: string | null
          id?: string
          rooftop_id: string
          saturday_hours?: string | null
          service_address?: string | null
          weekday_hours?: string | null
        }
        Update: {
          extracted_at?: string
          extracted_by?: string | null
          id?: string
          rooftop_id?: string
          saturday_hours?: string | null
          service_address?: string | null
          weekday_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_extractions_rooftop_id_fkey"
            columns: ["rooftop_id"]
            isOneToOne: true
            referencedRelation: "rooftops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      questionnaire_status: "draft" | "completed"
      rulebook_status: "draft" | "signed_off" | "pushed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

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
  public: {
    Enums: {
      questionnaire_status: ["draft", "completed"],
      rulebook_status: ["draft", "signed_off", "pushed"],
    },
  },
} as const
