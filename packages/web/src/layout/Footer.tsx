import { motion } from 'framer-motion'

import { Footer1 } from '@/assets'
import { fadeInUp, scrollViewport } from '@/utils/animations'

export function Footer() {
  return (
    <footer className="relative mt-20 flex min-h-[105vh] flex-col justify-end overflow-hidden">
      
      {/* Description text */}
      <motion.div
        className="relative z-10 mb-16 px-6"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
      >
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-white text-wide text-pretty text-shadow-accent-foreground">
          Every month, millions send money home—to parents in Nepal, to families building futures across borders. 
          But those remittances just sit there, losing value while waiting. NanoRemit turns idle remittances into active 
          capital. Deposit what you've sent. Borrow against it. Build on-chain credit history. From remittances to 
          financial freedom, powered by <span className="rounded bg-primary-bright px-2 py-0.5 font-semibold text-accent-foreground">Solana.</span>
        </p>
      </motion.div>
      
      {/* Text upfront (in front) - positioned just above the image */}
      <motion.p
        className="pointer-events-none relative z-10 mb-8 select-none text-center font-black text-ghost"
        style={{ fontSize: '12vw', lineHeight: 1 }}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        transition={{ delay: 0.2 }}
      >
        NANOREMIT
      </motion.p>
      
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
        <img src={Footer1} alt="" className="w-full object-contain object-bottom " />
      </div>
    </footer>
  )
}
