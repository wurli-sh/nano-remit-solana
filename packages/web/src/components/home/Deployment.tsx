import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui'
import { fadeInUp, staggerContainer, buttonHover, buttonTap, scrollViewport } from '@/utils/animations'

export function Deployment() {
  return (
    <section className="relative pb-0 pt-32">
      <motion.div 
        className="mx-auto max-w-4xl px-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={staggerContainer}
      >
        <motion.h2 
          className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl"
          variants={fadeInUp}
        >
          Bring Global Credit to{' '}
          <span className="text-foreground">Your Families</span>
        </motion.h2>

        <motion.p 
          className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground"
          variants={fadeInUp}
        >
          Build, scale, and secure your financial future with NanoRemit today.
          Powered by Solana's high-performance blockchain.
        </motion.p>

        <motion.div 
          className="mt-10"
          variants={fadeInUp}
        >
          <Link to="/mint">
            <motion.div
              whileHover={buttonHover}
              whileTap={buttonTap}
            >
              <Button
                size="lg"
                className="gap-2 rounded-full bg-charcoal text-white hover:bg-charcoal/90"
              >
                Adopt now
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
