import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

/**
 * Returns `true` only after the wallet adapter has had time to auto-connect.
 *
 * On first render with `autoConnect`, the adapter hasn't started yet —
 * both `connecting` and `connected` are false, which would flash the
 * "Connect Wallet" screen. This hook keeps `ready` as `false` until
 * the adapter settles (either connected or the grace period expires),
 * so pages can show a skeleton instead.
 */
export function useWalletReady() {
  const { connected, connecting } = useWallet()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Already connected — immediately ready
    if (connected) {
      setReady(true)
      return
    }

    // Give autoConnect up to 1.5s to kick in
    const timeout = setTimeout(() => setReady(true), 1500)
    return () => clearTimeout(timeout)
  }, [connected])

  // While connecting, don't mark ready yet
  if (connecting) return false

  return ready
}
