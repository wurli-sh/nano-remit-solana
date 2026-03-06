import { useState, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'

import { useInvalidateVault } from './useVaultData'

import type { PublicKey } from '@solana/web3.js'

const DEMO_URI = 'ipfs://bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenosa7777'

/**
 * Mint a Remittance Receipt NFT using Metaplex.
 * Each receipt is a unique SPL token (supply=1, decimals=0) with Metaplex metadata.
 */
export function useMintNft() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const invalidate = useInvalidateVault()

  const [isPending, setIsPending] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [mintAddress, setMintAddress] = useState<PublicKey | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const mint = useCallback(
    async (uri = DEMO_URI, name = 'Remittance Receipt') => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        setError(new Error('Wallet not connected'))
        return
      }

      try {
        setIsPending(true)
        setIsConfirmed(false)
        setError(null)
        setTxSignature(null)
        setMintAddress(null)

        const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))

        const { nft, response } = await metaplex.nfts().create({
          uri,
          name,
          sellerFeeBasisPoints: 0,
          symbol: 'RCPT',
        })

        setTxSignature(response.signature)
        setMintAddress(nft.address)
        setIsConfirmed(true)
        invalidate()
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsPending(false)
      }
    },
    [wallet, connection, invalidate],
  )

  const reset = useCallback(() => {
    setIsPending(false)
    setIsConfirmed(false)
    setTxSignature(null)
    setMintAddress(null)
    setError(null)
  }, [])

  return { mint, isPending, isConfirmed, txSignature, mintAddress, error, reset }
}
