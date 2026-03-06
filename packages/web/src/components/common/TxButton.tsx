import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { getExplorerTxUrl } from '@/web3/constants'

import type { ReactNode } from 'react'

interface TxButtonProps {
  label: string
  loadingLabel?: string
  onClick: () => void
  isPending: boolean
  isConfirmed: boolean
  error: Error | null
  txSignature?: string | null
  disabled?: boolean
  onSuccess?: () => void
  children?: ReactNode
}

/** Button that follows the sign → confirm state machine for Solana transactions. */
export function TxButton({
  label,
  loadingLabel,
  onClick,
  isPending,
  isConfirmed,
  error,
  txSignature,
  disabled,
}: TxButtonProps) {
  const [errorExpanded, setErrorExpanded] = useState(false)

  function getLabel(): string {
    if (isPending) return loadingLabel ?? 'Confirm in wallet...'
    if (isConfirmed) return 'Confirmed!'
    return label
  }

  const explorerUrl = txSignature ? getExplorerTxUrl(txSignature) : null
  const isUserRejection = error?.message?.includes('User rejected')
  const decodedError = error ? decodeError(error) : null
  const isTruncated = decodedError !== null && decodedError.endsWith('...')

  return (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        loading={isPending}
        disabled={disabled ?? isPending ?? isConfirmed}
        variant={isConfirmed ? 'secondary' : 'primary'}
        className="w-full"
      >
        {getLabel()}
      </Button>

      {txSignature && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          View on Solana Explorer <ExternalLink className="size-3" />
        </a>
      )}

      {error && !isUserRejection && decodedError && (
        <div className="space-y-1">
          <p className="break-all text-sm text-destructive">
            {errorExpanded ? error.message : decodedError}
          </p>
          {isTruncated && (
            <button
              type="button"
              onClick={() => setErrorExpanded((v) => !v)}
              className="text-xs text-destructive/70 underline hover:text-destructive"
            >
              {errorExpanded ? 'Show less' : 'Show full error'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function decodeError(error: Error): string {
  const msg = error.message

  // Common Anchor program errors
  if (msg.includes('InsufficientCollateral')) return 'Borrow amount exceeds your LTV limit'
  if (msg.includes('DebtNotZero')) return 'Repay all debt before withdrawing'
  if (msg.includes('ZeroAmount')) return 'Amount cannot be zero'
  if (msg.includes('NoDebt')) return 'You have no debt to repay'
  if (msg.includes('TokenNotDeposited')) return 'Token is not in your vault'
  if (msg.includes('MaxDepositsReached')) return 'Maximum deposits reached (50)'
  if (msg.includes('InsufficientRepayments')) return 'Not enough repayments for this tier'
  if (msg.includes('Paused')) return 'Vault is currently paused'
  if (msg.includes('InvalidNftSupply')) return 'NFT must have supply of exactly 1'
  if (msg.includes('Simulation failed')) return 'Transaction simulation failed — click "Show full error" for details...'

  // Truncate long messages
  if (msg.length > 120) return `${msg.slice(0, 120)}...`
  return msg
}
