/** Format a bigint token amount to a human-readable string with specified decimals. */
export function formatToken(amount: bigint, decimals = 9, displayDecimals = 2): string {
  if (amount === 0n) return '0'

  const str = amount.toString().padStart(decimals + 1, '0')
  const whole = str.slice(0, str.length - decimals) || '0'
  const frac = str.slice(str.length - decimals)
  const num = Number.parseFloat(`${whole}.${frac}`)

  if (num < 0.01) return '< 0.01'

  return num.toLocaleString('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  })
}

/** Format a bigint token amount to a plain decimal string (for input fields). */
export function formatUnitsManual(amount: bigint, decimals = 9): string {
  const str = amount.toString().padStart(decimals + 1, '0')
  const whole = str.slice(0, str.length - decimals) || '0'
  const frac = str.slice(str.length - decimals).replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole
}

/** Parse a decimal string into a bigint with the given decimals. */
export function parseUnitsManual(value: string, decimals = 9): bigint {
  if (!value || value === '0') return 0n
  const [whole = '0', frac = ''] = value.split('.')
  const paddedFrac = frac.slice(0, decimals).padEnd(decimals, '0')
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(paddedFrac)
}

/** Truncate an address for display: ABC1...XY2Z */
export function truncateAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

/** Format basis points to a percentage string (e.g. 4000 → "40%"). */
export function bpsToPercent(bps: number | bigint): string {
  const num = typeof bps === 'bigint' ? Number(bps) : bps
  return `${(num / 100).toFixed(num % 100 === 0 ? 0 : 1)}%`
}

/** Get tier display name. */
export function tierName(tier: number): string {
  const names = ['Tier 1 (Default)', 'Tier 2', 'Tier 3'] as const
  const index = tier === 0 ? 0 : tier - 1
  return names[index] ?? 'Unknown'
}

/** Get repayments needed for the next tier. */
export function repaymentsToNextTier(tier: number, currentRepayments: number): number | null {
  if (tier >= 3) return null // Already max tier
  const thresholds = [3, 10] as const
  const targetIndex = tier === 0 ? 0 : tier - 1
  const target = thresholds[targetIndex]
  if (target === undefined) return null
  return Math.max(0, target - currentRepayments)
}
