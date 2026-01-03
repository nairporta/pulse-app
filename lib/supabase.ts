import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          name: string
          pairing_code: string
          partner_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          pairing_code: string
          partner_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          pairing_code?: string
          partner_id?: string
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          title: string
          start_date: string
          user_id: string
          shared_with_partner: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          start_date: string
          user_id: string
          shared_with_partner?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          start_date?: string
          user_id?: string
          shared_with_partner?: boolean
        }
      }
      event_messages: {
        Row: {
          id: string
          created_at: string
          event_id: string
          text: string
          author: 'me' | 'partner'
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          text: string
          author: 'me' | 'partner'
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          text?: string
          author?: 'me' | 'partner'
          user_id?: string
        }
      }
    }
  }
}