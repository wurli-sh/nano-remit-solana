import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'

import { NanoVaultLogo } from '@/assets'
import { FieldLabel } from '@/components/ui'
import { useVaultData, useSolanaRepay } from '@/web3/hooks'
import { formatToken, formatUnitsManual, parseUnitsManual } from '@/utils/format'
import { NANOUSD_DECIMALS, getExplorerTxUrl } from '@/web3/constants'

export function RepayTab() {
  const [amountInput, setAmountInput] = useState('')
  const [useMaxAmount, setUseMaxAmount] = useState(false)

  const { data: vault } = useVaultData()
  const repay = useSolanaRepay()

  const debt = vault?.debt ?? 0n
  const nanoUsdBalance = vault?.nanoUsdBalance ?? 0n
  const needsMore = nanoUsdBalance < debt && debt > 0n
  const qualifyingThreshold = debt > 0n ? debt / 10n : 0n

  const amount = useMaxAmount && debt > 0n
    ? (nanoUsdBalance >= debt ? debt : nanoUsdBalance)
    : amountInput
      ? parseUnitsManual(amountInput, NANOUSD_DECIMALS)
      : undefined

  useEffect(() => {
    if (repay.isConfirmed) toast.success('Debt repaid successfully')
  }, [repay.isConfirmed])

  const tier = vault?.effectiveTier ?? 1
  const repaymentCount = vault?.repaymentCount ?? 0
  const tierProgress = (() => {
    if (tier === 1) return Math.min((repaymentCount / 3) * 100, 100)
    if (tier === 2) return Math.min((repaymentCount / 10) * 100, 100)
    return 100
  })()

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Left: repay card */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current Debt</p>
            <p className="mt-2 text-4xl font-bold text-foreground">
              ${formatToken(debt)}{' '}
              <span className="inline-flex items-center gap-1 text-lg font-semibold text-muted-foreground">
                <img src={NanoVaultLogo} alt="NUSD" className="size-5" />
                NUSD
              </span>
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            <CreditCard className="size-6 text-primary" />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <FieldLabel
              label="Repayment Amount"
              tooltip="Enter the amount you want to repay. Paying at least 10% of your debt qualifies as a payment and improves your credit tier."
            />
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-muted px-4">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => { setAmountInput(e.target.value); setUseMaxAmount(false) }}
                className="flex-1 bg-transparent py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-1">
                <img src={NanoVaultLogo} alt="NUSD" className="size-4" />
                <span className="text-sm font-semibold text-muted-foreground">NUSD</span>
              </div>
              <button
                onClick={() => {
                  if (debt > 0n) {
                    setAmountInput(formatUnitsManual(debt, NANOUSD_DECIMALS))
                    setUseMaxAmount(true)
                  }
                }}
                className="cursor-pointer rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-primary/20 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Balance: ${formatToken(nanoUsdBalance)} NUSD</span>
            {needsMore && (
              <span className="text-sm font-semibold text-destructive">
                (Need ${formatToken(debt - nanoUsdBalance)} more to clear debt)
              </span>
            )}
          </div>

          <button
            onClick={() => amount && repay.repay(amount)}
            disabled={!amount || amount === 0n || debt === 0n || repay.isPending}
            className="w-full cursor-pointer rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {repay.isPending ? 'Repaying…' : 'Repay'}
          </button>

          {repay.txSignature && (
            <a
              href={getExplorerTxUrl(repay.txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-primary hover:underline"
            >
              View on Solana Explorer
            </a>
          )}
        </div>
      </div>

      {/* Right: qualifying repayment tip */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
          <span className="text-2xl">⭐</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Qualifying Repayment</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Repay &gt; ${formatToken(qualifyingThreshold)} to improve your credit tier and unlock better
          borrowing limits.
        </p>
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
