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
      direct_conversations: {
  Row: {
    id: string;
    user_id_a: string;
    user_id_b: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id_a: string;
    user_id_b: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<
    Database["public"]["Tables"]["direct_conversations"]["Insert"]
  >;
  Relationships: [];
};

direct_messages: {
  Row: {
    id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    created_at: string;
    edited_at: string | null;
    deleted_at: string | null;
  };
  Insert: {
    id?: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    created_at?: string;
    edited_at?: string | null;
    deleted_at?: string | null;
  };
  Update: Partial<
    Database["public"]["Tables"]["direct_messages"]["Insert"]
  >;
  Relationships: [];
};
      profiles: {
        Row: {
          id: string;
          username: string | null;
          username_changed_at: string | null;
          display_name: string | null;
          display_name_changed_at: string | null;
          pronouns: string | null;
          timezone: string;
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          region: string | null;
          country_code: string | null;
          cover_image_url: string | null;
          background_image_url: string | null;
          landscape_image_fit: "cover" | "contain";
          landscape_image_position_x: number;
          landscape_image_position_y: number;
          landscape_image_zoom: number;
          background_image_fit: "cover" | "contain";
          background_image_position_x: number;
          background_image_position_y: number;
          background_image_zoom: number;
          profile_accent_color: string;
          spotlight_category: string | null;
spotlight_title: string | null;
spotlight_description: string | null;
spotlight_url: string | null;

current_game: string | null;
current_reading: string | null;
current_food: string | null;
current_game_description: string | null;
current_game_url: string | null;

current_reading_description: string | null;
current_reading_url: string | null;

current_food_description: string | null;
current_food_url: string | null;

mood: string | null;
          last_seen_at: string | null;
          view_my_label: string | null;
          view_my_url: string | null;
          profile_song_url: string | null;
          profile_song_title: string | null;
          profile_song_artist: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"];
          friend_list_visibility: Database["public"]["Enums"]["friend_list_visibility"];
          discoverable: boolean;
          visibility: Database["public"]["Enums"]["profile_visibility"];
          age_confirmed_at: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
          featured_profile_image_url: string | null;
          featured_profile_image_2_url: string | null;
          latest_pick_category: string | null;
          latest_pick_note: string | null;
          latest_pick_title: string | null;
          latest_pick_url: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          username_changed_at?: string | null;
          display_name?: string | null;
          display_name_changed_at?: string | null;
          pronouns?: string | null;
          timezone?: string;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          region?: string | null;
          country_code?: string | null;
          cover_image_url?: string | null;
          background_image_url?: string | null;
          landscape_image_fit?: "cover" | "contain";
          landscape_image_position_x?: number;
          landscape_image_position_y?: number;
          landscape_image_zoom?: number;
          background_image_fit?: "cover" | "contain";
          background_image_position_x?: number;
          background_image_position_y?: number;
          background_image_zoom?: number;
          profile_accent_color?: string;
          spotlight_category?: string | null;
spotlight_title?: string | null;
spotlight_description?: string | null;
spotlight_url?: string | null;

current_game?: string | null;
current_reading?: string | null;
current_food?: string | null;

mood?: string | null;
          last_seen_at?: string | null;
          view_my_label?: string | null;
          view_my_url?: string | null;
          profile_song_url?: string | null;
          profile_song_title?: string | null;
          profile_song_artist?: string | null;
          location_visibility?: Database["public"]["Enums"]["location_visibility"];
          friend_list_visibility?: Database["public"]["Enums"]["friend_list_visibility"];
          discoverable?: boolean;
          visibility?: Database["public"]["Enums"]["profile_visibility"];
          age_confirmed_at?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          featured_profile_image_url?: string | null;
          featured_profile_image_2_url?: string | null;
          latest_pick_category?: string | null;
          latest_pick_note?: string | null;
          latest_pick_title?: string | null;
          latest_pick_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      profile_rooms: {
        Row: {
          user_id: string;
          enabled: boolean;
          wall_color: string;
          floor_color: string;
          couch_color: string;
          bookshelf_color: string;
          tv_color: string;
          door_color: string;
          accessory_color: string;
          lighting_theme: "cosmic" | "warm" | "daylight" | "midnight";
          current_vibe: "chill" | "focused" | "gaming" | "creative" | "social";
          character_color: string;
          character_shape: "ghost" | "blob" | "orbit";
          character_expression: "smile" | "calm" | "wink";
          character_accessory: "none" | "headphones" | "glasses" | "beanie";
          head_accessory:
            | "none"
            | "headphones"
            | "beanie"
            | "bow"
            | "hat"
            | "crown"
            | "flower"
            | "headband";
          face_accessory: "none" | "glasses" | "sunglasses";
          neck_accessory: "none" | "scarf" | "bandana";
          motion_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          enabled?: boolean;
          wall_color?: string;
          floor_color?: string;
          couch_color?: string;
          bookshelf_color?: string;
          tv_color?: string;
          door_color?: string;
          accessory_color?: string;
          lighting_theme?: "cosmic" | "warm" | "daylight" | "midnight";
          current_vibe?: "chill" | "focused" | "gaming" | "creative" | "social";
          character_color?: string;
          character_shape?: "ghost" | "blob" | "orbit";
          character_expression?: "smile" | "calm" | "wink";
          character_accessory?: "none" | "headphones" | "glasses" | "beanie";
          head_accessory?:
            | "none"
            | "headphones"
            | "beanie"
            | "bow"
            | "hat"
            | "crown"
            | "flower"
            | "headband";
          face_accessory?: "none" | "glasses" | "sunglasses";
          neck_accessory?: "none" | "scarf" | "bandana";
          motion_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["profile_rooms"]["Insert"]
        >;
        Relationships: [];
      };
      profile_view_buckets: {
        Row: {
          profile_id: string;
          viewer_id: string;
          viewed_on: string;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          viewer_id: string;
          viewed_on?: string;
          created_at?: string;
        };
        Update: never;
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
          realm_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          active?: boolean;
          realm_enabled?: boolean;
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
          campaign_id: string | null;
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
          campaign_id?: string | null;
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
          is_paid: boolean;
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
          is_paid?: boolean;
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
        Row: {
          opportunity_id: string;
          skill_id: string;
          created_at: string;
        };
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
        Row: {
          opportunity_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          opportunity_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      realm_campaigns: {
        Row: {
          id: string;
          created_by: string;
          game_master_display_name: string;
          circle_id: string | null;
          title: string;
          summary: string;
          premise: string;
          genre: string;
          tone: string;
          safety_expectations: string;
          status: Database["public"]["Enums"]["realm_campaign_status"];
          format: Database["public"]["Enums"]["participation_format"];
          location_label: string | null;
          schedule_summary: string;
          timezone: string;
          estimated_session_minutes: number;
          application_deadline: string;
          player_capacity: number;
          active_player_count: number;
          experience_level: Database["public"]["Enums"]["campaign_experience_level"];
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at: string | null;
          recruiting_closed_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          game_master_display_name: string;
          circle_id?: string | null;
          title: string;
          summary: string;
          premise: string;
          genre: string;
          tone: string;
          safety_expectations: string;
          status?: Database["public"]["Enums"]["realm_campaign_status"];
          format: Database["public"]["Enums"]["participation_format"];
          location_label?: string | null;
          schedule_summary: string;
          timezone: string;
          estimated_session_minutes: number;
          application_deadline: string;
          player_capacity: number;
          active_player_count?: number;
          experience_level: Database["public"]["Enums"]["campaign_experience_level"];
          mode_id: string;
          minimum_energy: number;
          maximum_energy: number;
          stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          published_at?: string | null;
          recruiting_closed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      campaign_interests: {
        Row: { campaign_id: string; interest_id: string; created_at: string };
        Insert: {
          campaign_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      campaign_applications: {
        Row: {
          campaign_id: string;
          user_id: string;
          motivation: string;
          availability: string;
          experience_level: Database["public"]["Enums"]["campaign_experience_level"];
          safety_acknowledged: boolean;
          status: Database["public"]["Enums"]["campaign_application_status"];
          submitted_at: string;
          accepted_at: string | null;
          declined_at: string | null;
          withdrawn_at: string | null;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          user_id: string;
          motivation: string;
          availability: string;
          experience_level: Database["public"]["Enums"]["campaign_experience_level"];
          safety_acknowledged?: boolean;
          status?: Database["public"]["Enums"]["campaign_application_status"];
          submitted_at?: string;
          accepted_at?: string | null;
          declined_at?: string | null;
          withdrawn_at?: string | null;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      campaign_members: {
        Row: {
          campaign_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["campaign_member_role"];
          status: Database["public"]["Enums"]["campaign_membership_status"];
          joined_at: string;
          ended_at: string | null;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["campaign_member_role"];
          status?: Database["public"]["Enums"]["campaign_membership_status"];
          joined_at?: string;
          ended_at?: string | null;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      passport_entries: {
        Row: {
          id: string;
          user_id: string;
          activity_kind: Database["public"]["Enums"]["passport_activity_kind"];
          source_module: Database["public"]["Enums"]["passport_source_module"];
          source_record_id: string;
          source_title: string;
          occurred_at: string;
          status: Database["public"]["Enums"]["passport_entry_status"];
          verified_at: string;
          verified_by: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
          revocation_kind:
            Database["public"]["Enums"]["passport_revocation_kind"] | null;
          revocation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_kind: Database["public"]["Enums"]["passport_activity_kind"];
          source_module: Database["public"]["Enums"]["passport_source_module"];
          source_record_id: string;
          source_title: string;
          occurred_at: string;
          status?: Database["public"]["Enums"]["passport_entry_status"];
          verified_at?: string;
          verified_by?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          revocation_kind?:
            Database["public"]["Enums"]["passport_revocation_kind"] | null;
          revocation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      member_feedback: {
        Row: {
          id: string;
          user_id: string;
          area: Database["public"]["Enums"]["feedback_area"];
          message: string;
          consent_to_contact: boolean;
          status: Database["public"]["Enums"]["feedback_status"];
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          area: Database["public"]["Enums"]["feedback_area"];
          message: string;
          consent_to_contact?: boolean;
          status?: Database["public"]["Enums"]["feedback_status"];
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_user_id: string;
          target_type: Database["public"]["Enums"]["report_target_type"];
          category: Database["public"]["Enums"]["report_category"];
          summary: string;
          details: string;
          context_url: string | null;
          status: Database["public"]["Enums"]["report_status"];
          assigned_to: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_user_id: string;
          target_type: Database["public"]["Enums"]["report_target_type"];
          category: Database["public"]["Enums"]["report_category"];
          summary: string;
          details: string;
          context_url?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          assigned_to?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          title: string;
          body: string;
          action_url: string | null;
          dedupe_key: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          title: string;
          body: string;
          action_url?: string | null;
          dedupe_key?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      profile_follows: {
        Row: { follower_id: string; followed_id: string; created_at: string };
        Insert: {
          follower_id: string;
          followed_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      profile_friendships: {
        Row: {
          user_id_a: string;
          user_id_b: string;
          requested_by: string;
          status: Database["public"]["Enums"]["friendship_status"];
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          user_id_a: string;
          user_id_b: string;
          requested_by: string;
          status?: Database["public"]["Enums"]["friendship_status"];
          created_at?: string;
          responded_at?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      profile_blocks: {
        Row: {
          blocker_id: string;
          blocked_id: string;
          blocked_username: string | null;
          blocked_display_name: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profile_mutes: {
        Row: {
          muter_id: string;
          muted_id: string;
          muted_username: string | null;
          muted_display_name: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profile_blocked_words: {
        Row: { id: string; user_id: string; word: string; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profile_statuses: {
        Row: {
          user_id: string;
          status_text: string;
          expires_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      profile_featured_connections: {
        Row: {
          owner_id: string;
          featured_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      set_spotlight_category: {
  Args: {
    p_spotlight_category: string;
  };
  Returns: undefined;
};
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
      get_or_create_direct_conversation: {
  Args: {
    p_target_user_id: string;
  };
  Returns: string;
};

send_direct_message: {
  Args: {
    p_conversation_id: string;
    p_body: string;
  };
  Returns: string;
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
          p_is_paid: boolean;
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
      can_manage_realm_campaign: {
        Args: { p_campaign_id: string };
        Returns: boolean;
      };
      can_view_realm_campaign: {
        Args: { p_campaign_id: string };
        Returns: boolean;
      };
      is_campaign_member: {
        Args: { p_campaign_id: string };
        Returns: boolean;
      };
      update_profile_room_layer_colors: {
        Args: {
          p_accessory_color: string;
          p_bookshelf_color: string;
          p_couch_color: string;
          p_door_color: string;
          p_floor_color: string;
          p_tv_color: string;
        };
        Returns: undefined;
      };
      create_realm_campaign: {
        Args: {
          p_circle_id: string | null;
          p_title: string;
          p_summary: string;
          p_premise: string;
          p_genre: string;
          p_tone: string;
          p_safety_expectations: string;
          p_format: Database["public"]["Enums"]["participation_format"];
          p_location_label: string | null;
          p_schedule_summary: string;
          p_timezone: string;
          p_estimated_session_minutes: number;
          p_application_deadline_local: string;
          p_player_capacity: number;
          p_experience_level: Database["public"]["Enums"]["campaign_experience_level"];
          p_mode_id: string;
          p_minimum_energy: number;
          p_maximum_energy: number;
          p_stimulation_level: Database["public"]["Enums"]["pulse_stimulation_level"];
          p_social_intensity: Database["public"]["Enums"]["pulse_social_intensity"];
          p_interest_ids: string[];
        };
        Returns: string;
      };
      set_realm_campaign_status: {
        Args: {
          p_campaign_id: string;
          p_status: Database["public"]["Enums"]["realm_campaign_status"];
        };
        Returns: undefined;
      };
      submit_campaign_application: {
        Args: {
          p_campaign_id: string;
          p_motivation: string;
          p_availability: string;
          p_experience_level: Database["public"]["Enums"]["campaign_experience_level"];
          p_safety_acknowledged: boolean;
        };
        Returns: undefined;
      };
      withdraw_campaign_application: {
        Args: { p_campaign_id: string };
        Returns: undefined;
      };
      review_campaign_application: {
        Args: { p_campaign_id: string; p_user_id: string; p_decision: string };
        Returns: undefined;
      };
      leave_realm_campaign: {
        Args: { p_campaign_id: string };
        Returns: undefined;
      };
      remove_campaign_member: {
        Args: { p_campaign_id: string; p_user_id: string };
        Returns: undefined;
      };
      get_realm_campaign_roster: {
        Args: { p_campaign_id: string };
        Returns: Array<{
          user_id: string;
          display_name: string;
          username: string | null;
          member_role: Database["public"]["Enums"]["campaign_member_role"];
          membership_status: Database["public"]["Enums"]["campaign_membership_status"];
          joined_at: string;
        }>;
      };
      get_realm_campaign_applications: {
        Args: { p_campaign_id: string };
        Returns: Array<{
          user_id: string;
          display_name: string;
          username: string | null;
          motivation: string;
          availability: string;
          experience_level: Database["public"]["Enums"]["campaign_experience_level"];
          application_status: Database["public"]["Enums"]["campaign_application_status"];
          submitted_at: string;
        }>;
      };
      set_session_campaign: {
        Args: { p_session_id: string; p_campaign_id: string | null };
        Returns: undefined;
      };
      revoke_passport_entry: {
        Args: { p_entry_id: string; p_reason: string };
        Returns: undefined;
      };
      submit_feedback: {
        Args: {
          p_area: Database["public"]["Enums"]["feedback_area"];
          p_message: string;
          p_consent_to_contact: boolean;
        };
        Returns: string;
      };
      submit_report: {
        Args: {
          p_target_type: Database["public"]["Enums"]["report_target_type"];
          p_category: Database["public"]["Enums"]["report_category"];
          p_summary: string;
          p_details: string;
          p_context_url: string | null;
        };
        Returns: string;
      };
      review_report: {
        Args: {
          p_report_id: string;
          p_status: Database["public"]["Enums"]["report_status"];
          p_note: string | null;
        };
        Returns: undefined;
      };
      review_feedback: {
        Args: {
          p_feedback_id: string;
          p_status: Database["public"]["Enums"]["feedback_status"];
        };
        Returns: undefined;
      };
      mark_notification_read: {
        Args: { p_notification_id: string };
        Returns: undefined;
      };
      mark_all_notifications_read: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      update_profile_settings: {
        Args: {
          p_username: string;
          p_display_name: string;
          p_bio: string | null;
          p_visibility: Database["public"]["Enums"]["profile_visibility"];
          p_discoverable: boolean;
          p_avatar_url: string | null;
          p_cover_image_url: string | null;
        };
        Returns: undefined;
      };
      update_profile_experience: {
        Args: {
          p_username: string;
          p_display_name: string;
          p_bio: string | null;
          p_visibility: Database["public"]["Enums"]["profile_visibility"];
          p_discoverable: boolean;
          p_avatar_url: string | null;
          p_cover_image_url: string | null;
          p_background_image_url: string | null;
          p_profile_accent_color: string;
          p_landscape_image_fit: "cover" | "contain";
          p_landscape_image_position_x: number;
          p_landscape_image_position_y: number;
          p_landscape_image_zoom: number;
          p_background_image_fit: "cover" | "contain";
          p_background_image_position_x: number;
          p_background_image_position_y: number;
          p_background_image_zoom: number;
          p_spotlight_title: string | null;
          p_spotlight_description: string | null;
          p_spotlight_url: string | null;
          p_profile_song_title: string | null;
          p_profile_song_artist: string | null;
          p_profile_song_url: string | null;
          p_latest_pick_category: string | null;
          p_latest_pick_title: string | null;
          p_latest_pick_note: string | null;
          p_latest_pick_url: string | null;
          p_mood: string | null;
          p_view_my_label: string | null;
          p_view_my_url: string | null;
        };
        Returns: undefined;
      };
      update_profile_room: {
        Args: {
          p_enabled: boolean;
          p_wall_color: string;
          p_lighting_theme: "cosmic" | "warm" | "daylight" | "midnight";
          p_current_vibe:
            "chill" | "focused" | "gaming" | "creative" | "social";
          p_character_color: string;
          p_head_accessory:
            | "none"
            | "headphones"
            | "beanie"
            | "bow"
            | "hat"
            | "crown"
            | "flower"
            | "headband";
          p_face_accessory: "none" | "glasses" | "sunglasses";
          p_neck_accessory: "none" | "scarf" | "bandana";
          p_motion_enabled: boolean;
        };
        Returns: undefined;
      };
      get_profile_room: {
        Args: { p_user_id: string };
        Returns: {
          accessory_color: string;
          bookshelf_color: string;
          character_accessory: string;
          character_color: string;
          character_expression: string;
          character_shape: string;
          couch_color: string;
          current_vibe: "chill" | "focused" | "gaming" | "creative" | "social";
          door_color: string;
          enabled: boolean;
          face_accessory: "none" | "glasses" | "sunglasses";
          floor_color: string;
          head_accessory:
            | "none"
            | "headphones"
            | "beanie"
            | "bow"
            | "hat"
            | "crown"
            | "flower"
            | "headband";
          lighting_theme: "cosmic" | "warm" | "daylight" | "midnight";
          motion_enabled: boolean;
          neck_accessory: "none" | "scarf" | "bandana";
          profile_song_artist: string;
          profile_song_title: string;
          profile_song_url: string;
          tv_color: string;
          wall_color: string;
        }[];
      };
      set_profile_status: {
        Args: { p_status_text: string };
        Returns: undefined;
      };
      set_featured_connections: {
        Args: { p_featured_ids: string[] };
        Returns: undefined;
      };
      get_profile_experience: {
        Args: { p_user_id: string };
        Returns: Array<{
          background_image_url: string | null;
          profile_accent_color: string;
          status_text: string | null;
          status_expires_at: string | null;
          spotlight_title: string | null;
          spotlight_description: string | null;
          spotlight_url: string | null;
          friend_count: number;
          follower_count: number;
          following_count: number;
          landscape_image_fit: "cover" | "contain";
          landscape_image_position_x: number;
          landscape_image_position_y: number;
          landscape_image_zoom: number;
          background_image_fit: "cover" | "contain";
          background_image_position_x: number;
          background_image_position_y: number;
          background_image_zoom: number;
          mood: string | null;
          last_seen_at: string | null;
          profile_view_count: number;
          view_my_label: string | null;
          view_my_url: string | null;
          profile_song_title: string | null;
          profile_song_artist: string | null;
          profile_song_url: string | null;
          latest_pick_category: string | null;
          latest_pick_title: string | null;
          latest_pick_note: string | null;
          latest_pick_url: string | null;
          featured_profile_image_url: string | null;
        }>;
      };
      touch_profile_presence: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      record_profile_view: {
        Args: { p_profile_id: string };
        Returns: boolean;
      };
      get_featured_connections: {
        Args: { p_owner_id: string };
        Returns: Array<{
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          display_order: number;
        }>;
      };
      set_profile_visibility: {
        Args: {
          p_visibility: Database["public"]["Enums"]["profile_visibility"];
        };
        Returns: undefined;
      };
      set_featured_profile_image: {
        Args: { p_featured_profile_image_url: string };
        Returns: undefined;
      };
set_profile_current_fields: {
  Args: {
    p_current_game: string | null;
    p_current_game_description: string | null;
    p_current_game_url: string | null;

    p_current_reading: string | null;
    p_current_reading_description: string | null;
    p_current_reading_url: string | null;

    p_current_food: string | null;
    p_current_food_description: string | null;
    p_current_food_url: string | null;
  };
  Returns: undefined;
};

set_second_featured_profile_image: {
  Args: {
    p_featured_profile_image_2_url: string;
  };
  Returns: undefined;
};
      get_public_profile: {
        Args: { p_username: string };
        Returns: Array<{
          id: string;
          username: string;
          display_name: string;
          pronouns: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_image_url: string | null;
          city: string | null;
          region: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"];
          created_at: string;
        }>;
      };
      get_member_profiles: {
        Args: { p_username?: string | null; p_discoverable_only?: boolean };
        Returns: Array<{
          id: string;
          username: string;
          display_name: string;
          pronouns: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_image_url: string | null;
          city: string | null;
          region: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"];
          friend_list_visibility: Database["public"]["Enums"]["friend_list_visibility"];
          discoverable: boolean;
          visibility: Database["public"]["Enums"]["profile_visibility"];
          created_at: string;
        }>;
      };
      follow_profile: {
        Args: { p_target_user_id: string };
        Returns: undefined;
      };
      unfollow_profile: {
        Args: { p_target_user_id: string };
        Returns: undefined;
      };
      remove_follower: {
        Args: { p_follower_user_id: string };
        Returns: undefined;
      };
      send_friend_request: {
        Args: { p_target_user_id: string };
        Returns: undefined;
      };
      accept_friend_request: {
        Args: { p_requester_user_id: string };
        Returns: undefined;
      };
      remove_friendship: {
        Args: { p_target_user_id: string };
        Returns: undefined;
      };
      block_profile: { Args: { p_target_user_id: string }; Returns: undefined };
      unblock_profile: {
        Args: { p_target_user_id: string };
        Returns: undefined;
      };
      mute_profile: { Args: { p_target_user_id: string }; Returns: undefined };
      unmute_profile: {
        Args: { p_target_user_id: string };
        Returns: undefined;
      };
      add_blocked_word: { Args: { p_word: string }; Returns: string };
      remove_blocked_word: { Args: { p_word_id: string }; Returns: undefined };
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
      location_visibility: "hidden" | "city_region" | "region_only";
      friend_list_visibility: "private" | "friends" | "members";
      friendship_status: "pending" | "accepted";
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
      realm_campaign_status:
        "draft" | "recruiting" | "active" | "completed" | "cancelled";
      campaign_experience_level: "new" | "comfortable" | "experienced";
      campaign_application_status:
        "submitted" | "accepted" | "declined" | "withdrawn";
      campaign_member_role: "game_master" | "player";
      campaign_membership_status: "active" | "left" | "removed";
      passport_activity_kind:
        | "attended_session"
        | "hosted_session"
        | "completed_opportunity"
        | "led_opportunity"
        | "completed_campaign"
        | "led_campaign";
      passport_source_module: "sessions" | "circles" | "commons" | "realm";
      passport_entry_status: "verified" | "revoked";
      passport_revocation_kind: "source_correction" | "administrative";
      feedback_area:
        | "platform"
        | "pulse"
        | "sessions"
        | "circles"
        | "commons"
        | "realm"
        | "passport"
        | "accessibility"
        | "safety";
      feedback_status: "submitted" | "reviewed" | "closed";
      report_target_type:
        | "member"
        | "session"
        | "circle"
        | "opportunity"
        | "campaign"
        | "platform";
      report_category:
        | "harassment"
        | "hate_or_discrimination"
        | "threat_or_violence"
        | "sexual_content"
        | "spam_or_fraud"
        | "privacy"
        | "copyright_or_proprietary_content"
        | "other";
      report_status:
        "submitted" | "reviewing" | "escalated" | "resolved" | "dismissed";
      notification_kind:
        | "report_received"
        | "report_updated"
        | "circle_invitation"
        | "commons_response"
        | "realm_application"
        | "passport_activity"
        | "system"
        | "friend_request"
        | "friend_accepted"
        | "new_follower";
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
export type RealmCampaign =
  Database["public"]["Tables"]["realm_campaigns"]["Row"];
export type CampaignApplication =
  Database["public"]["Tables"]["campaign_applications"]["Row"];
export type CampaignMember =
  Database["public"]["Tables"]["campaign_members"]["Row"];
export type PassportEntry =
  Database["public"]["Tables"]["passport_entries"]["Row"];
export type MemberFeedback =
  Database["public"]["Tables"]["member_feedback"]["Row"];
export type SafetyReport = Database["public"]["Tables"]["reports"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
