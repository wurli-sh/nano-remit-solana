/**
 * Initialize the NanoRemit Vault on devnet.
 * Run once after deploying the program.
 *
 * Usage: npx ts-node scripts/initialize.ts
 */
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load IDL
const IDL = JSON.parse(readFileSync(resolve(__dirname, '../target/idl/nanoremit_vault.json'), 'utf-8'))

const PROGRAM_ID = new PublicKey('4rmSRCR7TesHWjQZkHwQa8XwQoh6kBJe9r2DF2mz5z9D')

async function main() {
  // Load deploy keypair
  const walletPath = resolve(process.env.HOME!, '.config/solana/nanoremit-deploy.json')
  const secretKey = JSON.parse(readFileSync(walletPath, 'utf-8'))
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey))

  console.log('Authority:', keypair.publicKey.toBase58())

  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  const wallet = new Wallet(keypair)
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })

  // @ts-ignore - IDL typing
  const program = new Program(IDL, provider)

  // Derive PDAs
  const [vaultConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_config')],
    PROGRAM_ID,
  )
  const [nanoUsdMint] = PublicKey.findProgramAddressSync(
    [Buffer.from('nano_usd_mint')],
    PROGRAM_ID,
  )
  const [nanoUsdAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('nano_usd_authority')],
    PROGRAM_ID,
  )

  // Use the deploy wallet as treasury for devnet testing
  const protocolTreasury = keypair.publicKey

  console.log('VaultConfig PDA:', vaultConfig.toBase58())
  console.log('NanoUSD Mint PDA:', nanoUsdMint.toBase58())
  console.log('NanoUSD Authority PDA:', nanoUsdAuthority.toBase58())
  console.log('Treasury:', protocolTreasury.toBase58())

  try {
    // @ts-ignore
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: keypair.publicKey,
        vaultConfig,
        nanoUsdMint,
        nanoUsdAuthority,
        protocolTreasury,
      })
      .rpc()

    console.log('\n✅ Vault initialized!')
    console.log('Transaction:', tx)
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`)
  } catch (err: any) {
    if (err.message?.includes('already in use')) {
      console.log('\n⚠️  Vault already initialized (PDA accounts exist)')
    } else {
      console.error('\n❌ Error:', err.message || err)
      throw err
    }
  }
}

main()
