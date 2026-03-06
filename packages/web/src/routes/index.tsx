import { Routes, Route } from 'react-router-dom'

import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import Mint from '@/pages/Mint'
import Vault from '@/pages/Vault'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/mint" element={<Mint />} />
      <Route path="/vault" element={<Vault />} />
    </Routes>
  )
}
