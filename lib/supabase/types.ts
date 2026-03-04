export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          preview: string | null
          profile_id: string | null
          requires_action: boolean | null
          source_id: string
          source_table: string
          title: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          preview?: string | null
          profile_id?: string | null
          requires_action?: boolean | null
          source_id: string
          source_table: string
          title: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          preview?: string | null
          profile_id?: string | null
          requires_action?: boolean | null
          source_id?: string
          source_table?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          created_at: string | null
          id: string
          ip: string | null
          landing_page: string | null
          referrer_url: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          created_at?: string | null
          id?: string
          ip?: string | null
          landing_page?: string | null
          referrer_url?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          created_at?: string | null
          id?: string
          ip?: string | null
          landing_page?: string | null
          referrer_url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          }
        ]
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount_cents: number
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          paid_at: string | null
          status: string | null
        }
        Insert: {
          affiliate_id: string
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: string | null
        }
        Update: {
          affiliate_id?: string
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          }
        ]
      }
      affiliates: {
        Row: {
          commission_percent: number
          coupon_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payout_info: Json | null
          total_clicks: number | null
          total_commission_cents: number | null
          total_conversions: number | null
          total_revenue_cents: number | null
          tracking_code: string
          updated_at: string | null
        }
        Insert: {
          commission_percent?: number
          coupon_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payout_info?: Json | null
          total_clicks?: number | null
          total_commission_cents?: number | null
          total_conversions?: number | null
          total_revenue_cents?: number | null
          tracking_code: string
          updated_at?: string | null
        }
        Update: {
          commission_percent?: number
          coupon_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payout_info?: Json | null
          total_clicks?: number | null
          total_commission_cents?: number | null
          total_conversions?: number | null
          total_revenue_cents?: number | null
          tracking_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_prompt_templates: {
        Row: {
          caption_template_id: string | null
          category: string | null
          created_at: string | null
          default_funnel_stage: string | null
          default_model: string | null
          default_temperature: number | null
          default_triggers: string[] | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_builtin: boolean | null
          name: string
          output_format: string | null
          pipeline_type: string | null
          platform: string | null
          slug: string
          sort_order: number | null
          system_prompt: string
          updated_at: string | null
          usage_count: number | null
          user_prompt_template: string | null
          variables: Json | null
        }
        Insert: {
          caption_template_id?: string | null
          category?: string | null
          created_at?: string | null
          default_funnel_stage?: string | null
          default_model?: string | null
          default_temperature?: number | null
          default_triggers?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_builtin?: boolean | null
          name: string
          output_format?: string | null
          pipeline_type?: string | null
          platform?: string | null
          slug: string
          sort_order?: number | null
          system_prompt: string
          updated_at?: string | null
          usage_count?: number | null
          user_prompt_template?: string | null
          variables?: Json | null
        }
        Update: {
          caption_template_id?: string | null
          category?: string | null
          created_at?: string | null
          default_funnel_stage?: string | null
          default_model?: string | null
          default_temperature?: number | null
          default_triggers?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_builtin?: boolean | null
          name?: string
          output_format?: string | null
          pipeline_type?: string | null
          platform?: string | null
          slug?: string
          sort_order?: number | null
          system_prompt?: string
          updated_at?: string | null
          usage_count?: number | null
          user_prompt_template?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_templates_caption_template_id_fkey"
            columns: ["caption_template_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_system_prompts: {
        Row: {
          content_format: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          max_tokens: number | null
          model: string | null
          platform: string | null
          prompt_key: string
          prompt_type: string
          system_prompt: string
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          content_format?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_tokens?: number | null
          model?: string | null
          platform?: string | null
          prompt_key: string
          prompt_type: string
          system_prompt: string
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          content_format?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_tokens?: number | null
          model?: string | null
          platform?: string | null
          prompt_key?: string
          prompt_type?: string
          system_prompt?: string
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          actions_executed: Json | null
          created_at: string | null
          error: string | null
          id: string
          profile_id: string | null
          rule_id: string
          status: string | null
          trigger_data: Json | null
          trigger_event: string
        }
        Insert: {
          actions_executed?: Json | null
          created_at?: string | null
          error?: string | null
          id?: string
          profile_id?: string | null
          rule_id: string
          status?: string | null
          trigger_data?: Json | null
          trigger_event: string
        }
        Update: {
          actions_executed?: Json | null
          created_at?: string | null
          error?: string | null
          id?: string
          profile_id?: string | null
          rule_id?: string
          status?: string | null
          trigger_data?: Json | null
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          run_count: number | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          actions: Json
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          run_count?: number | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          run_count?: number | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bot_commands: {
        Row: {
          buttons: Json | null
          command: string
          created_at: string | null
          description_de: string | null
          description_ru: string | null
          id: string
          is_editable: boolean
          is_enabled: boolean
          response_de: string
          response_ru: string
          sort_order: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          buttons?: Json | null
          command: string
          created_at?: string | null
          description_de?: string | null
          description_ru?: string | null
          id?: string
          is_editable?: boolean
          is_enabled?: boolean
          response_de?: string
          response_ru?: string
          sort_order?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          buttons?: Json | null
          command?: string
          created_at?: string | null
          description_de?: string | null
          description_ru?: string | null
          id?: string
          is_editable?: boolean
          is_enabled?: boolean
          response_de?: string
          response_ru?: string
          sort_order?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bot_faq_rules: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean
          keywords: string[]
          priority: number
          response_de: string
          response_ru: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          keywords: string[]
          priority?: number
          response_de?: string
          response_ru?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          keywords?: string[]
          priority?: number
          response_de?: string
          response_ru?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bot_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          channel: string
          created_at: string | null
          error: string | null
          id: string
          profile_id: string | null
          recipient_chat_id: number | null
          recipient_email: string | null
          recipient_wa_phone: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          broadcast_id: string
          channel: string
          created_at?: string | null
          error?: string | null
          id?: string
          profile_id?: string | null
          recipient_chat_id?: number | null
          recipient_email?: string | null
          recipient_wa_phone?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          broadcast_id?: string
          channel?: string
          created_at?: string | null
          error?: string | null
          id?: string
          profile_id?: string | null
          recipient_chat_id?: number | null
          recipient_email?: string | null
          recipient_wa_phone?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_recipients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      broadcasts: {
        Row: {
          ai_model: string | null
          ai_prompt: string | null
          audience_filter: Json
          channels: string[]
          content_email: string | null
          content_telegram: string | null
          created_at: string | null
          created_by: string | null
          failed_count: number | null
          id: string
          language: string | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject_email: string | null
          title: string
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_prompt?: string | null
          audience_filter: Json
          channels: string[]
          content_email?: string | null
          content_telegram?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          language?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject_email?: string | null
          title: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_prompt?: string | null
          audience_filter?: Json
          channels?: string[]
          content_email?: string | null
          content_telegram?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_count?: number | null
          id?: string
          language?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject_email?: string | null
          title?: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      click_events: {
        Row: {
          created_at: string
          element_href: string | null
          element_id: string | null
          element_tag: string | null
          element_text: string | null
          id: string
          page_path: string
          section: string | null
          session_id: string | null
          viewport_w: number | null
          x_percent: number | null
          y_percent: number | null
        }
        Insert: {
          created_at?: string
          element_href?: string | null
          element_id?: string | null
          element_tag?: string | null
          element_text?: string | null
          id?: string
          page_path: string
          section?: string | null
          session_id?: string | null
          viewport_w?: number | null
          x_percent?: number | null
          y_percent?: number | null
        }
        Update: {
          created_at?: string
          element_href?: string | null
          element_id?: string | null
          element_tag?: string | null
          element_text?: string | null
          id?: string
          page_path?: string
          section?: string | null
          session_id?: string | null
          viewport_w?: number | null
          x_percent?: number | null
          y_percent?: number | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          language: string | null
          message: string
          name: string
          phone: string | null
          status: string | null
          topic: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          language?: string | null
          message: string
          name: string
          phone?: string | null
          status?: string | null
          topic?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          language?: string | null
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          topic?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          notes: string | null
          platforms: string[] | null
          post_id: string
          scheduled_date: string
          scheduled_time: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          platforms?: string[] | null
          post_id: string
          scheduled_date: string
          scheduled_time?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          platforms?: string[] | null
          post_id?: string
          scheduled_date?: string
          scheduled_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      content_competitors: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_scraped_at: string | null
          name: string
          notes: string | null
          scrape_config: Json | null
          scrape_frequency: string | null
          social_accounts: Json | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          name: string
          notes?: string | null
          scrape_config?: Json | null
          scrape_frequency?: string | null
          social_accounts?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          name?: string
          notes?: string | null
          scrape_config?: Json | null
          scrape_frequency?: string | null
          social_accounts?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      content_core_memory: {
        Row: {
          created_at: string | null
          id: string
          is_pinned: boolean | null
          last_updated_at: string | null
          memory_key: string
          memory_value: string
          update_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          last_updated_at?: string | null
          memory_key: string
          memory_value: string
          update_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          last_updated_at?: string | null
          memory_key?: string
          memory_value?: string
          update_count?: number | null
        }
        Relationships: []
      }
      content_intel: {
        Row: {
          ai_cta_analysis: string | null
          ai_funnel_stage: string | null
          ai_hook_analysis: string | null
          ai_manychat_detected: boolean | null
          ai_manychat_keyword: string | null
          ai_strategy_notes: string | null
          ai_summary: string | null
          ai_topics: string[] | null
          ai_triggers_detected: string[] | null
          competitor_id: string
          content: string | null
          content_format: string | null
          created_at: string | null
          engagement_data: Json | null
          id: string
          inspired_post_id: string | null
          is_bookmarked: boolean | null
          is_used_as_inspiration: boolean | null
          media_type: string | null
          media_urls: string[] | null
          posted_at: string | null
          scraped_at: string | null
          source_platform: string
          source_url: string | null
          title: string | null
        }
        Insert: {
          ai_cta_analysis?: string | null
          ai_funnel_stage?: string | null
          ai_hook_analysis?: string | null
          ai_manychat_detected?: boolean | null
          ai_manychat_keyword?: string | null
          ai_strategy_notes?: string | null
          ai_summary?: string | null
          ai_topics?: string[] | null
          ai_triggers_detected?: string[] | null
          competitor_id: string
          content?: string | null
          content_format?: string | null
          created_at?: string | null
          engagement_data?: Json | null
          id?: string
          inspired_post_id?: string | null
          is_bookmarked?: boolean | null
          is_used_as_inspiration?: boolean | null
          media_type?: string | null
          media_urls?: string[] | null
          posted_at?: string | null
          scraped_at?: string | null
          source_platform: string
          source_url?: string | null
          title?: string | null
        }
        Update: {
          ai_cta_analysis?: string | null
          ai_funnel_stage?: string | null
          ai_hook_analysis?: string | null
          ai_manychat_detected?: boolean | null
          ai_manychat_keyword?: string | null
          ai_strategy_notes?: string | null
          ai_summary?: string | null
          ai_topics?: string[] | null
          ai_triggers_detected?: string[] | null
          competitor_id?: string
          content?: string | null
          content_format?: string | null
          created_at?: string | null
          engagement_data?: Json | null
          id?: string
          inspired_post_id?: string | null
          is_bookmarked?: boolean | null
          is_used_as_inspiration?: boolean | null
          media_type?: string | null
          media_urls?: string[] | null
          posted_at?: string | null
          scraped_at?: string | null
          source_platform?: string
          source_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_intel_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "content_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_intel_inspired_post_id_fkey"
            columns: ["inspired_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      content_leads: {
        Row: {
          created_at: string | null
          id: string
          keyword_used: string | null
          manychat_subscriber_id: string | null
          metadata: Json | null
          post_id: string
          profile_id: string | null
          source: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyword_used?: string | null
          manychat_subscriber_id?: string | null
          metadata?: Json | null
          post_id: string
          profile_id?: string | null
          source?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          keyword_used?: string | null
          manychat_subscriber_id?: string | null
          metadata?: Json | null
          post_id?: string
          profile_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_leads_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      content_memories: {
        Row: {
          access_count: number | null
          confidence: number | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          memory_type: string
          source_id: string | null
          source_type: string
          tags: string[] | null
        }
        Insert: {
          access_count?: number | null
          confidence?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_type: string
          source_id?: string | null
          source_type: string
          tags?: string[] | null
        }
        Update: {
          access_count?: number | null
          confidence?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          memory_type?: string
          source_id?: string | null
          source_type?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      content_posts: {
        Row: {
          ai_model: string | null
          ai_prompt: string | null
          ai_template_id: string | null
          body: string | null
          category: string | null
          content_type: string
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          funnel_stage: string | null
          generation_history: Json | null
          hashtags: string[] | null
          id: string
          inspired_by_intel_id: string | null
          language: string | null
          manychat_conversions: number | null
          manychat_dm_link: string | null
          manychat_dm_text: string | null
          manychat_enabled: boolean | null
          manychat_flow_id: string | null
          manychat_keyword: string | null
          manychat_platform: string | null
          media_urls: string[] | null
          platform_variants: Json | null
          published_at: string | null
          scheduled_at: string | null
          status: string
          tags: string[] | null
          target_platforms: string[] | null
          title: string
          triggers_used: string[] | null
          updated_at: string | null
          updated_by: string | null
          value_ladder_stage: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_prompt?: string | null
          ai_template_id?: string | null
          body?: string | null
          category?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          funnel_stage?: string | null
          generation_history?: Json | null
          hashtags?: string[] | null
          id?: string
          inspired_by_intel_id?: string | null
          language?: string | null
          manychat_conversions?: number | null
          manychat_dm_link?: string | null
          manychat_dm_text?: string | null
          manychat_enabled?: boolean | null
          manychat_flow_id?: string | null
          manychat_keyword?: string | null
          manychat_platform?: string | null
          media_urls?: string[] | null
          platform_variants?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          tags?: string[] | null
          target_platforms?: string[] | null
          title: string
          triggers_used?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          value_ladder_stage?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_prompt?: string | null
          ai_template_id?: string | null
          body?: string | null
          category?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          funnel_stage?: string | null
          generation_history?: Json | null
          hashtags?: string[] | null
          id?: string
          inspired_by_intel_id?: string | null
          language?: string | null
          manychat_conversions?: number | null
          manychat_dm_link?: string | null
          manychat_dm_text?: string | null
          manychat_enabled?: boolean | null
          manychat_flow_id?: string | null
          manychat_keyword?: string | null
          manychat_platform?: string | null
          media_urls?: string[] | null
          platform_variants?: Json | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          tags?: string[] | null
          target_platforms?: string[] | null
          title?: string
          triggers_used?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          value_ladder_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_ai_template_id_fkey"
            columns: ["ai_template_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_inspired_by_intel_id_fkey"
            columns: ["inspired_by_intel_id"]
            isOneToOne: false
            referencedRelation: "content_intel"
            referencedColumns: ["id"]
          }
        ]
      }
      content_relationships: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          relation: string
          source_id: string
          source_type: string
          strength: number | null
          target_id: string
          target_type: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          relation: string
          source_id: string
          source_type: string
          strength?: number | null
          target_id: string
          target_type: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          relation?: string
          source_id?: string
          source_type?: string
          strength?: number | null
          target_id?: string
          target_type?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      content_triggers: {
        Row: {
          color: string | null
          created_at: string | null
          description: string
          examples: string | null
          funnel_stages: string[] | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          prompt_snippet: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description: string
          examples?: string | null
          funnel_stages?: string[] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prompt_snippet: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string
          examples?: string | null
          funnel_stages?: string[] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prompt_snippet?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          coupon_id: string | null
          email: string
          id: string
          order_id: string | null
          profile_id: string | null
          used_at: string | null
        }
        Insert: {
          coupon_id?: string | null
          email: string
          id?: string
          order_id?: string | null
          profile_id?: string | null
          used_at?: string | null
        }
        Update: {
          coupon_id?: string | null
          email?: string
          id?: string
          order_id?: string | null
          profile_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          affiliate_id: string | null
          applies_to: string | null
          code: string
          created_at: string | null
          id: string
          max_uses: number | null
          purpose: string | null
          stripe_coupon_id: string | null
          stripe_promotion_code_id: string | null
          type: string
          updated_at: string | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          active?: boolean | null
          affiliate_id?: string | null
          applies_to?: string | null
          code: string
          created_at?: string | null
          id?: string
          max_uses?: number | null
          purpose?: string | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          type: string
          updated_at?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          active?: boolean | null
          affiliate_id?: string | null
          applies_to?: string | null
          code?: string
          created_at?: string | null
          id?: string
          max_uses?: number | null
          purpose?: string | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          type?: string
          updated_at?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_notes: {
        Row: {
          admin_id: string | null
          content: string
          created_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          admin_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          admin_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          field_key: string
          field_type: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          label_de: string
          label_ru: string
          options: Json | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          field_key: string
          field_type: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          label_de: string
          label_ru: string
          options?: Json | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          field_key?: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          label_de?: string
          label_ru?: string
          options?: Json | null
          sort_order?: number | null
        }
        Relationships: []
      }
      custom_field_values: {
        Row: {
          created_at: string | null
          field_id: string
          id: string
          profile_id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          field_id: string
          id?: string
          profile_id: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          field_id?: string
          id?: string
          profile_id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          }
        ]
      }
      deals: {
        Row: {
          created_at: string | null
          currency: string | null
          expected_close_date: string | null
          id: string
          lost_at: string | null
          lost_reason: string | null
          notes: string | null
          probability: number | null
          product_id: string | null
          profile_id: string
          stage: string
          title: string
          updated_at: string | null
          value_cents: number
          won_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          notes?: string | null
          probability?: number | null
          product_id?: string | null
          profile_id: string
          stage?: string
          title: string
          updated_at?: string | null
          value_cents?: number
          won_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          notes?: string | null
          probability?: number | null
          product_id?: string | null
          profile_id?: string
          stage?: string
          title?: string
          updated_at?: string | null
          value_cents?: number
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      deliverables: {
        Row: {
          created_at: string | null
          expires_at: string | null
          file_type: string | null
          file_url: string
          id: string
          profile_id: string
          session_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          profile_id: string
          session_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          profile_id?: string
          session_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      email_log: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          profile_id: string | null
          resend_id: string | null
          status: string
          subject: string
          template: string
          to_email: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string | null
          resend_id?: string | null
          status?: string
          subject: string
          template: string
          to_email: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string | null
          resend_id?: string | null
          status?: string
          subject?: string
          template?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      email_sequence_enrollments: {
        Row: {
          completed_at: string | null
          current_step: number | null
          email: string
          enrolled_at: string | null
          id: string
          lead_id: string | null
          next_send_at: string | null
          profile_id: string | null
          sequence_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number | null
          email: string
          enrolled_at?: string | null
          id?: string
          lead_id?: string | null
          next_send_at?: string | null
          profile_id?: string | null
          sequence_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number | null
          email?: string
          enrolled_at?: string | null
          id?: string
          lead_id?: string | null
          next_send_at?: string | null
          profile_id?: string | null
          sequence_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      email_sequence_steps: {
        Row: {
          content_html: string
          content_html_ru: string | null
          content_telegram: string | null
          content_telegram_ru: string | null
          created_at: string | null
          delay_days: number
          delay_hours: number
          id: string
          is_active: boolean | null
          send_telegram: boolean | null
          sequence_id: string
          step_order: number
          subject: string
          subject_ru: string | null
        }
        Insert: {
          content_html: string
          content_html_ru?: string | null
          content_telegram?: string | null
          content_telegram_ru?: string | null
          created_at?: string | null
          delay_days?: number
          delay_hours?: number
          id?: string
          is_active?: boolean | null
          send_telegram?: boolean | null
          sequence_id: string
          step_order: number
          subject: string
          subject_ru?: string | null
        }
        Update: {
          content_html?: string
          content_html_ru?: string | null
          content_telegram?: string | null
          content_telegram_ru?: string | null
          created_at?: string | null
          delay_days?: number
          delay_hours?: number
          id?: string
          is_active?: boolean | null
          send_telegram?: boolean | null
          sequence_id?: string
          step_order?: number
          subject?: string
          subject_ru?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          }
        ]
      }
      email_sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
          trigger_filter: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event: string
          trigger_filter?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
          trigger_filter?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      instagram_messages: {
        Row: {
          created_at: string | null
          direction: string
          id: string
          ig_message_id: string | null
          message_text: string | null
          message_type: string | null
          metadata: Json | null
          profile_id: string | null
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          direction: string
          id?: string
          ig_message_id?: string | null
          message_text?: string | null
          message_type?: string | null
          metadata?: Json | null
          profile_id?: string | null
          sender_id: string
        }
        Update: {
          created_at?: string | null
          direction?: string
          id?: string
          ig_message_id?: string | null
          message_text?: string | null
          message_type?: string | null
          metadata?: Json | null
          profile_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_chunks: {
        Row: {
          chapter: string | null
          chunk_index: number
          content: string
          created_at: string
          id: string
          page_number: number | null
          pinecone_id: string
          source_id: string
          source_name: string
          topic: string | null
        }
        Insert: {
          chapter?: string | null
          chunk_index: number
          content: string
          created_at?: string
          id?: string
          page_number?: number | null
          pinecone_id: string
          source_id: string
          source_name: string
          topic?: string | null
        }
        Update: {
          chapter?: string | null
          chunk_index?: number
          content?: string
          created_at?: string
          id?: string
          page_number?: number | null
          pinecone_id?: string
          source_id?: string
          source_name?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_sources: {
        Row: {
          author: string | null
          chunk_count: number | null
          created_at: string
          error_message: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_type: string
          id: string
          language: string
          method: string | null
          processed_at: string | null
          source_name: string
          status: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          chunk_count?: number | null
          created_at?: string
          error_message?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          language?: string
          method?: string | null
          processed_at?: string | null
          source_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          chunk_count?: number | null
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          language?: string
          method?: string | null
          processed_at?: string | null
          source_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          birthdate: string | null
          converted: boolean | null
          created_at: string | null
          email: string
          email_unsubscribed: boolean
          email_verified: boolean | null
          id: string
          language: string | null
          marketing_consent: boolean | null
          matrix_data: Json | null
          profile_id: string | null
          source: string | null
          unsubscribe_token: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          birthdate?: string | null
          converted?: boolean | null
          created_at?: string | null
          email: string
          email_unsubscribed?: boolean
          email_verified?: boolean | null
          id?: string
          language?: string | null
          marketing_consent?: boolean | null
          matrix_data?: Json | null
          profile_id?: string | null
          source?: string | null
          unsubscribe_token?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          birthdate?: string | null
          converted?: boolean | null
          created_at?: string | null
          email?: string
          email_unsubscribed?: boolean
          email_verified?: boolean | null
          id?: string
          language?: string | null
          marketing_consent?: boolean | null
          matrix_data?: Json | null
          profile_id?: string | null
          source?: string | null
          unsubscribe_token?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      meta_capi_events: {
        Row: {
          email_hash: string | null
          event_data: Json | null
          event_id: string
          event_name: string
          id: string
          profile_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          email_hash?: string | null
          event_data?: Json | null
          event_id: string
          event_name: string
          id?: string
          profile_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          email_hash?: string | null
          event_data?: Json | null
          event_id?: string
          event_name?: string
          id?: string
          profile_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_capi_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          customer_email: string
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          product_id: string | null
          profile_id: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          customer_email: string
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          product_id?: string | null
          profile_id?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          product_id?: string | null
          profile_id?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      page_views: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          duration_ms: number | null
          id: string
          is_bounce: boolean
          language: string | null
          os: string | null
          page_path: string
          referrer: string | null
          screen_h: number | null
          screen_w: number | null
          session_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          viewport_w: number | null
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          is_bounce?: boolean
          language?: string | null
          os?: string | null
          page_path: string
          referrer?: string | null
          screen_h?: number | null
          screen_w?: number | null
          session_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_w?: number | null
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          is_bounce?: boolean
          language?: string | null
          os?: string | null
          page_path?: string
          referrer?: string | null
          screen_h?: number | null
          screen_w?: number | null
          session_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          viewport_w?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description_de: string | null
          description_ru: string | null
          duration_minutes: number | null
          features_de: Json | null
          features_ru: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name_de: string
          name_ru: string | null
          package_key: string | null
          price_cents: number
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description_de?: string | null
          description_ru?: string | null
          duration_minutes?: number | null
          features_de?: Json | null
          features_ru?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name_de: string
          name_ru?: string | null
          package_key?: string | null
          price_cents: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description_de?: string | null
          description_ru?: string | null
          duration_minutes?: number | null
          features_de?: Json | null
          features_ru?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name_de?: string
          name_ru?: string | null
          package_key?: string | null
          price_cents?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          created_at: string | null
          crm_status: string | null
          deletion_requested_at: string | null
          email: string
          email_unsubscribed: boolean
          full_name: string | null
          id: string
          instagram_sender_id: string | null
          language: string | null
          last_activity_at: string | null
          lead_score: number | null
          lead_score_updated_at: string | null
          marketing_consent: boolean
          marketing_consent_at: string | null
          notes: string | null
          phone: string | null
          preferred_channel: string | null
          referral_code: string | null
          source: string | null
          tags: string[] | null
          team_role_id: string | null
          telegram_chat_id: number | null
          unsubscribe_token: string
          updated_at: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          crm_status?: string | null
          deletion_requested_at?: string | null
          email: string
          email_unsubscribed?: boolean
          full_name?: string | null
          id: string
          instagram_sender_id?: string | null
          language?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_score_updated_at?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          notes?: string | null
          phone?: string | null
          preferred_channel?: string | null
          referral_code?: string | null
          source?: string | null
          tags?: string[] | null
          team_role_id?: string | null
          telegram_chat_id?: number | null
          unsubscribe_token?: string
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          crm_status?: string | null
          deletion_requested_at?: string | null
          email?: string
          email_unsubscribed?: boolean
          full_name?: string | null
          id?: string
          instagram_sender_id?: string | null
          language?: string | null
          last_activity_at?: string | null
          lead_score?: number | null
          lead_score_updated_at?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          notes?: string | null
          phone?: string | null
          preferred_channel?: string | null
          referral_code?: string | null
          source?: string | null
          tags?: string[] | null
          team_role_id?: string | null
          telegram_chat_id?: number | null
          unsubscribe_token?: string
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_role_id_fkey"
            columns: ["team_role_id"]
            isOneToOne: false
            referencedRelation: "team_roles"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string | null
          id: string
          referred_profile_id: string | null
          referrer_profile_id: string | null
          reward_coupon_id: string | null
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          referred_profile_id?: string | null
          referrer_profile_id?: string | null
          reward_coupon_id?: string | null
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          referred_profile_id?: string | null
          referrer_profile_id?: string | null
          reward_coupon_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_profile_id_fkey"
            columns: ["referrer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_profile_id_fkey"
            columns: ["referred_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          admin_notes: string | null
          cal_booking_id: string | null
          cal_event_slug: string | null
          created_at: string | null
          duration_min: number | null
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          meeting_url: string | null
          notes: string | null
          order_id: string | null
          package_type: string | null
          platform: string | null
          profile_id: string
          recording_url: string | null
          reminder_sent_at: string | null
          scheduled_at: string | null
          session_type: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          cal_booking_id?: string | null
          cal_event_slug?: string | null
          created_at?: string | null
          duration_min?: number | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          meeting_url?: string | null
          notes?: string | null
          order_id?: string | null
          package_type?: string | null
          platform?: string | null
          profile_id: string
          recording_url?: string | null
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          session_type?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          cal_booking_id?: string | null
          cal_event_slug?: string | null
          created_at?: string | null
          duration_min?: number | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          meeting_url?: string | null
          notes?: string | null
          order_id?: string | null
          package_type?: string | null
          platform?: string | null
          profile_id?: string
          recording_url?: string | null
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          session_type?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      tag_rules: {
        Row: {
          auto_remove: boolean | null
          condition_type: string
          condition_value: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          tag_name: string
        }
        Insert: {
          auto_remove?: boolean | null
          condition_type: string
          condition_value: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tag_name: string
        }
        Update: {
          auto_remove?: boolean | null
          condition_type?: string
          condition_value?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tag_name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          priority: string
          profile_id: string | null
          source_id: string | null
          source_type: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority?: string
          profile_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          priority?: string
          profile_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      team_roles: {
        Row: {
          created_at: string | null
          id: string
          is_system: boolean | null
          label_de: string
          label_ru: string
          name: string
          permissions: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          label_de: string
          label_ru: string
          name: string
          permissions: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          label_de?: string
          label_ru?: string
          name?: string
          permissions?: string[]
        }
        Relationships: []
      }
      telegram_bot_state: {
        Row: {
          chat_id: number
          created_at: string | null
          data: Json | null
          expires_at: string
          state: string
        }
        Insert: {
          chat_id: number
          created_at?: string | null
          data?: Json | null
          expires_at: string
          state: string
        }
        Update: {
          chat_id?: number
          created_at?: string | null
          data?: Json | null
          expires_at?: string
          state?: string
        }
        Relationships: []
      }
      telegram_messages: {
        Row: {
          chat_id: number
          command: string | null
          created_at: string | null
          direction: string
          id: string
          payload: Json | null
        }
        Insert: {
          chat_id: number
          command?: string | null
          created_at?: string | null
          direction: string
          id?: string
          payload?: Json | null
        }
        Update: {
          chat_id?: number
          command?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          payload?: Json | null
        }
        Relationships: []
      }
      telegram_settings: {
        Row: {
          chat_id: number
          created_at: string | null
          locale: string
        }
        Insert: {
          chat_id: number
          created_at?: string | null
          locale?: string
        }
        Update: {
          chat_id?: number
          created_at?: string | null
          locale?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string | null
          direction: string
          id: string
          message_text: string | null
          metadata: Json | null
          profile_id: string | null
          status: string | null
          template_name: string | null
          wa_id: string
          wa_message_id: string | null
        }
        Insert: {
          created_at?: string | null
          direction: string
          id?: string
          message_text?: string | null
          metadata?: Json | null
          profile_id?: string | null
          status?: string | null
          template_name?: string | null
          wa_id: string
          wa_message_id?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string
          id?: string
          message_text?: string | null
          metadata?: Json | null
          profile_id?: string | null
          status?: string | null
          template_name?: string | null
          wa_id?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_score: {
        Args: {
            p_profile_id: string
        }
        Returns: undefined
      }
      increment_template_usage: {
        Args: {
            template_uuid: string
        }
        Returns: undefined
      }
      update_broadcast_stats: {
        Args: {
            broadcast_uuid: string
        }
        Returns: undefined
      }
      increment_manychat_conversions: {
        Args: {
            post_uuid: string
        }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: {
            coupon_uuid: string
        }
        Returns: undefined
      }
      source_conversion_stats: {
        Args: {

        }
        Returns: undefined
      }
      touch_content_memory: {
        Args: {
            memory_uuid: string
        }
        Returns: undefined
      }
      sequence_performance_stats: {
        Args: {

        }
        Returns: undefined
      }
      record_affiliate_conversion: {
        Args: {
            aff_uuid: string
            p_commission_cents: number
            p_revenue_cents: number
        }
        Returns: undefined
      }
      revenue_by_period: {
        Args: {
            end_date: string
            granularity?: string
            start_date: string
        }
        Returns: undefined
      }
      increment_affiliate_clicks: {
        Args: {
            aff_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
