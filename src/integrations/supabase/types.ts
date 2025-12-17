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
      applications: {
        Row: {
          applied_at: string | null
          channel: string | null
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string | null
          next_step_date: string | null
          notes: string | null
          resume_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          channel?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          next_step_date?: string | null
          notes?: string | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          channel?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          next_step_date?: string | null
          notes?: string | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_remote: boolean | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          source: string | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_remote?: boolean | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_remote?: boolean | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kpi_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          explanation: string | null
          gaps_json: Json | null
          id: string
          job_id: string | null
          resume_id: string | null
          score_semantic: number | null
          score_seniority: number | null
          score_skills: number | null
          score_total: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          gaps_json?: Json | null
          id?: string
          job_id?: string | null
          resume_id?: string | null
          score_semantic?: number | null
          score_seniority?: number | null
          score_skills?: number | null
          score_total?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          gaps_json?: Json | null
          id?: string
          job_id?: string | null
          resume_id?: string | null
          score_semantic?: number | null
          score_seniority?: number | null
          score_skills?: number | null
          score_total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          currency: string | null
          email: string | null
          english_level: string | null
          full_name: string | null
          id: string
          industries: string[] | null
          linkedin_url: string | null
          onboarding_completed: boolean | null
          phone: string | null
          role_target: string | null
          salary_max: number | null
          salary_min: number | null
          seniority: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          english_level?: string | null
          full_name?: string | null
          id?: string
          industries?: string[] | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role_target?: string | null
          salary_max?: number | null
          salary_min?: number | null
          seniority?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          english_level?: string | null
          full_name?: string | null
          id?: string
          industries?: string[] | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role_target?: string | null
          salary_max?: number | null
          salary_min?: number | null
          seniority?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content_json: Json | null
          created_at: string
          id: string
          is_master: boolean | null
          name: string
          raw_text: string | null
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          content_json?: Json | null
          created_at?: string
          id?: string
          is_master?: boolean | null
          name?: string
          raw_text?: string | null
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          content_json?: Json | null
          created_at?: string
          id?: string
          is_master?: boolean | null
          name?: string
          raw_text?: string | null
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      star_stories: {
        Row: {
          action: string | null
          competencies: string[] | null
          created_at: string
          id: string
          result: string | null
          situation: string | null
          task: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action?: string | null
          competencies?: string[] | null
          created_at?: string
          id?: string
          result?: string | null
          situation?: string | null
          task?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string | null
          competencies?: string[] | null
          created_at?: string
          id?: string
          result?: string | null
          situation?: string | null
          task?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
