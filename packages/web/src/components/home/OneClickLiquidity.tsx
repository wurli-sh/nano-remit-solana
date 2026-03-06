import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { StepWallet, StepLockToken, StepTokens } from '@/assets'
import { cn } from '@/utils/cn'
import { fadeInUp, scrollViewport } from '@/utils/animations'

const steps = [
  {
    number: '1.',
    title: 'Connect Wallet',
    description: 'Link your Solana wallet containing NanoUSD remittances.',
    step: 'STEP ONE',
    image: StepWallet,
  },
  {
    number: '2.',
    title: 'Lock Collateral',
    description: 'Deposit receipt NFTs into the Solana Vault program to secure your credit line.',
    step: 'STEP TWO',
    image: StepLockToken,
  },
  {
    number: '3.',
    title: 'Draw Stablecoins',
    description: 'Instantly borrow against your locked value at your current tier rate.',
    step: 'STEP THREE',
    image: StepTokens,
  },
]

export function OneClickLiquidity() {
  const [activeStep, setActiveStep] = useState(0)
  const currentStep = steps[activeStep]!

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
          One-Click Liquidity
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          transition={{ delay: 0.1 }}
          className="mt-4 text-center text-muted-foreground"
        >
          Deploy your remittance capital seamlessly on Solana.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          transition={{ delay: 0.2 }}
          className="mt-16 grid h-105 overflow-hidden rounded-2xl border border-border md:grid-cols-2"
        >
          {/* Left — dynamic image with glow */}
          <div className="relative flex items-center justify-center border-r border-border bg-primary-bright/5 p-8">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-bl from-primary-bright/15 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-bright/20 blur-3xl" />
            <AnimatePresence mode="wait">
              <motion.img
                key={activeStep}
                src={currentStep.image}
                alt={currentStep.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 h-80 object-contain drop-shadow-2xl"
              />
            </AnimatePresence>
          </div>

          {/* Right — step list */}
          <div className="flex flex-col divide-y divide-border">
            {steps.map((s, i) => (
              <motion.button
                key={s.step}
                onClick={() => setActiveStep(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex flex-1 gap-4 px-6 py-5 text-left transition-colors',
                  activeStep === i ? 'bg-secondary/90' : 'hover:bg-muted/50'
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    activeStep === i
                      ? 'bg-muted text-primary-dark'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className={cn('text-lg font-bold', activeStep === i ? 'text-primary' : 'text-foreground')}>
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{s.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
