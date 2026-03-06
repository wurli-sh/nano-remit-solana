import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowDownToLine, AlertTriangle } from 'lucide-react'
import type { PublicKey } from '@solana/web3.js'

import { NanoVaultLogo } from '@/assets'
import { useVaultData, useOwnedNfts, useDepositedNfts, useSolanaDeposit } from '@/web3/hooks'
import { formatToken } from '@/utils/format'
import { cn } from '@/utils/cn'
import { getExplorerTxUrl } from '@/web3/constants'

export function DepositTab() {
  const [selectedMint, setSelectedMint] = useState<PublicKey | null>(null)

  const { data: vault } = useVaultData()
  const { data: ownedNfts = [], isLoading: ownedLoading } = useOwnedNfts()
  const { data: depositedNfts = [] } = useDepositedNfts()
  const deposit = useSolanaDeposit()

  useEffect(() => {
    if (deposit.isConfirmed) {
      toast.success('Receipt deposited successfully')
      setSelectedMint(null)
    }
  }, [deposit.isConfirmed])

  const collateral = vault?.collateral ?? 0n
  const tier = vault?.effectiveTier ?? 1
  const repaymentCount = vault?.repaymentCount ?? 0
  const tierProgress = (() => {
    if (tier === 1) return Math.min((repaymentCount / 3) * 100, 100)
    if (tier === 2) return Math.min((repaymentCount / 10) * 100, 100)
    return 100
  })()

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Left: deposit card */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Deposit Collateral</p>
            <h3 className="mt-2 text-2xl font-bold text-foreground">Receipt NFT</h3>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            <ArrowDownToLine className="size-6 text-primary" />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Wallet NFTs */}
          {ownedNfts.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Your Wallet Receipts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ownedNfts.map((nft) => {
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

          {ownedNfts.length === 0 && !ownedLoading && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              No receipt NFTs found in your wallet. Mint one first.
            </div>
          )}

          {/* Already deposited */}
          {depositedNfts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Already in vault:{' '}
              <strong className="text-foreground">
                {depositedNfts.map((n) => n.label).join(', ')}
              </strong>
            </p>
          )}

          <button
            onClick={() => selectedMint && deposit.deposit(selectedMint)}
            disabled={!selectedMint || deposit.isPending}
            className="w-full cursor-pointer rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deposit.isPending ? 'Depositing...' : 'Deposit Receipt'}
          </button>

          {deposit.error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {deposit.error.message.slice(0, 120)}
            </div>
          )}

          {deposit.txSignature && (
            <a
              href={getExplorerTxUrl(deposit.txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-primary hover:underline"
            >
              View on Solana Explorer
            </a>
          )}
        </div>
      </div>

      {/* Right: collateral info */}
      <div className="rounded-2xl border border-border bg-card p-8 md:col-span-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
          <ArrowDownToLine className="size-6 text-primary" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current Collateral</p>
        <p className="mt-2 text-4xl font-bold text-foreground tabular-nums">
          ${formatToken(collateral)}{' '}
          <span className="inline-flex items-center gap-1 text-lg font-semibold text-muted-foreground">
            <img src={NanoVaultLogo} alt="NUSD" className="size-5" />
            NUSD
          </span>
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
