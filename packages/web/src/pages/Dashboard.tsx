import { useWallet } from '@solana/wallet-adapter-react'
import { CreditCard, ArrowDownLeft, ArrowUpRight, FileText, ArrowUpDown, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

import { NanoVaultLogo } from '@/assets'
import { useVaultData, useDepositedNfts, useWalletReady } from '@/web3/hooks'
import { formatToken } from '@/utils/format'
import { cn } from '@/utils/cn'
import { DashboardSkeleton } from '@/components/common/Skeleton'

function tierDisplay(tier: number) {
  if (tier === 1) return {
    level: 1,
    name: 'Bronze Tier',
    nextName: 'Silver Tier',
    nextLTV: 60,
    nextAPR: 12,
    bgColor: 'bg-gradient-to-br from-amber-900/20 to-orange-900/20',
    badgeColor: 'bg-amber-700',
    textColor: 'text-amber-900',
  }
  if (tier === 2) return {
    level: 2,
    name: 'Silver Tier',
    nextName: 'Gold Tier',
    nextLTV: 75,
    nextAPR: 8,
    bgColor: 'bg-gradient-to-br from-slate-300/30 to-slate-400/30',
    badgeColor: 'bg-slate-800',
    textColor: 'text-slate-700',
  }
  return {
    level: 3,
    name: 'Gold Tier',
    nextName: null,
    nextLTV: null,
    nextAPR: null,
    bgColor: 'bg-gradient-to-br from-yellow-500/30 to-amber-500/30',
    badgeColor: 'bg-yellow-400',
    textColor: 'text-yellow-900',
  }
}

export default function Dashboard() {
  const { connected } = useWallet()
  const walletReady = useWalletReady()
  const { data: vault, isLoading, isError } = useVaultData()
  const { data: depositedNfts = [] } = useDepositedNfts()

  if (!walletReady) {
    return <DashboardSkeleton />
  }

  if (!connected) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
        <Shield className="size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Connect your wallet</h2>
        <p className="text-muted-foreground">Connect your wallet to view your NanoRemit Vault dashboard.</p>
      </div>
    )
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !vault) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
        <Shield className="size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Unable to load data</h2>
        <p className="text-muted-foreground">Could not fetch on-chain data. Please try again later.</p>
      </div>
    )
  }

  const {
    effectiveTier: tier,
    maxLTV,
    apr,
    collateral: collateralValue,
    debt: debtValue,
    maxBorrow: maxBorrowValue,
    available,
    depositCount,
    repaymentCount,
    nanoUsdBalance,
  } = vault

  const utilizationPct =
    maxBorrowValue > 0n ? Number((debtValue * 100n) / maxBorrowValue) : 0

  const tierProgress = (() => {
    if (tier === 1) return Math.min((repaymentCount / 3) * 100, 100)
    if (tier === 2) return Math.min((repaymentCount / 10) * 100, 100)
    return 100
  })()

  const td = tierDisplay(tier)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your credit, collateral, and debt in the NanoRemit Vault.
        </p>
      </div>

      {/* Tier hero card */}
      <div className={cn('rounded-2xl p-6', td.bgColor)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn('flex size-2 rounded-full', td.badgeColor)} />
              <span className={cn('text-xs font-semibold uppercase tracking-widest', td.textColor)}>
                Level {td.level}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-charcoal">{td.name}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">Max LTV</p>
              <p className="text-lg font-bold text-charcoal">{maxLTV}%</p>
            </div>
            <div className="h-8 w-px bg-charcoal/15" />
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">Borrow APR</p>
              <p className="text-lg font-bold text-charcoal">{apr}%</p>
            </div>
          </div>
        </div>

        {td.nextName && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-charcoal/60">
              <span className="font-semibold uppercase tracking-wider">Progress to {td.nextName}</span>
              <span className="font-bold">{tierProgress.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary-dark transition-all duration-500"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-charcoal/50">
              Unlock {td.nextLTV}% LTV and {td.nextAPR}% APR at next tier
            </p>
          </div>
        )}
      </div>

      {/* Stats 2×2 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4 text-pink-500" />
            Deposited Receipts
          </div>
          <p className="mt-3 text-2xl font-bold text-charcoal">{depositCount} Receipts</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ${formatToken(collateralValue)} Total Collateral Value
          </p>
        </StatCard>

        <StatCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="size-4 text-red-500" />
            Outstanding Debt
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-charcoal">${formatToken(debtValue)}</p>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Debt</span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-red-400 transition-all"
                style={{ width: `${Math.min(utilizationPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{utilizationPct}% Utilization</span>
              <span>${formatToken(maxBorrowValue)} Max</span>
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpRight className="size-4 text-primary" />
            Available to Borrow
          </div>
          <p className="mt-3 text-2xl font-bold text-charcoal">${formatToken(available)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Based on current collateral &amp; LTV</p>
        </StatCard>

        <StatCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img src={NanoVaultLogo} alt="NanoUSD" className="size-4" />
            NanoUSD Balance
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-charcoal">${formatToken(nanoUsdBalance)}</p>
            <span className="text-xs font-semibold uppercase text-muted-foreground">NUSD</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">In your connected wallet</p>
        </StatCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/mint">
            <QuickAction icon={<FileText className="size-5 text-pink-500" />} label="Mint Receipt" />
          </Link>
          <Link to="/vault">
            <QuickAction icon={<ArrowDownLeft className="size-5 text-primary" />} label="Deposit & Borrow" />
          </Link>
          <Link to="/vault?tab=repay">
            <QuickAction icon={<ArrowUpDown className="size-5 text-charcoal" />} label="Repay Debt" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h3>
        <div className="rounded-2xl border border-border bg-white">
          {depositedNfts.length > 0 ? (
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                  <ArrowDownLeft className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Deposited Tokens</p>
                  <p className="text-xs text-muted-foreground">
                    Receipts {depositedNfts.map((n) => n.label).join(', ')}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-primary">
                +${formatToken(collateralValue)}
              </p>
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No activity yet. Deposit receipts to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">{children}</div>
  )
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-5',
        'transition hover:border-charcoal/30 hover:bg-ghost',
      )}
    >
      {icon}
      <span className="text-xs font-medium text-charcoal">{label}</span>
    </div>
  )
}
