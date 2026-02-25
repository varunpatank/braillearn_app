import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const disableSupabase = import.meta.env.VITE_DISABLE_SUPABASE === 'true' || import.meta.env.DEV === true

// Ensure a named export exists for TypeScript/ES module resolution
export let supabase: any = null

// If env vars are missing or supabase is explicitly disabled in dev, use a lightweight mock
if (!supabaseUrl || !supabaseAnonKey || disableSupabase) {
  console.warn('Supabase disabled or missing env vars (using in-memory mock).', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    disabled: disableSupabase
  })

  const mockChain = () => {
    const chain: any = {
      select: (..._args: any[]) => chain,
      insert: async (rows: any) => ({ data: rows, error: null }),
      update: async (_vals: any) => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      eq: (_col: string, _val: any) => chain,
      not: (_col: string, _op: string, _val: any) => chain, // support .not('latitude','is', null)
      order: (_col: string, _opts?: any) => chain,
      limit: (_n: number) => chain,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      // make the chain thenable so `await query` returns a sensible default
      then: function (resolve: any, reject: any) {
        return Promise.resolve({ data: [], error: null }).then(resolve, reject)
      }
    }
    return chain
  }

  supabase = {
    from: (_table: string) => mockChain(),
    storage: {
      from: (_bucket: string) => ({
        upload: async (_path: string, _file: any) => ({ error: null }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } })
      })
    },
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: null } }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null })
    }
  }
} else {
  // In production / when enabled: create a real client. Disable automatic token refresh during local dev to avoid spurious network requests.
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: import.meta.env.DEV ? false : true,
      autoRefreshToken: import.meta.env.DEV ? false : true
    }
  })
}

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