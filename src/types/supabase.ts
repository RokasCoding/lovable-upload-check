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
      content: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          page: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          page: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          page?: string
          content?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string | null
          role: 'admin' | 'user'
          total_points: number
          is_verified: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone?: string | null
          role?: 'admin' | 'user'
          total_points?: number
          is_verified?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'admin' | 'user'
          total_points?: number
          is_verified?: boolean
        }
      }
      bonus_entries: {
        Row: {
          id: string
          created_at: string
          user_id: string
          user_name: string
          course_name: string
          price: number
          points_awarded: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          user_name: string
          course_name: string
          price: number
          points_awarded: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          user_name?: string
          course_name?: string
          price?: number
          points_awarded?: number
        }
      }
      prizes: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          points: number
          image_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          points: number
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          points?: number
          image_url?: string | null
          is_active?: boolean
        }
      }
      prize_redemptions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          user_name: string
          prize_id: string
          prize_name: string
          point_cost: number
          status: 'pending' | 'approved' | 'rejected'
          requested_at: string
          updated_at: string | null
          comment: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          user_name: string
          prize_id: string
          prize_name: string
          point_cost: number
          status?: 'pending' | 'approved' | 'rejected'
          requested_at?: string
          updated_at?: string | null
          comment?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          user_name?: string
          prize_id?: string
          prize_name?: string
          point_cost?: number
          status?: 'pending' | 'approved' | 'rejected'
          requested_at?: string
          updated_at?: string | null
          comment?: string | null
        }
      }
      registration_links: {
        Row: {
          id: string
          created_at: string
          created_by: string
          link_token: string
          is_active: boolean
          used_at: string | null
          used_by: string | null
          points: number
        }
        Insert: {
          id?: string
          created_at?: string
          created_by: string
          link_token?: string
          is_active?: boolean
          used_at?: string | null
          used_by?: string | null
          points?: number
        }
        Update: {
          id?: string
          created_at?: string
          created_by?: string
          link_token?: string
          is_active?: boolean
          used_at?: string | null
          used_by?: string | null
          points?: number
        }
      }
      invites: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          invite_id: string
          expires_at: string
          created_at: string
          used_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          invite_id: string
          expires_at: string
          created_at?: string
          used_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          invite_id?: string
          expires_at?: string
          created_at?: string
          used_at?: string | null
        }
      }
      rate_limits: {
        Row: {
          id: string
          ip: string | null
          email: string | null
          endpoint: string
          attempts: number
          last_attempt: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          ip?: string | null
          email?: string | null
          endpoint: string
          attempts?: number
          last_attempt?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          ip?: string | null
          email?: string | null
          endpoint?: string
          attempts?: number
          last_attempt?: string | null
          created_at?: string | null
        }
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
  }
} 