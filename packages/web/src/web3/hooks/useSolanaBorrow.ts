import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { SystemProgram } from '@solana/web3.js'
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'

import { useVaultProgram, useVaultPDAs } from './useVault'
import { useInvalidateVault } from './useVaultData'

/**
 * Borrow NanoUSD against deposited collateral.
 * Accrues interest, enforces LTV, mints NanoUSD to user.
 */
export function useSolanaBorrow() {
  const { publicKey } = useWallet()
  const program = useVaultProgram()
  const pdas = useVaultPDAs(publicKey)
  const invalidate = useInvalidateVault()

  const [isPending, setIsPending] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const borrow = useCallback(
    async (amount: bigint) => {
      if (!program || !publicKey || !pdas.vaultConfig || !pdas.nanoUsdMint || !pdas.nanoUsdAuthority || !pdas.userVault) {
        setError(new Error('Wallet not connected'))
        return
      }

      try {
        setIsPending(true)
        setIsConfirmed(false)
        setError(null)
        setTxSignature(null)

        // Fetch VaultConfig to get protocolTreasury
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vaultConfig = await (program.account as any).vaultConfig.fetch(pdas.vaultConfig)
        const treasury = vaultConfig.protocolTreasury

        // Derive ATAs
        const userNanoUsdAta = getAssociatedTokenAddressSync(pdas.nanoUsdMint, publicKey)
        const treasuryNanoUsdAta = getAssociatedTokenAddressSync(pdas.nanoUsdMint, treasury)

        const sig = await program.methods
          .borrow(new BN(amount.toString()))
          .accounts({
            user: publicKey,
            vaultConfig: pdas.vaultConfig,
            userVault: pdas.userVault,
            nanoUsdMint: pdas.nanoUsdMint,
            nanoUsdAuthority: pdas.nanoUsdAuthority,
            userNanoUsdAta,
            treasury,
            treasuryNanoUsdAta,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .rpc()

        setTxSignature(sig)
        setIsConfirmed(true)
        invalidate()
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsPending(false)
      }
    },
    [program, publicKey, pdas, invalidate],
  )

  const reset = useCallback(() => {
    setIsPending(false)
    setIsConfirmed(false)
    setTxSignature(null)
    setError(null)
  }, [])

  return { borrow, isPending, isConfirmed, txSignature, error, reset }
}
