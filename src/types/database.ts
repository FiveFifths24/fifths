export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          pronouns: string | null;
          timezone: string;
          avatar_url: string | null;
          visibility: Database["public"]["Enums"]["profile_visibility"];
          age_confirmed_at: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          pronouns?: string | null;
          timezone?: string;
          avatar_url?: string | null;
          visibility?: Database["public"]["Enums"]["profile_visibility"];
          age_confirmed_at?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: Database["public"]["Enums"]["app_role"];
          granted_by: string | null;
          granted_at: string;
        };
        Insert: {
          user_id: string;
          role: Database["public"]["Enums"]["app_role"];
          granted_by?: string | null;
          granted_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      interests: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["interests"]["Insert"]>;
        Relationships: [];
      };
      profile_interests: {
        Row: { user_id: string; interest_id: string; created_at: string };
        Insert: {
          user_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          slug: string;
          name: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["skills"]["Insert"]>;
        Relationships: [];
      };
      profile_skills: {
        Row: { user_id: string; skill_id: string; created_at: string };
        Insert: { user_id: string; skill_id: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      modes: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["modes"]["Insert"]>;
        Relationships: [];
      };
      pulse_check_ins: {
        Row: {
          id: string;
          user_id: string;
          mode_id: string;
          energy_level: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          preferred_format: Database["public"]["Enums"]["participation_format"];
          available_minutes: number;
          maximum_travel_miles: number | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode_id: string;
          energy_level: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          preferred_format: Database["public"]["Enums"]["participation_format"];
          available_minutes: number;
          maximum_travel_miles?: number | null;
          created_at?: string;
          expires_at: string;
        };
        Update: never;
        Relationships: [];
      };
      pulse_check_in_interests: {
        Row: {
          check_in_id: string;
          interest_id: string;
          created_at: string;
        };
        Insert: {
          check_in_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      complete_onboarding: {
        Args: {
          p_username: string;
          p_display_name: string;
          p_pronouns: string | null;
          p_timezone: string;
          p_interest_ids: string[];
          p_skill_ids: string[];
        };
        Returns: undefined;
      };
      has_role: {
        Args: { requested_role: Database["public"]["Enums"]["app_role"] };
        Returns: boolean;
      };
      record_pulse_check_in: {
        Args: {
          p_mode_id: string;
          p_energy_level: number;
          p_stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          p_social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          p_preferred_format: Database["public"]["Enums"]["participation_format"];
          p_available_minutes: number;
          p_maximum_travel_miles: number | null;
          p_interest_ids: string[];
        };
        Returns: string;
      };
    };
    Enums: {
      app_role:
        | "member"
        | "host"
        | "moderator"
        | "creator"
        | "game_master"
        | "organization_admin"
        | "platform_admin";
      profile_visibility: "private" | "members" | "public";
      pulse_stimulation_level: "low" | "moderate" | "high";
      pulse_social_intensity: "solo" | "light" | "social";
      participation_format: "in_person" | "online" | "either";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Interest = Database["public"]["Tables"]["interests"]["Row"];
export type Skill = Database["public"]["Tables"]["skills"]["Row"];
export type Mode = Database["public"]["Tables"]["modes"]["Row"];
export type PulseCheckIn =
  Database["public"]["Tables"]["pulse_check_ins"]["Row"];
