import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui'
import { VaultModel } from '@/components/home/VaultModel'
import { fadeInUp, staggerContainer, buttonHover, buttonTap } from '@/utils/animations'

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-16">
      {/* 3D Vault Model — behind text content, shifted below buttons */}
      <div className="absolute inset-0 top-[60%] z-0 flex items-start justify-center">
        {/* Glow backdrop */}
        <div className="h-full w-full">
          <VaultModel />
        </div>
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-bright/40 px-4 py-2 text-sm font-medium text-primary"
          variants={fadeInUp}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Built on Solana
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl"
          variants={fadeInUp}
        >
          Turn Remittances Into{' '}
          <span className="text-foreground">Real Borrowing Power</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
          variants={fadeInUp}
        >
          Deposit your remittances into NanoRemit Vault. Unlock higher borrowing
          limits, lower APRs, and build on-chain credit history seamlessly on Solana.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          variants={fadeInUp}
        >
          <Link to="/mint">
            <motion.div
              whileHover={buttonHover}
              whileTap={buttonTap}
            >
              <Button size="lg" className="gap-2 rounded-full bg-charcoal text-white hover:bg-charcoal/90">
                Launch App
              </Button>
            </motion.div>
          </Link>
          <motion.a
            href="https://github.com/wurli-sh/nano-remit-solana"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 text-base font-medium text-foreground transition-colors hover:bg-muted"
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            View on Github
          </motion.a>
        </motion.div>

        {/* Spacer so content doesn't overlap the model too much */}
        <div className="mt-40 md:mt-48" />
      </motion.div>
    </section>
  )
}
