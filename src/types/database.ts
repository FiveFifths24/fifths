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
      circles: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          slug: string;
          summary: string;
          description: string;
          rules: string;
          status: Database["public"]["Enums"]["circle_status"];
          visibility: Database["public"]["Enums"]["circle_visibility"];
          join_policy: Database["public"]["Enums"]["circle_join_policy"];
          format: Database["public"]["Enums"]["participation_format"];
          location_label: string | null;
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          name: string;
          slug: string;
          summary: string;
          description: string;
          rules: string;
          status?: Database["public"]["Enums"]["circle_status"];
          visibility?: Database["public"]["Enums"]["circle_visibility"];
          join_policy?: Database["public"]["Enums"]["circle_join_policy"];
          format: Database["public"]["Enums"]["participation_format"];
          location_label?: string | null;
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      circle_interests: {
        Row: { circle_id: string; interest_id: string; created_at: string };
        Insert: {
          circle_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      circle_members: {
        Row: {
          circle_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["circle_member_role"];
          status: Database["public"]["Enums"]["circle_membership_status"];
          requested_at: string | null;
          invited_by: string | null;
          joined_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          circle_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["circle_member_role"];
          status: Database["public"]["Enums"]["circle_membership_status"];
          requested_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          host_user_id: string;
          host_display_name: string;
          source_module: Database["public"]["Enums"]["session_source_module"];
          circle_id: string | null;
          title: string;
          summary: string;
          description: string;
          status: Database["public"]["Enums"]["session_status"];
          format: Database["public"]["Enums"]["participation_format"];
          starts_at: string;
          ends_at: string;
          timezone: string;
          capacity: number;
          confirmed_registration_count: number;
          location_label: string | null;
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_user_id: string;
          host_display_name: string;
          source_module?: Database["public"]["Enums"]["session_source_module"];
          circle_id?: string | null;
          title: string;
          summary: string;
          description: string;
          status?: Database["public"]["Enums"]["session_status"];
          format: Database["public"]["Enums"]["participation_format"];
          starts_at: string;
          ends_at: string;
          timezone: string;
          capacity: number;
          confirmed_registration_count?: number;
          location_label?: string | null;
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      session_interests: {
        Row: { session_id: string; interest_id: string; created_at: string };
        Insert: {
          session_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      registrations: {
        Row: {
          session_id: string;
          user_id: string;
          status: Database["public"]["Enums"]["registration_status"];
          registered_at: string;
          cancelled_at: string | null;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          user_id: string;
          status?: Database["public"]["Enums"]["registration_status"];
          registered_at?: string;
          cancelled_at?: string | null;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      attendance_records: {
        Row: {
          session_id: string;
          user_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          marked_by: string;
          marked_at: string;
        };
        Insert: {
          session_id: string;
          user_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          marked_by: string;
          marked_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      creator_opportunities: {
        Row: {
          id: string;
          created_by: string;
          creator_display_name: string;
          circle_id: string | null;
          title: string;
          summary: string;
          description: string;
          deliverables: string;
          kind: Database["public"]["Enums"]["creator_opportunity_kind"];
          status: Database["public"]["Enums"]["creator_opportunity_status"];
          close_reason:
            | Database["public"]["Enums"]["creator_opportunity_close_reason"]
            | null;
          format: Database["public"]["Enums"]["participation_format"];
          location_label: string | null;
          response_deadline: string;
          timezone: string;
          estimated_minutes: number;
          positions: number;
          accepted_count: number;
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at: string | null;
          closed_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          creator_display_name: string;
          circle_id?: string | null;
          title: string;
          summary: string;
          description: string;
          deliverables: string;
          kind: Database["public"]["Enums"]["creator_opportunity_kind"];
          status?: Database["public"]["Enums"]["creator_opportunity_status"];
          close_reason?:
            | Database["public"]["Enums"]["creator_opportunity_close_reason"]
            | null;
          format: Database["public"]["Enums"]["participation_format"];
          location_label?: string | null;
          response_deadline: string;
          timezone: string;
          estimated_minutes: number;
          positions: number;
          accepted_count?: number;
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at?: string | null;
          closed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      opportunity_skills: {
        Row: { opportunity_id: string; skill_id: string; created_at: string };
        Insert: {
          opportunity_id: string;
          skill_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      opportunity_interests: {
        Row: {
          opportunity_id: string;
          interest_id: string;
          created_at: string;
        };
        Insert: {
          opportunity_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      opportunity_responses: {
        Row: {
          opportunity_id: string;
          user_id: string;
          statement: string;
          availability: string;
          status: Database["public"]["Enums"]["opportunity_response_status"];
          submitted_at: string;
          accepted_at: string | null;
          declined_at: string | null;
          withdrawn_at: string | null;
          creator_confirmed_at: string | null;
          participant_confirmed_at: string | null;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          opportunity_id: string;
          user_id: string;
          statement: string;
          availability: string;
          status?: Database["public"]["Enums"]["opportunity_response_status"];
          submitted_at?: string;
          accepted_at?: string | null;
          declined_at?: string | null;
          withdrawn_at?: string | null;
          creator_confirmed_at?: string | null;
          participant_confirmed_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      saved_opportunities: {
        Row: { opportunity_id: string; user_id: string; created_at: string };
        Insert: {
          opportunity_id: string;
          user_id: string;
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
      can_manage_session: {
        Args: { p_session_id: string };
        Returns: boolean;
      };
      can_view_session: {
        Args: { p_session_id: string };
        Returns: boolean;
      };
      create_session: {
        Args: {
          p_title: string;
          p_summary: string;
          p_description: string;
          p_format: Database["public"]["Enums"]["participation_format"];
          p_starts_local: string;
          p_ends_local: string;
          p_timezone: string;
          p_capacity: number;
          p_location_label: string | null;
          p_mode_id: string;
          p_minimum_energy: number;
          p_maximum_energy: number;
          p_stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          p_social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          p_interest_ids: string[];
        };
        Returns: string;
      };
      set_session_status: {
        Args: {
          p_session_id: string;
          p_status: Database["public"]["Enums"]["session_status"];
        };
        Returns: undefined;
      };
      register_for_session: {
        Args: { p_session_id: string };
        Returns: undefined;
      };
      cancel_session_registration: {
        Args: { p_session_id: string };
        Returns: undefined;
      };
      mark_session_attendance: {
        Args: {
          p_session_id: string;
          p_user_id: string;
          p_status: Database["public"]["Enums"]["attendance_status"];
        };
        Returns: undefined;
      };
      get_session_roster: {
        Args: { p_session_id: string };
        Returns: Array<{
          user_id: string;
          display_name: string;
          username: string | null;
          registration_status: Database["public"]["Enums"]["registration_status"];
          attendance_status:
            Database["public"]["Enums"]["attendance_status"] | null;
        }>;
      };
      is_circle_member: {
        Args: { p_circle_id: string };
        Returns: boolean;
      };
      can_manage_circle: {
        Args: { p_circle_id: string };
        Returns: boolean;
      };
      can_moderate_circle: {
        Args: { p_circle_id: string };
        Returns: boolean;
      };
      can_host_circle: {
        Args: { p_circle_id: string };
        Returns: boolean;
      };
      can_view_circle: {
        Args: { p_circle_id: string };
        Returns: boolean;
      };
      create_circle: {
        Args: {
          p_name: string;
          p_slug: string;
          p_summary: string;
          p_description: string;
          p_rules: string;
          p_visibility: Database["public"]["Enums"]["circle_visibility"];
          p_join_policy: Database["public"]["Enums"]["circle_join_policy"];
          p_format: Database["public"]["Enums"]["participation_format"];
          p_location_label: string | null;
          p_mode_id: string;
          p_minimum_energy: number;
          p_maximum_energy: number;
          p_stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          p_social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          p_interest_ids: string[];
        };
        Returns: string;
      };
      set_circle_status: {
        Args: {
          p_circle_id: string;
          p_status: Database["public"]["Enums"]["circle_status"];
        };
        Returns: undefined;
      };
      join_circle: {
        Args: { p_circle_id: string };
        Returns: Database["public"]["Enums"]["circle_membership_status"];
      };
      respond_to_circle_invitation: {
        Args: { p_circle_id: string; p_accept: boolean };
        Returns: undefined;
      };
      leave_circle: {
        Args: { p_circle_id: string };
        Returns: undefined;
      };
      invite_circle_member: {
        Args: { p_circle_id: string; p_username: string };
        Returns: undefined;
      };
      review_circle_membership: {
        Args: { p_circle_id: string; p_user_id: string; p_decision: string };
        Returns: undefined;
      };
      set_circle_member_role: {
        Args: {
          p_circle_id: string;
          p_user_id: string;
          p_role: Database["public"]["Enums"]["circle_member_role"];
        };
        Returns: undefined;
      };
      get_circle_roster: {
        Args: { p_circle_id: string };
        Returns: Array<{
          user_id: string;
          display_name: string;
          username: string | null;
          membership_status: Database["public"]["Enums"]["circle_membership_status"];
          member_role: Database["public"]["Enums"]["circle_member_role"];
          requested_at: string | null;
          joined_at: string | null;
        }>;
      };
      set_session_circle: {
        Args: { p_session_id: string; p_circle_id: string | null };
        Returns: undefined;
      };
      can_manage_creator_opportunity: {
        Args: { p_opportunity_id: string };
        Returns: boolean;
      };
      can_view_creator_opportunity: {
        Args: { p_opportunity_id: string };
        Returns: boolean;
      };
      create_creator_opportunity: {
        Args: {
          p_circle_id: string | null;
          p_title: string;
          p_summary: string;
          p_description: string;
          p_deliverables: string;
          p_kind: Database["public"]["Enums"]["creator_opportunity_kind"];
          p_format: Database["public"]["Enums"]["participation_format"];
          p_location_label: string | null;
          p_response_deadline_local: string;
          p_timezone: string;
          p_estimated_minutes: number;
          p_positions: number;
          p_mode_id: string;
          p_minimum_energy: number;
          p_maximum_energy: number;
          p_stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          p_social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          p_skill_ids: string[];
          p_interest_ids: string[];
        };
        Returns: string;
      };
      set_creator_opportunity_status: {
        Args: {
          p_opportunity_id: string;
          p_status: Database["public"]["Enums"]["creator_opportunity_status"];
        };
        Returns: undefined;
      };
      save_creator_opportunity: {
        Args: { p_opportunity_id: string; p_save: boolean };
        Returns: undefined;
      };
      submit_opportunity_response: {
        Args: {
          p_opportunity_id: string;
          p_statement: string;
          p_availability: string;
        };
        Returns: undefined;
      };
      withdraw_opportunity_response: {
        Args: { p_opportunity_id: string };
        Returns: undefined;
      };
      review_opportunity_response: {
        Args: {
          p_opportunity_id: string;
          p_user_id: string;
          p_decision: string;
        };
        Returns: undefined;
      };
      confirm_opportunity_completion: {
        Args: { p_opportunity_id: string; p_user_id: string };
        Returns: undefined;
      };
      get_creator_opportunity_responses: {
        Args: { p_opportunity_id: string };
        Returns: Array<{
          user_id: string;
          display_name: string;
          username: string | null;
          statement: string;
          availability: string;
          response_status: Database["public"]["Enums"]["opportunity_response_status"];
          submitted_at: string;
          accepted_at: string | null;
          creator_confirmed_at: string | null;
          participant_confirmed_at: string | null;
          completed_at: string | null;
        }>;
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
      session_source_module: "platform" | "circles" | "commons" | "realm";
      session_status: "draft" | "published" | "cancelled" | "completed";
      registration_status: "registered" | "cancelled";
      attendance_status: "attended" | "absent" | "excused";
      circle_visibility: "public" | "private";
      circle_join_policy: "open" | "request" | "invite_only";
      circle_status: "draft" | "published" | "archived";
      circle_member_role: "owner" | "host" | "moderator" | "member";
      circle_membership_status:
        "requested" | "invited" | "active" | "declined" | "removed" | "left";
      creator_opportunity_kind:
        "collaboration" | "project" | "volunteer" | "mentorship";
      creator_opportunity_status:
        "draft" | "published" | "closed" | "completed" | "cancelled";
      creator_opportunity_close_reason: "manual" | "filled" | "deadline";
      opportunity_response_status:
        "submitted" | "accepted" | "declined" | "withdrawn" | "completed";
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
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type Circle = Database["public"]["Tables"]["circles"]["Row"];
export type CircleMember =
  Database["public"]["Tables"]["circle_members"]["Row"];
export type CreatorOpportunity =
  Database["public"]["Tables"]["creator_opportunities"]["Row"];
export type OpportunityResponse =
  Database["public"]["Tables"]["opportunity_responses"]["Row"];
