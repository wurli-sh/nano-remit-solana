import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { HandCoins, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react'

import { NanoVaultLogo } from '@/assets'
import { FieldLabel } from '@/components/ui'
import { useVaultData, useSolanaBorrow } from '@/web3/hooks'
import { formatToken, formatUnitsManual, parseUnitsManual } from '@/utils/format'
import { cn } from '@/utils/cn'
import { NANOUSD_DECIMALS, getExplorerTxUrl } from '@/web3/constants'

function getLTVColor(ltv: number) {
  if (ltv >= 80) return 'bg-destructive/10 border-destructive/30 text-destructive'
  if (ltv >= 60) return 'bg-warning/10 border-warning/30 text-warning-foreground'
  return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
}

function getAPRColor(apr: number) {
  if (apr <= 8) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
  if (apr <= 12) return 'bg-primary/10 border-primary/30 text-primary-dark'
  return 'bg-warning/10 border-warning/30 text-warning-foreground'
}

export function BorrowTab() {
  const [amountInput, setAmountInput] = useState('')
  const amount = amountInput ? parseUnitsManual(amountInput, NANOUSD_DECIMALS) : undefined

  const { data: vault, isLoading } = useVaultData()
  const borrow = useSolanaBorrow()

  const debt = vault?.debt ?? 0n
  const available = vault?.available ?? 0n
  const apr = vault?.apr ?? 0
  const maxLTV = vault?.maxLTV ?? 0
  const tier = vault?.effectiveTier ?? 1
  const collateral = vault?.collateral ?? 0n
  const hasNoCollateral = collateral === 0n && !isLoading
  const maxedOut = !hasNoCollateral && available === 0n && debt > 0n && !isLoading
  const exceedsAvailable = amount !== undefined && amount > available

  useEffect(() => {
    if (borrow.isConfirmed) toast.success('NUSD borrowed successfully')
  }, [borrow.isConfirmed])

  const TIER_LTV = [40, 60, 75]
  const TIER_APR = [20, 12, 8]
  const nextTier = Math.min(tier + 1, 3)
  const nextLTV = tier < 3 ? TIER_LTV[nextTier - 1] : maxLTV
  const nextAPR = tier < 3 ? TIER_APR[nextTier - 1] : apr

  const repaymentCount = vault?.repaymentCount ?? 0
  const tierProgress = (() => {
    if (tier === 1) return Math.min((repaymentCount / 3) * 100, 100)
    if (tier === 2) return Math.min((repaymentCount / 10) * 100, 100)
    return 100
  })()

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Left: borrow card */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Available to Borrow</p>
            <p className="mt-2 text-4xl font-bold text-foreground tabular-nums">
              ${formatToken(available)}{' '}
              <span className="inline-flex items-center gap-1 text-lg font-semibold text-muted-foreground">
                <img src={NanoVaultLogo} alt="NUSD" className="size-5" />
                NUSD
              </span>
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            <HandCoins className="size-6 text-primary" />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <FieldLabel
              label="Borrowing Amount"
              tooltip="Enter the amount of NanoUSD you want to borrow. Your available limit is based on your collateral and credit tier."
            />
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted px-4">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="flex-1 bg-transparent py-4 text-base text-foreground outline-none placeholder:text-muted-foreground tabular-nums"
              />
              <div className="flex items-center gap-1">
                <img src={NanoVaultLogo} alt="NUSD" className="size-4" />
                <span className="text-sm font-semibold text-muted-foreground">NUSD</span>
              </div>
              <button
                onClick={() => setAmountInput(formatUnitsManual(available, NANOUSD_DECIMALS))}
                className="cursor-pointer rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-primary/20 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className={cn('flex-1 rounded-xl border py-4 px-3 text-center transition-colors', getLTVColor(maxLTV))}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">LTV</p>
              <p className="mt-1 text-base font-bold tabular-nums">{maxLTV.toFixed(2)}%</p>
            </div>
            <div className={cn('flex-1 rounded-xl border py-4 px-3 text-center transition-colors', getAPRColor(apr))}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">APR</p>
              <p className="mt-1 text-base font-bold tabular-nums">{apr.toFixed(2)}%</p>
            </div>
          </div>

          {hasNoCollateral && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              Deposit collateral first to unlock borrowing.
            </div>
          )}

          {maxedOut && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              You've borrowed the maximum. Repay some debt to borrow more.
            </div>
          )}

          {exceedsAvailable && !hasNoCollateral && !maxedOut && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              Amount exceeds your available limit of ${formatToken(available)} NUSD.
            </div>
          )}

          <button
            onClick={() => amount && borrow.borrow(amount)}
            disabled={!amount || amount === 0n || exceedsAvailable || hasNoCollateral || maxedOut || borrow.isPending}
            className="w-full cursor-pointer rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {borrow.isPending ? 'Borrowing...' : 'Borrow NUSD'}
          </button>

          {borrow.txSignature && (
            <a
              href={getExplorerTxUrl(borrow.txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-primary hover:underline"
            >
              View on Solana Explorer
            </a>
          )}
        </div>
      </div>

      {/* Right: tier perks */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
          <TrendingUp className="size-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Tier Perks</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Reach the next tier to unlock better borrowing conditions.
        </p>

        <ul className="mt-6 space-y-3">
          <li className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Higher LTV up to {nextLTV}%
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Lower APR at {nextAPR?.toFixed(2)}%
          </li>
        </ul>

        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tier {tier} Progress</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground">
            <div
              className="h-full rounded-full bg-primary-bright transition-all"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
