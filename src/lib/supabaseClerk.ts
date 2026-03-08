import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Creates a Supabase client authenticated with a Clerk session token.
 * Call this inside components that have access to Clerk's useSession().
 *
 * Usage:
 *   const { session } = useSession()
 *   const supabase = createClerkSupabase(session)
 */
export function createClerkSupabase(clerkSession: { getToken: (opts: { template: string }) => Promise<string | null> } | null | undefined): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[supabaseClerk] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    // Return a client that will fail gracefully
    return createClient('https://placeholder.supabase.co', 'placeholder')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        try {
          const clerkToken = await clerkSession?.getToken({ template: 'supabase' })

          const headers = new Headers(options.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
          }

          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 4000)
          const response = await fetch(url, { ...options, headers, signal: controller.signal })
          clearTimeout(timeout)
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
