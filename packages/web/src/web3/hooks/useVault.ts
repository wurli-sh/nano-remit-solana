import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { getProgram, PROGRAM_ID } from '../solana-config'

import type { Wallet } from '@coral-xyz/anchor'

export function useVaultProgram() {
  const wallet = useWallet()

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null
    }

    // Anchor Wallet type requires `payer` but wallet-adapter doesn't have it.
    // The provider only uses publicKey + signTransaction + signAllTransactions.
    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions.bind(wallet),
    } as unknown as Wallet

    return getProgram(anchorWallet)
  }, [wallet])

  return program
}

export function useVaultPDAs(userPublicKey?: PublicKey | null) {
  return useMemo(() => {
    if (!userPublicKey) {
      return {
        vaultConfig: null,
        nanoUsdMint: null,
        nanoUsdAuthority: null,
        userVault: null,
      }
    }

    const programId = new PublicKey(PROGRAM_ID)

    const [vaultConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault_config')],
      programId
    )

    const [nanoUsdMint] = PublicKey.findProgramAddressSync(
      [Buffer.from('nano_usd_mint')],
      programId
    )

    const [nanoUsdAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('nano_usd_authority')],
      programId
    )

    const [userVault] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_vault'), userPublicKey.toBuffer()],
      programId
    )

    return {
      vaultConfig,
      nanoUsdMint,
      nanoUsdAuthority,
      userVault,
    }
  }, [userPublicKey])
}

export function getDepositEntryPDA(user: PublicKey, nftMint: PublicKey) {
  const programId = new PublicKey(PROGRAM_ID)
  const [depositEntry] = PublicKey.findProgramAddressSync(
    [Buffer.from('deposit'), user.toBuffer(), nftMint.toBuffer()],
    programId
  )
  return depositEntry
}
