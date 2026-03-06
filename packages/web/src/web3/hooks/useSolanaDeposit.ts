import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

import { useVaultProgram, useVaultPDAs, getDepositEntryPDA } from './useVault'
import { useInvalidateVault } from './useVaultData'
import { getMetadataPDA } from '../constants'

/**
 * Deposit a Receipt NFT into the vault as collateral.
 * Transfers the NFT from user → vault escrow, creates DepositEntry PDA.
 */
export function useSolanaDeposit() {
  const { publicKey } = useWallet()
  const program = useVaultProgram()
  const pdas = useVaultPDAs(publicKey)
  const invalidate = useInvalidateVault()

  const [isPending, setIsPending] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const deposit = useCallback(
    async (nftMint: PublicKey) => {
      if (!program || !publicKey || !pdas.vaultConfig || !pdas.userVault) {
        setError(new Error('Wallet not connected'))
        return
      }

      try {
        setIsPending(true)
        setIsConfirmed(false)
        setError(null)
        setTxSignature(null)

        // Derive deposit-specific accounts
        const depositEntry = getDepositEntryPDA(publicKey, nftMint)
        const userNftAta = getAssociatedTokenAddressSync(nftMint, publicKey)
        const vaultNftEscrow = getAssociatedTokenAddressSync(nftMint, pdas.vaultConfig, true)
        const nftMetadata = getMetadataPDA(nftMint)

        const sig = await program.methods
          .depositReceipt()
          .accounts({
            user: publicKey,
            vaultConfig: pdas.vaultConfig,
            userVault: pdas.userVault,
            depositEntry,
            nftMint,
            userNftAta,
            vaultNftEscrow,
            nftMetadata,
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

  return { deposit, isPending, isConfirmed, txSignature, error, reset }
}
