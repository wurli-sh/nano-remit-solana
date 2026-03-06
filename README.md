# NanoRemit Vault

> Turn remittances into real borrowing power on Solana.

Every month, millions send money home—to parents in Nepal, to families building futures across borders. But those remittances just sit there, losing value while waiting. **NanoRemit turns idle remittances into active capital.** Deposit what you've sent. Borrow against it. Build on-chain credit history. From remittances to financial freedom, powered by Solana.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           User (Browser)                            │
│                     Phantom / Solflare Wallet                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  sign & send txns
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     React 19 + Vite Frontend                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────────┐  │
│  │  Pages   │  │Components│  │  Web3     │  │  TanStack Query   │  │
│  │Dashboard │  │ 3D Vault │  │  Hooks    │  │  (async state)    │  │
│  │Vault,Mint│  │ Tier UI  │  │  Providers│  │                   │  │
│  └──────────┘  └──────────┘  └─────┬─────┘  └───────────────────┘  │
└────────────────────────────────────┼────────────────────────────────┘
                                     │  @solana/web3.js + Anchor Client
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Solana RPC (Devnet)                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  NanoRemit Vault Program (Anchor)                    │
│                                                                     │
│  ┌────────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  ┌────────┐ │
│  │ initialize │  │deposit │  │ borrow │  │  repay   │  │withdraw│ │
│  └────────────┘  └────────┘  └────────┘  └──────────┘  └────────┘ │
│  ┌────────────┐  ┌────────┐  ┌────────┐                           │
│  │  set_tier  │  │ faucet │  │ pause  │                           │
│  └────────────┘  └────────┘  └────────┘                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      On-Chain Accounts (PDAs)                       │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  Vault State │  │ NanoUSD Mint │  │  Remittance Receipt Mint  │ │
│  │  (config,    │  │ (SPL Token)  │  │  (SPL Token)              │ │
│  │   tiers,     │  │              │  │                           │ │
│  │   paused)    │  │              │  │                           │ │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Per-User PDAs: deposit records, loan state, tier, history   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
nano-remit-solana/
├── packages/
│   ├── programs/                     # Solana / Anchor workspace
│   │   ├── programs/
│   │   │   └── nanoremit-vault/      # Core Anchor program
│   │   │       └── src/
│   │   │           ├── lib.rs        # Entrypoint & instruction dispatch
│   │   │           ├── state.rs      # Account structs
│   │   │           ├── initialize.rs # Vault initialization
│   │   │           ├── deposit_receipt.rs
│   │   │           ├── borrow.rs     # Tier-based borrowing
│   │   │           ├── repay.rs      # Loan repayment
│   │   │           ├── withdraw_receipt.rs
│   │   │           ├── set_tier.rs   # Credit tier management
│   │   │           ├── faucet.rs     # Demo token faucet
│   │   │           ├── pause.rs      # Emergency pause
│   │   │           ├── constants.rs
│   │   │           ├── errors.rs
│   │   │           ├── events.rs
│   │   │           └── helpers.rs
│   │   ├── tests/                    # Integration tests
│   │   └── Anchor.toml
│   └── web/                          # React frontend
│       └── src/
│           ├── components/           # UI components
│           ├── pages/                # Home, Dashboard, Vault, Mint
│           ├── web3/                 # Solana providers, hooks, contracts
│           ├── layout/               # App shell
│           ├── routes/               # Routing
│           └── utils/                # Helpers
└── docs/
```

---

## Local Development

```bash
# 1. Clone
git clone <repo-url> && cd nano-remit-solana

# 2. Smart Contracts
cd packages/programs
yarn install
anchor build
anchor test                           # runs on localnet validator

# 3. Frontend  (new terminal)
cd packages/web
pnpm install
cp .env.example .env                  # configure contract addresses
pnpm dev
```

---

## Environment Setup

**Frontend** (`.env` in `packages/web`):
```bash
VITE_CHAIN_ID=31337                                 # Localnet / Devnet
VITE_NANO_USD=<NanoUSD mint address>                # Deployed NanoUSD mint
VITE_RECEIPT=<Receipt mint address>                 # Deployed Receipt mint
VITE_VAULT=<Vault program address>                  # Deployed NanoRemitVault
VITE_WC_PROJECT_ID=your_wc_project_id               # WalletConnect
VITE_API_URL=http://localhost:3001                  # Backend API (optional)
```

**Anchor** (`Anchor.toml` in `packages/programs`):
```toml
[programs.devnet]
nanoremit_vault = "Ac1j2omF6m4VeAGQ1eVEBZ9MXimc1UTnoUHoYe6ymHD4"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/nanoremit-deploy.json"
```

---
