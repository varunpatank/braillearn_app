import { useMemo, useRef } from 'react'
import { useSession } from '@clerk/react'
import { createClerkSupabase } from '@/lib/supabaseClerk'

export function useSupabase() {
  const { session } = useSession()
  const sessionRef = useRef(session)
  sessionRef.current = session

  const stableSession = useMemo(() => ({
    getToken: (opts: { template: string }) => sessionRef.current?.getToken(opts) ?? Promise.resolve(null),
  }), [])

  const supabase = useMemo(() => createClerkSupabase(stableSession), [stableSession])
  return supabase
}