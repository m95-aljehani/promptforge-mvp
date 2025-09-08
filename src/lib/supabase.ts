import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          provider: string
          encrypted_key: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          encrypted_key: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          encrypted_key?: string
          created_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          body_md: string
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          title: string
          body_md: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          body_md?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      revisions: {
        Row: {
          id: string
          prompt_id: string
          parent_revision_id: string | null
          body_md: string
          command_text: string | null
          llm_provider: string
          token_usage: number | null
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          parent_revision_id?: string | null
          body_md: string
          command_text?: string | null
          llm_provider: string
          token_usage?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          parent_revision_id?: string | null
          body_md?: string
          command_text?: string | null
          llm_provider?: string
          token_usage?: number | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
        }
      }
      prompt_tags: {
        Row: {
          prompt_id: string
          tag_id: string
        }
        Insert: {
          prompt_id: string
          tag_id: string
        }
        Update: {
          prompt_id?: string
          tag_id?: string
        }
      }
    }
  }
}