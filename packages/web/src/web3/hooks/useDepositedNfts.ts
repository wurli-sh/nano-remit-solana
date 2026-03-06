import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'

import { useVaultProgram } from './useVault'

interface DepositedNft {
  /** The NFT mint address */
  mint: PublicKey
  /** Truncated mint address for display */
  label: string
  /** Unix timestamp when deposited */
  depositedAt: number
}

/**
 * Finds all DepositEntry accounts for the connected user.
 * Uses getProgramAccounts with a memcmp filter on the user field.
 */
export function useDepositedNfts() {
  const { publicKey } = useWallet()
  const program = useVaultProgram()

  return useQuery<DepositedNft[]>({
    queryKey: ['depositedNfts', publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey) return []

      // DepositEntry layout: 8 (discriminator) + 32 (user) + 32 (nft_mint) + 8 (deposited_at) + 1 (bump)
      // Filter by user field at offset 8
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries = await (program.account as any).depositEntry.all([
        {
          memcmp: {
            offset: 8,
            bytes: publicKey.toBase58(),
          },
        },
      ])

      return entries.map((entry: { account: { nftMint: PublicKey; depositedAt: { toString(): string } } }) => {
        const mint = entry.account.nftMint as PublicKey
        const addr = mint.toBase58()
        return {
          mint,
          label: `${addr.slice(0, 4)}…${addr.slice(-4)}`,
          depositedAt: Number(entry.account.depositedAt.toString()),
        }
      })
    },
    enabled: !!publicKey && !!program,
    staleTime: 15_000,
    retry: 2,
  })
}
