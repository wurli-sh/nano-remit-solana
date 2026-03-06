import { PublicKey } from '@solana/web3.js'

/** NanoUSD SPL Token decimal places */
export const NANOUSD_DECIMALS = 9

/** Fixed notional value per receipt: 100 NanoUSD (9 decimals) */
export const RECEIPT_VALUE = 100_000_000_000n

/** Max LTV basis points per tier: [Tier 1, Tier 2, Tier 3] */
export const LTV_BPS = [4000, 6000, 7500] as const

/** Borrow rate basis points per tier: [Tier 1, Tier 2, Tier 3] */
export const RATE_BPS = [2000, 1200, 800] as const

/** Minimum repayment count thresholds per tier */
export const MIN_REPAYMENTS = [0, 3, 10] as const

/** Metaplex Token Metadata program ID */
export const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

/** Solana Explorer base URL */
export const EXPLORER_URL = 'https://explorer.solana.com'

/** Get the LTV basis points for a given tier (0 or 1-3). */
export function getLtvForTier(tier: number): number {
  const idx = tier === 0 ? 0 : tier - 1
  return LTV_BPS[Math.min(idx, 2)] ?? 4000
}

/** Get the borrow rate BPS for a given tier. */
export function getRateForTier(tier: number): number {
  const idx = tier === 0 ? 0 : tier - 1
  return RATE_BPS[Math.min(idx, 2)] ?? 2000
}

/** Get minimum repayments required for a tier. */
export function getMinRepaymentsForTier(tier: number): number {
  const idx = tier === 0 ? 0 : tier - 1
  return MIN_REPAYMENTS[Math.min(idx, 2)] ?? 0
}

/** Get Solana Explorer transaction URL. */
export function getExplorerTxUrl(signature: string, cluster = 'devnet'): string {
  return `${EXPLORER_URL}/tx/${signature}?cluster=${cluster}`
}

/** Derive Metaplex metadata PDA for a given mint. */
export function getMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METAPLEX_PROGRAM_ID,
  )
  return pda
}
