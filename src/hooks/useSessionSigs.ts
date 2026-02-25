"use client"
import { useEffect, useState } from 'react'

// Minimal hook that provides a dummy session signature object for local development.
// Replace with a real Lit session-signature implementation when available.
export function useSessionSigs() {
  const [sigs, setSigs] = useState<any>(null)

  useEffect(() => {
    // create a small demo signature so map / contract UI can render insights during dev
    setSigs({ demo: true, signer: 'local-dev', signature: 'demo-sig' })
  }, [])

  return sigs
}
