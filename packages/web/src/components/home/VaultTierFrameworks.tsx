import { useState } from 'react'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/utils/cn'
import { fadeInUp, scrollViewport } from '@/utils/animations'

const tiers = [
  {
    id: 1,
    label: 'Bronze Tier',
    sub: 'Default Tier',
    description: 'Default tier for all users. Start building your on-chain credit history through consistent Vault deposits and repayments.',
    maxLtv: '40%',
    ltvDelta: 'Base rate',
    apr: '20%',
    aprDelta: 'Base rate',
    badgeColor: 'bg-amber-700',
    requirements: [
      'Connected Solana wallet (Phantom, Solflare)',
      'No minimum repayment requirement',
      'Available to all users',
    ],
  },
  {
    id: 2,
    label: 'Silver Tier',
    sub: '3+ Repayments',
    description: 'Unlocked after 3 qualifying repayments. Each repayment must be at least 10% of your outstanding debt.',
    maxLtv: '60%',
    ltvDelta: '+20% from Bronze',
    apr: '12%',
    aprDelta: '↓ 8% from Bronze',
    badgeColor: 'bg-slate-400',
    requirements: [
      'Minimum 3 qualifying repayments',
      'Each repayment ≥ 10% of debt',
      'Automatic upgrade when eligible',
    ],
  },
  {
    id: 3,
    label: 'Gold Tier',
    sub: '10+ Repayments',
    description: 'The highest tier reserved for consistent users. Maximum borrowing power with the lowest rates in the protocol.',
    maxLtv: '75%',
    ltvDelta: '+15% from Silver',
    apr: '8%',
    aprDelta: '↓ 4% from Silver',
    badgeColor: 'bg-yellow-400',
    requirements: [
      'Minimum 10 qualifying repayments',
      'Each repayment ≥ 10% of debt',
      'Automatic upgrade when eligible',
    ],
  },
]

export function VaultTierFrameworks() {
  const [selectedTier, setSelectedTier] = useState(2)
  const tier = tiers.find((t) => t.id === selectedTier)!

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          className="text-balance text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl"
        >
          Vault Tier Frameworks
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          transition={{ delay: 0.1 }}
          className="mt-4 text-center text-muted-foreground"
        >
          Structured progression for scalable borrowing power. All credit history stored immutably on-chain.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          transition={{ delay: 0.2 }}
          className="mt-16 grid grid-cols-[220px_1fr] overflow-hidden rounded-2xl border border-border"
        >
          {/* Left — tier list */}
          <div className="border-r border-border">
            {tiers.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex w-full items-center justify-between px-5 py-4 text-left transition-colors',
                  selectedTier === t.id
                    ? 'border-l-2 border-l-primary bg-secondary'
                    : 'border-l-2 border-l-transparent hover:bg-muted'
                )}
              >
                <div>
                  <p className={cn('text-sm font-semibold', selectedTier === t.id ? 'text-primary' : 'text-foreground')}>
                    {t.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.sub}</p>
                </div>
                <ChevronRight className={cn('size-4', selectedTier === t.id ? 'text-primary' : 'text-muted-foreground')} />
              </motion.button>
            ))}
          </div>

          {/* Right — tier detail */}
          <div className="h-105 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {tier.description ? (
                <motion.div
                  key={selectedTier}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-foreground">{tier.label}</h3>
                    </div>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <div className={cn("flex shrink-0 items-center justify-center rounded-xl px-5 py-3", tier.badgeColor)}>
                    <p className="text-sm font-bold text-white">Tier {tier.id}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Max LTV</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{tier.maxLtv}</p>
                    <p className="mt-1 text-xs text-primary">{tier.ltvDelta}</p>
                  </div>
                  <div className="rounded-xl border border-border p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Borrowing APR</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{tier.apr}</p>
                    <p className="mt-1 text-xs text-primary">{tier.aprDelta}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-foreground">Tier Requirements:</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {tier.requirements!.map((req) => (
                      <li key={req} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full items-center justify-center text-sm text-muted-foreground"
                >
                  Select a tier to view details
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
