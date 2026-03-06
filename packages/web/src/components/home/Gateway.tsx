import { motion } from 'framer-motion'

import { GatewayFunnel, GatewayCubes, GatewayGlobe } from '@/assets'
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, hoverScale, scrollViewport } from '@/utils/animations'

export function Gateway() {
  return (
    <section className="py-24">
      <motion.div 
        className="mx-auto max-w-4xl px-6"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={staggerContainer}
      >
        {/* Section heading */}
        <motion.h2 
          className="text-balance text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl"
          variants={fadeInUp}
        >
          The Gateway to Global Credit
        </motion.h2>
        <motion.p 
          className="mt-4 text-center text-muted-foreground"
          variants={fadeInUp}
        >
          Secured by Solana&apos;s high-performance blockchain and real-world asset infrastructure.
        </motion.p>

        {/* Bento grid */}
        <motion.div 
          className="mt-16 grid gap-6 md:grid-cols-2"
          variants={staggerContainer}
        >
          {/* Left card — dark vault card with globe */}
          <motion.div 
            className="relative row-span-2 overflow-hidden rounded-2xl bg-charcoal p-8 text-white"
            variants={fadeInLeft}
            whileHover="hover"
          >
            {/* Dotted background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(159, 232, 112, 0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10">
              <h3 className="text-xl font-bold">
                NanoRemit&apos;s Global Vault
              </h3>
              <p className="mt-3 max-w-65 text-sm leading-relaxed text-white/70 text-pretty">
                Access global credit markets and build your on-chain reputation
                all in one secure place.
              </p>
            </div>
            {/* Globe — large, centered, tight to text */}
            <div className="relative mt-6 flex items-center justify-center">
              <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-bright/20 blur-3xl" />
              <motion.img
                src={GatewayGlobe}
                alt="Global vault"
                className="relative z-10 w-full max-w-sm object-contain drop-shadow-2xl"
                variants={hoverScale}
              />
            </div>
          </motion.div>

          {/* Right top — Remittance Vault */}
          <motion.div 
            className="relative overflow-hidden rounded-2xl border border-border bg-primary-bright/5"
            variants={fadeInRight}
            whileHover="hover"
          >
            {/* Dotted background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(22, 51, 0, 0.6) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            {/* Tinted glow wash */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-bl from-primary-bright/15 via-transparent to-transparent" />
            {/* Image — flush to top and right edge */}
            <div className="relative flex justify-end">
              <motion.img
                src={GatewayFunnel}
                alt="Remittance funnel"
                className="relative z-10 h-52 object-contain object-top-right drop-shadow-xl"
                variants={hoverScale}
              />
            </div>
            <div className="relative z-10 px-6 pb-6">
              <h3 className="text-xl font-bold text-foreground">
                Remittance Vault
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Secure your incoming transfers seamlessly.
              </p>
            </div>
          </motion.div>

          {/* Right bottom — On-chain Credit */}
          <motion.div 
            className="relative overflow-hidden rounded-2xl border border-border bg-primary-bright/5"
            variants={fadeInRight}
            whileHover="hover"
          >
            {/* Dotted background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(22, 51, 0, 0.6) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            {/* Tinted glow wash */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-bl from-primary-bright/15 via-transparent to-transparent" />
            {/* Image — flush to top and right edge */}
            <div className="relative flex justify-end">
              <motion.img
                src={GatewayCubes}
                alt="On-chain credit"
                className="relative z-10 h-52 object-contain object-top-right drop-shadow-xl"
                variants={hoverScale}
              />
            </div>
            <div className="relative z-10 px-6 pb-6">
              <h3 className="text-xl font-bold text-foreground">
                On-chain Credit
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Build immutable financial history.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
