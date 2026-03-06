<div align="center">
  <img src="./nano-remit.png" width="100%" alt="solana" />
</div>

**Turn idle remittances into active capital.** Deposit, borrow, and build on-chain credit history—powered by Solana.

## Deployed on Devnet

| Resource | Address |
|----------|---------|
| **Live App** | [https://nano-remit-solana.vercel.app](https://nano-remit-solana.vercel.app) |
| **Live Demo** | [https://youtu.be/G_tleWsgKH8](https://youtu.be/G_tleWsgKH8) |
| **Program** | [`4rmSRCR7TesHWjQZkHwQa8XwQoh6kBJe9r2DF2mz5z9D`](https://explorer.solana.com/address/4rmSRCR7TesHWjQZkHwQa8XwQoh6kBJe9r2DF2mz5z9D?cluster=devnet) |
| **RPC** | `https://api.devnet.solana.com` |
| **Cluster** | `devnet` |

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
VITE_SOLANA_CLUSTER=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=4rmSRCR7TesHWjQZkHwQa8XwQoh6kBJe9r2DF2mz5z9D
VITE_API_URL=http://localhost:3001                  # Optional
```

**Anchor** (`Anchor.toml` in `packages/programs`):
```toml
[programs.devnet]
nanoremit_vault = "4rmSRCR7TesHWjQZkHwQa8XwQoh6kBJe9r2DF2mz5z9D"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

---
