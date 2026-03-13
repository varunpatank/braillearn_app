import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function createClerkSupabase(clerkSession: { getToken: (opts: { template: string }) => Promise<string | null> } | null | undefined): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[supabaseClerk] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    return createClient('https://placeholder.supabase.co', 'placeholder')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'supabase-clerk-client',
    },
    global: {
      fetch: async (url, options = {}) => {
        try {
          const clerkToken = await clerkSession?.getToken({ template: 'supabase' })

          if (!clerkToken) {
            console.warn('[supabaseClerk] No Clerk JWT token — ensure a "supabase" JWT template exists in your Clerk Dashboard (JWT Templates → New → Supabase). All DB queries will 403 without it.')
          }

          const headers = new Headers(options.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
          }

          const response = await fetch(url, { ...options, headers })
          return response
        } catch (err) {
          console.warn('[supabaseClerk] fetch failed:', err)
          return new Response(JSON.stringify({ data: null, error: 'Network request failed' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  })
}