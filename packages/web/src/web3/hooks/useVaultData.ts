import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { BN } from '@coral-xyz/anchor'

import { useVaultProgram, useVaultPDAs } from './useVault'
import {
  RECEIPT_VALUE,
  getLtvForTier,
  getRateForTier,
} from '../constants'

interface VaultData {
  /** User's credit tier (1–3, 0 treated as 1) */
  tier: number
  /** Effective tier for display (always 1–3) */
  effectiveTier: number
  /** Current debt in raw NanoUSD units (9 decimals) */
  debt: bigint
  /** Number of deposited receipts */
  depositCount: number
  /** Number of qualifying repayments */
  repaymentCount: number
  /** Total collateral value in raw NanoUSD units */
  collateral: bigint
  /** Maximum borrowable amount in raw NanoUSD units */
  maxBorrow: bigint
  /** Available to borrow (maxBorrow - debt) */
  available: bigint
  /** Max LTV percentage (e.g. 40, 60, 75) */
  maxLTV: number
  /** Borrow APR percentage (e.g. 20, 12, 8) */
  apr: number
  /** Max LTV basis points */
  ltvBps: number
  /** Borrow rate basis points */
  rateBps: number
  /** User's NanoUSD wallet balance */
  nanoUsdBalance: bigint
  /** Whether the vault is paused */
  paused: boolean
  /** Protocol treasury address */
  protocolTreasury: PublicKey
  /** NanoUSD mint address */
  nanoUsdMint: PublicKey
  /** Unix timestamp of last interest accrual */
  lastAccrual: number
}

/** Convert Anchor BN to bigint */
function bnToBigInt(bn: BN): bigint {
  return BigInt(bn.toString())
}

/**
 * Comprehensive hook that fetches VaultConfig + UserVault + NanoUSD balance
 * and computes all derived values needed by vault tabs and dashboard.
 */
export function useVaultData() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const program = useVaultProgram()
  const pdas = useVaultPDAs(publicKey)

  return useQuery<VaultData>({
    queryKey: ['vaultData', publicKey?.toBase58()],
    queryFn: async () => {
      if (!program || !publicKey || !pdas.vaultConfig || !pdas.nanoUsdMint) {
        throw new Error('Not connected')
      }

      // Fetch VaultConfig (always exists after initialization)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vaultConfig = await (program.account as any).vaultConfig.fetch(pdas.vaultConfig)

      // Try fetching UserVault (may not exist if user hasn't deposited yet)
      let userVaultData: {
        tier: number
        debt: bigint
        depositCount: number
        repaymentCount: number
        lastAccrual: number
      } = {
        tier: 0,
        debt: 0n,
        depositCount: 0,
        repaymentCount: 0,
        lastAccrual: 0,
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userVault = await (program.account as any).userVault.fetch(pdas.userVault!)
        userVaultData = {
          tier: userVault.tier,
          debt: bnToBigInt(userVault.debt as unknown as BN),
          depositCount: userVault.depositCount,
          repaymentCount: userVault.repaymentCount,
          lastAccrual: Number(userVault.lastAccrual.toString()),
        }
      } catch {
        // UserVault doesn't exist yet — user hasn't interacted
      }

      // Fetch NanoUSD balance
      let nanoUsdBalance = 0n
      try {
        const ata = getAssociatedTokenAddressSync(pdas.nanoUsdMint, publicKey)
        const tokenAccount = await connection.getTokenAccountBalance(ata)
        nanoUsdBalance = BigInt(tokenAccount.value.amount)
      } catch {
        // ATA doesn't exist — balance is 0
      }

      // Compute derived values
      const effectiveTier = userVaultData.tier === 0 ? 1 : userVaultData.tier
      const ltvBps = getLtvForTier(effectiveTier)
      const rateBps = getRateForTier(effectiveTier)
      const collateral = BigInt(userVaultData.depositCount) * RECEIPT_VALUE
      const maxBorrow = (collateral * BigInt(ltvBps)) / 10_000n
      const available = maxBorrow > userVaultData.debt ? maxBorrow - userVaultData.debt : 0n

      return {
        tier: userVaultData.tier,
        effectiveTier,
        debt: userVaultData.debt,
        depositCount: userVaultData.depositCount,
        repaymentCount: userVaultData.repaymentCount,
        collateral,
        maxBorrow,
        available,
        maxLTV: ltvBps / 100,
        apr: rateBps / 100,
        ltvBps,
        rateBps,
        nanoUsdBalance,
        paused: vaultConfig.paused,
        protocolTreasury: vaultConfig.protocolTreasury,
        nanoUsdMint: vaultConfig.nanoUsdMint,
        lastAccrual: userVaultData.lastAccrual,
      }
    },
    enabled: !!publicKey && !!program && !!pdas.vaultConfig,
    staleTime: 10_000,
    retry: 2,
  })
}

/** Hook to invalidate all vault-related queries. */
export function useInvalidateVault() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['vaultData'] })
    queryClient.invalidateQueries({ queryKey: ['ownedNfts'] })
    queryClient.invalidateQueries({ queryKey: ['depositedNfts'] })
  }
}
