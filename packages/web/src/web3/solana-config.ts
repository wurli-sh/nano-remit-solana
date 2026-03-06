import { clusterApiUrl, Connection } from '@solana/web3.js'
import { AnchorProvider, Program, type Wallet } from '@coral-xyz/anchor'
import type { NanoremitVault } from './contracts/nanoremit_vault'
import IDL from './contracts/nanoremit_vault.json'

export const PROGRAM_ID = 'Ac1j2omF6m4VeAGQ1eVEBZ9MXimc1UTnoUHoYe6ymHD4'

// Get cluster from env (devnet for hackathon)
const cluster = (import.meta.env.VITE_SOLANA_CLUSTER || 'devnet') as 'devnet' | 'mainnet-beta' | 'testnet'
const rpcEndpoint = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(cluster)

export const connection = new Connection(rpcEndpoint, 'confirmed')

export function getProgram(wallet: Wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  })

  return new Program<NanoremitVault>(IDL as unknown as NanoremitVault, provider)
}

export { cluster, rpcEndpoint }
