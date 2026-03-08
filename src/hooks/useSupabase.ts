import { useMemo, useRef } from 'react'
import { useSession } from '@clerk/clerk-react'
import { createClerkSupabase } from '@/lib/supabaseClerk'

/**
 * Hook to get a Supabase client authenticated with the current Clerk session.
 * Uses a ref to avoid recreating the client on every session reference change —
 * the fetch interceptor always reads the latest session via the ref.
 */
export function useSupabase() {
  const { session } = useSession()
  const sessionRef = useRef(session)
  sessionRef.current = session

  // Stable proxy session that always delegates to the latest ref
  const stableSession = useMemo(() => ({
    getToken: (opts: { template: string }) => sessionRef.current?.getToken(opts) ?? Promise.resolve(null),
  }), [])

  const supabase = useMemo(() => createClerkSupabase(stableSession), [stableSession])
  return supabase
}
