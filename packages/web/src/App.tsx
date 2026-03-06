import { BrowserRouter, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'

import { Header } from '@/layout/Header'
import { SolanaProvider } from '@/web3/solana-providers'
import { AppRoutes } from '@/routes'

function AppContent() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      {isHome ? (
        <AppRoutes />
      ) : (
        <main className="mx-auto max-w-4xl px-6 py-8 pt-16">
          <AppRoutes />
        </main>
      )}
    </div>
  )
}

export function App() {
  return (
    <SolanaProvider>
      <BrowserRouter>
        <AppContent />
        <Toaster 
          richColors 
          position="bottom-right" 
          theme="light"
          toastOptions={{
            style: {
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-foreground)',
              fontFamily: 'var(--font-sans)',
            },
            className: 'sonner-toast',
          }}
        />
      </BrowserRouter>
    </SolanaProvider>
  )
}
