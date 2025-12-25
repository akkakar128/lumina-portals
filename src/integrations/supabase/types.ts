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
      allowed_emails: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          is_admin: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          is_admin?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          is_admin?: boolean
        }
        Relationships: []
      }
      education: {
        Row: {
          achievements: string[] | null
          certificate_urls: string[] | null
          created_at: string
          degree: string | null
          description: string | null
          end_date: string | null
          field_of_study: string | null
          id: string
          institution: string
          portfolio_id: string
          sort_order: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          certificate_urls?: string[] | null
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution: string
          portfolio_id: string
          sort_order?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          certificate_urls?: string[] | null
          created_at?: string
          degree?: string | null
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          id?: string
          institution?: string
          portfolio_id?: string
          sort_order?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          company: string
          created_at: string
          description: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          key_outcomes: string[] | null
          portfolio_id: string
          role: string
          sort_order: number | null
          start_date: string | null
          technologies: string[] | null
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          key_outcomes?: string[] | null
          portfolio_id: string
          role: string
          sort_order?: number | null
          start_date?: string | null
          technologies?: string[] | null
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          key_outcomes?: string[] | null
          portfolio_id?: string
          role?: string
          sort_order?: number | null
          start_date?: string | null
          technologies?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          id: string
          is_published: boolean | null
          slug: string
          subtitle: string | null
          theme: Database["public"]["Enums"]["portfolio_theme"] | null
          theme_accent: string | null
          theme_primary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          slug: string
          subtitle?: string | null
          theme?: Database["public"]["Enums"]["portfolio_theme"] | null
          theme_accent?: string | null
          theme_primary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          slug?: string
          subtitle?: string | null
          theme?: Database["public"]["Enums"]["portfolio_theme"] | null
          theme_accent?: string | null
          theme_primary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          location: string | null
          markdown_bio: string | null
          tagline: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          markdown_bio?: string | null
          tagline?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          markdown_bio?: string | null
          tagline?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          live_url: string | null
          media_urls: string[] | null
          portfolio_id: string
          role_in_project: string | null
          short_pitch: string | null
          sort_order: number | null
          status: string | null
          technologies: string[] | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          live_url?: string | null
          media_urls?: string[] | null
          portfolio_id: string
          role_in_project?: string | null
          short_pitch?: string | null
          sort_order?: number | null
          status?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          live_url?: string | null
          media_urls?: string[] | null
          portfolio_id?: string
          role_in_project?: string | null
          short_pitch?: string | null
          sort_order?: number | null
          status?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          display_style: string | null
          id: string
          name: string
          portfolio_id: string
          proficiency: number | null
          sort_order: number | null
          years_experience: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_style?: string | null
          id?: string
          name: string
          portfolio_id: string
          proficiency?: number | null
          sort_order?: number | null
          years_experience?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          display_style?: string | null
          id?: string
          name?: string
          portfolio_id?: string
          proficiency?: number | null
          sort_order?: number | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_visible: boolean | null
          platform: string
          portfolio_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          platform: string
          portfolio_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          platform?: string
          portfolio_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "master_admin" | "portfolio_admin" | "viewer"
      portfolio_theme:
        | "light"
        | "dark"
        | "cyberpunk"
        | "minimal"
        | "glass"
        | "neon"
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
      app_role: ["master_admin", "portfolio_admin", "viewer"],
      portfolio_theme: [
        "light",
        "dark",
        "cyberpunk",
        "minimal",
        "glass",
        "neon",
      ],
    },
  },
} as const
