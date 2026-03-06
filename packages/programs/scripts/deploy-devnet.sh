#!/usr/bin/env bash
set -euo pipefail

# ─── NanoRemit Vault — Devnet Deploy Script ───
# Prereqs: anchor, solana CLI, ~/.config/solana/id.json with ≥4 SOL on devnet
#
# Quick fund options if faucet is rate-limited:
#   1. https://faucet.solana.com  (web UI, 2 SOL per request)
#   2. https://solfaucet.com      (alternative faucet)
#   3. solana airdrop 2 --url devnet   (CLI, may be rate-limited)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CLUSTER="devnet"
RPC_URL="https://api.devnet.solana.com"
PROGRAM_SO="$PROJECT_DIR/target/deploy/nanoremit_vault.so"
KEYPAIR="$PROJECT_DIR/target/deploy/nanoremit_vault-keypair.json"

echo "=== NanoRemit Vault — Devnet Deployment ==="
echo ""

# 1. Verify program binary exists
if [[ ! -f "$PROGRAM_SO" ]]; then
  echo "❌ Program binary not found. Run: anchor build"
  exit 1
fi

PROGRAM_SIZE=$(stat -c%s "$PROGRAM_SO" 2>/dev/null || stat -f%z "$PROGRAM_SO")
echo "✅ Program binary: $(numfmt --to=iec "$PROGRAM_SIZE" 2>/dev/null || echo "${PROGRAM_SIZE} bytes")"

# 2. Verify keypair
PROGRAM_ID=$(solana address -k "$KEYPAIR")
echo "✅ Program ID: $PROGRAM_ID"

# 3. Check wallet balance
WALLET=$(solana address)
BALANCE=$(solana balance --url "$RPC_URL" | awk '{print $1}')
RENT=$(solana rent "$PROGRAM_SIZE" --url "$RPC_URL" | grep -oP '[\d.]+' | head -1)

echo "📍 Deployer: $WALLET"
echo "💰 Balance: $BALANCE SOL"
echo "💸 Required: ~$RENT SOL (rent-exempt)"
echo ""

# 4. Check sufficient balance
if (( $(echo "$BALANCE < $RENT + 0.01" | bc -l) )); then
  NEEDED=$(echo "$RENT - $BALANCE + 0.5" | bc -l)
  echo "⚠️  Insufficient balance. Need ~$(printf '%.2f' "$NEEDED") more SOL."
  echo ""
  echo "Fund your wallet: $WALLET"
  echo "  → https://faucet.solana.com"
  echo "  → solana airdrop 2 --url devnet"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

# 5. Deploy
echo "🚀 Deploying to $CLUSTER..."
cd "$PROJECT_DIR"
anchor deploy --provider.cluster "$CLUSTER"

echo ""
echo "✅ Deployed successfully!"
echo "   Program ID: $PROGRAM_ID"
echo "   Explorer:   https://explorer.solana.com/address/$PROGRAM_ID?cluster=$CLUSTER"
echo ""
echo "Next: Initialize the vault by calling the 'initialize' instruction"
echo "      with your deployer wallet as authority."
