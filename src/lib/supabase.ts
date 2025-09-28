import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Database types
export interface User {
  id: string
  email: string
  created_at: string
  last_login: string | null
  user_metadata: {
    [key: string]: any
  }
  progress: {
    level: number
    experience: number
    streak: number
    last_active: string | null
  }
  preferences: {
    theme: 'light' | 'dark'
    font_size: 'small' | 'medium' | 'large'
    audio_feedback: boolean
    arduino_mode: boolean
  }
}

export interface Chapter {
  id: string
  title: string
  content: string
  order: number
  resources: Array<{
    id: string
    type: 'video' | 'document' | 'link' | 'exercise'
    title: string
    description: string
    url: string
    thumbnail?: string
  }>
}

export interface Class {
  id: string
  creator_id: string
  title: string
  description: string
  image_url: string
  meeting_link: string
  schedule: {
    days: string[]
    time: string
    duration: number
  }
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  chapters: Chapter[]
  max_students: number
  enrolled_students: string[]
  created_at: string
  updated_at: string
  tags: string[]
  is_public: boolean
}