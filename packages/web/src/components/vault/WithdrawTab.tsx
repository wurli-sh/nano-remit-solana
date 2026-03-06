import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowUpFromLine, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react'
import type { PublicKey } from '@solana/web3.js'

import { useVaultData, useDepositedNfts, useSolanaWithdraw } from '@/web3/hooks'
import { formatToken } from '@/utils/format'
import { cn } from '@/utils/cn'
import { getExplorerTxUrl } from '@/web3/constants'

export function WithdrawTab() {
  const [selectedMint, setSelectedMint] = useState<PublicKey | null>(null)

  const { data: vault } = useVaultData()
  const { data: depositedNfts = [] } = useDepositedNfts()
  const withdraw = useSolanaWithdraw()

  const debt = vault?.debt ?? 0n
  const hasDebt = debt > 0n
  const depositCount = vault?.depositCount ?? 0
  const isValidSelection = selectedMint !== null && depositedNfts.some((n) => n.mint.equals(selectedMint))

  useEffect(() => {
    if (withdraw.isConfirmed) {
      toast.success('Receipt withdrawn successfully')
      setSelectedMint(null)
    }
  }, [withdraw.isConfirmed])

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Left: withdraw card */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Withdraw Receipt</p>
            <h3 className="mt-2 text-2xl font-bold text-foreground">Select NFT to withdraw</h3>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            <ArrowUpFromLine className="size-6 text-primary" />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {depositedNfts.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Deposited Receipts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {depositedNfts.map((nft) => {
                  const isSelected = selectedMint?.equals(nft.mint) ?? false
                  return (
                    <button
                      key={nft.mint.toBase58()}
                      onClick={() => setSelectedMint(nft.mint)}
                      className={cn(
                        'cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium tabular-nums transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground hover:bg-muted',
                      )}
                    >
                      {nft.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {depositedNfts.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              No deposited receipts to withdraw.
            </div>
          )}

          {hasDebt && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              Must repay all debt before withdrawing.
            </div>
          )}

          {isValidSelection && !hasDebt && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="size-4" />
              Ready to withdraw
            </div>
          )}

          <button
            onClick={() => selectedMint && withdraw.withdraw(selectedMint)}
            disabled={!isValidSelection || hasDebt || withdraw.isPending}
            className="w-full cursor-pointer rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {withdraw.isPending ? 'Withdrawing...' : 'Withdraw Receipt'}
          </button>

          {withdraw.error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {withdraw.error.message.slice(0, 120)}
            </div>
          )}

          {withdraw.txSignature && (
            <a
              href={getExplorerTxUrl(withdraw.txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-primary hover:underline"
            >
              View on Solana Explorer
            </a>
          )}
        </div>
      </div>

      {/* Right: vault status */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldAlert className="size-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Vault Status</h3>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Outstanding Debt</span>
            <span className="font-bold text-foreground tabular-nums">
              ${formatToken(debt)}{' '}
              <span className="text-xs font-medium text-muted-foreground">NUSD</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deposited Receipts</span>
            <span className="font-bold text-foreground tabular-nums">
              {depositCount}{' '}
              <span className="text-xs font-medium text-muted-foreground">items</span>
            </span>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          You can only withdraw your NFT receipts when your debt balance is exactly $0.00.
        </p>
      </div>
    </div>
  )
}
