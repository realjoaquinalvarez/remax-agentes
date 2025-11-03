/**
 * Database Types
 * Auto-generated from Supabase schema
 *
 * To regenerate, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          avatar_url: string | null
          phone: string | null
          status: 'active' | 'inactive' | 'pending'
          join_date: string
          facebook_page_id: string | null
          facebook_access_token: string | null
          facebook_page_name: string | null
          instagram_account_id: string | null
          instagram_username: string | null
          is_facebook_connected: boolean
          facebook_connected_at: string | null
          facebook_token_expires_at: string | null
          last_successful_sync: string | null
          last_sync_attempt: string | null
          consecutive_sync_failures: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          avatar_url?: string | null
          phone?: string | null
          status?: 'active' | 'inactive' | 'pending'
          join_date?: string
          facebook_page_id?: string | null
          facebook_access_token?: string | null
          facebook_page_name?: string | null
          instagram_account_id?: string | null
          instagram_username?: string | null
          is_facebook_connected?: boolean
          facebook_connected_at?: string | null
          facebook_token_expires_at?: string | null
          last_successful_sync?: string | null
          last_sync_attempt?: string | null
          consecutive_sync_failures?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          avatar_url?: string | null
          phone?: string | null
          status?: 'active' | 'inactive' | 'pending'
          join_date?: string
          facebook_page_id?: string | null
          facebook_access_token?: string | null
          facebook_page_name?: string | null
          instagram_account_id?: string | null
          instagram_username?: string | null
          is_facebook_connected?: boolean
          facebook_connected_at?: string | null
          facebook_token_expires_at?: string | null
          last_successful_sync?: string | null
          last_sync_attempt?: string | null
          consecutive_sync_failures?: number
          created_at?: string
          updated_at?: string
        }
      }
      facebook_metrics_daily: {
        Row: {
          id: string
          agent_id: string
          metric_date: string
          followers: number
          follower_growth_rate: number
          posts_count: number
          reach: number
          impressions: number
          impressions_organic: number
          impressions_paid: number
          total_engagements: number
          likes: number
          comments: number
          shares: number
          engagement_rate: number
          link_clicks: number
          post_clicks: number
          leads_estimated: number
          instagram_followers: number | null
          facebook_followers: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          metric_date: string
          followers?: number
          follower_growth_rate?: number
          posts_count?: number
          reach?: number
          impressions?: number
          impressions_organic?: number
          impressions_paid?: number
          total_engagements?: number
          likes?: number
          comments?: number
          shares?: number
          engagement_rate?: number
          link_clicks?: number
          post_clicks?: number
          leads_estimated?: number
          instagram_followers?: number | null
          facebook_followers?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          metric_date?: string
          followers?: number
          follower_growth_rate?: number
          posts_count?: number
          reach?: number
          impressions?: number
          impressions_organic?: number
          impressions_paid?: number
          total_engagements?: number
          likes?: number
          comments?: number
          shares?: number
          engagement_rate?: number
          link_clicks?: number
          post_clicks?: number
          leads_estimated?: number
          instagram_followers?: number | null
          facebook_followers?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sync_jobs: {
        Row: {
          id: string
          sync_type: 'manual_all' | 'manual_single' | 'manual_admin'
          status: 'pending' | 'running' | 'completed' | 'failed' | 'partial'
          agent_id: string | null
          triggered_by_user_id: string | null
          total_agents: number
          agents_synced: number
          agents_failed: number
          started_at: string | null
          completed_at: string | null
          duration_seconds: number | null
          error_message: string | null
          error_details: Json | null
          failed_agent_ids: string[] | null
          api_calls_made: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sync_type: 'manual_all' | 'manual_single' | 'manual_admin'
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'partial'
          agent_id?: string | null
          triggered_by_user_id?: string | null
          total_agents?: number
          agents_synced?: number
          agents_failed?: number
          started_at?: string | null
          completed_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          error_details?: Json | null
          failed_agent_ids?: string[] | null
          api_calls_made?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sync_type?: 'manual_all' | 'manual_single' | 'manual_admin'
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'partial'
          agent_id?: string | null
          triggered_by_user_id?: string | null
          total_agents?: number
          agents_synced?: number
          agents_failed?: number
          started_at?: string | null
          completed_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          error_details?: Json | null
          failed_agent_ids?: string[] | null
          api_calls_made?: number
          created_at?: string
          updated_at?: string
        }
      }
      api_rate_limits: {
        Row: {
          id: string
          hour_window: string
          calls_made: number
          max_calls_allowed: number
          last_call_at: string | null
          sync_job_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hour_window: string
          calls_made?: number
          max_calls_allowed?: number
          last_call_at?: string | null
          sync_job_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hour_window?: string
          calls_made?: number
          max_calls_allowed?: number
          last_call_at?: string | null
          sync_job_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_make_api_calls: {
        Args: {
          calls_needed?: number
        }
        Returns: boolean
      }
      increment_api_calls: {
        Args: {
          calls_made_count?: number
        }
        Returns: void
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_current_hour_window: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
