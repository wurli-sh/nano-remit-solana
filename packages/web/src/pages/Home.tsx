import { Hero, Gateway, VaultTierFrameworks, OneClickLiquidity, Deployment } from '@/components/home'
import { Footer } from '@/layout/Footer'

export default function Home() {
  return (
    <>
      <Hero />
      <Gateway />
      <VaultTierFrameworks />
      <OneClickLiquidity />
      <Deployment />
      <Footer />
    </>
  )
}
