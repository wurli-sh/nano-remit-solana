import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { NanoVaultLogo } from '@/assets'
import { cn } from '@/utils/cn'
import { truncateAddress } from '@/utils/format'
import { useWalletReady } from '@/web3/hooks'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/mint', label: 'Mint' },
  { to: '/vault', label: 'Vault' },
] as const

export function Header() {
  const { pathname } = useLocation()

  return (
    <header
      className="sticky top-0 z-40 flex justify-center px-4"
    >
      <div
        className="mt-4 grid h-14 w-full max-w-5xl grid-cols-3 items-center rounded-full bg-charcoal/95 px-6 shadow-lg backdrop-blur-md"
      >
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-white">
            <img src={NanoVaultLogo} alt="NanoRemit" className="size-6" />
            <span className="text-base font-bold tracking-tight text-primary-bright">NanoRemit</span>
            <span className="ml-2 hidden rounded-full bg-primary-bright/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-bright sm:inline">
              Solana
            </span>
          </Link>
        </div>

        {/* Nav links — centered */}
        <nav className="hidden items-center justify-center gap-1 sm:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === to
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
              )}
            >
              {pathname === to && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-lg bg-white/15"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Wallet button — right aligned */}
        <div className="flex justify-end">
          <WalletButton />
        </div>
      </div>
    </header>
  )
}

function WalletButton() {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet()
  const { setVisible } = useWalletModal()
  const walletReady = useWalletReady()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Show skeleton pill while autoConnect is settling
  if (!walletReady) {
    return (
      <div className="h-9 w-36 animate-pulse rounded-full bg-white/10" />
    )
  }

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-primary-bright px-4 py-2 text-sm font-semibold text-primary-dark transition hover:brightness-110 disabled:opacity-50"
      >
        <Wallet className="size-4" />
        {connecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
    )
  }

  const address = publicKey.toBase58()
  const label = truncateAddress(address)
  const icon = wallet?.adapter.icon

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
      >
        {icon && <img src={icon} alt="" className="size-4 rounded-full" />}
        <span className="font-mono text-xs">{label}</span>
        <ChevronDown className={cn('size-3.5 transition-transform', menuOpen && 'rotate-180')} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white shadow-xl">
          {/* Address header */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Connected
            </p>
            <p className="mt-0.5 font-mono text-xs text-foreground">{label}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(address)
                setMenuOpen(false)
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
            >
              <Copy className="size-4 text-muted-foreground" />
              Copy Address
            </button>

            <a
              href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
            >
              <ExternalLink className="size-4 text-muted-foreground" />
              View on Explorer
            </a>

            <button
              onClick={() => {
                disconnect()
                setMenuOpen(false)
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-destructive transition hover:bg-destructive/5"
            >
              <LogOut className="size-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
