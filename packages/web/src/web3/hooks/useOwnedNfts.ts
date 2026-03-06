import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useQuery } from '@tanstack/react-query'
import type { PublicKey } from '@solana/web3.js'

interface OwnedNft {
  /** The NFT mint address */
  mint: PublicKey
  /** Truncated mint address for display */
  label: string
}

/**
 * Discovers all NFTs (supply=1, decimals=0) in the user's wallet.
 * These are candidates for depositing as collateral.
 */
export function useOwnedNfts() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  return useQuery<OwnedNft[]>({
    queryKey: ['ownedNfts', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return []

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
      )

      const nfts: OwnedNft[] = []
      for (const { account } of tokenAccounts.value) {
        const parsed = account.data.parsed?.info
        if (!parsed) continue

        const amount = Number(parsed.tokenAmount?.uiAmount ?? 0)
        const decimals = parsed.tokenAmount?.decimals ?? 0

        // NFTs have decimals=0 and exactly 1 token
        if (decimals === 0 && amount === 1) {
          const { PublicKey } = await import('@solana/web3.js')
          const mint = new PublicKey(parsed.mint)
          const addr = mint.toBase58()
          nfts.push({
            mint,
            label: `${addr.slice(0, 4)}…${addr.slice(-4)}`,
          })
        }
      }

      return nfts
    },
    enabled: !!publicKey,
    staleTime: 15_000,
    retry: 2,
  })
}
