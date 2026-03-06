import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSearchParams } from 'react-router-dom'
import { Vault as VaultIcon } from 'lucide-react'

import { Toggle} from '@/components/common/Toggle'
import { VaultSkeleton } from '@/components/common/Skeleton'
import { DepositTab, BorrowTab, RepayTab, WithdrawTab } from '@/components/vault/index'
import { useWalletReady } from '@/web3/hooks'

type Tab = 'deposit' | 'borrow' | 'repay' | 'withdraw'

const VALID_TABS: Tab[] = ['deposit', 'borrow', 'repay', 'withdraw']

export default function VaultPage() {
  const { connected } = useWallet()
  const walletReady = useWalletReady()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as Tab | null
  const initialTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'deposit'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Show skeleton while wallet adapter is settling (autoConnect)
  if (!walletReady) {
    return <VaultSkeleton />
  }

  if (!connected) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
        <VaultIcon className="size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-balance">Connect your wallet</h2>
        <p className="text-muted-foreground text-pretty">Connect to use the vault.</p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'deposit', label: 'Deposit' },
    { id: 'borrow', label: 'Borrow' },
    { id: 'repay', label: 'Repay' },
    { id: 'withdraw', label: 'Withdraw' },
  ]

  return (
    <div className="space-y-8">
      {/* Centered header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Vault Management</h1>
        <p className="mt-2 text-base text-muted-foreground">Manage your collateral, borrowing, and credit</p>
      </div>

      {/* Tab bar — pill style */}
      <div className="flex justify-center">
        <Toggle
          value={activeTab}
          options={tabs.map(({ id, label }) => ({ value: id, label }))}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'deposit' && <DepositTab />}
      {activeTab === 'borrow' && <BorrowTab />}
      {activeTab === 'repay' && <RepayTab />}
      {activeTab === 'withdraw' && <WithdrawTab />}
    </div>
  )
}

