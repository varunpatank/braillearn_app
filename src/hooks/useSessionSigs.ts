"use client"
import { useEffect, useState } from 'react'

export function useSessionSigs() {
  const [sigs, setSigs] = useState<any>(null)

  useEffect(() => {
    setSigs({ demo: true, signer: 'local-dev', signature: 'demo-sig' })
  }, [])

  return sigs
}