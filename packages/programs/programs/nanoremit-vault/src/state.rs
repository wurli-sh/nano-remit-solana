use anchor_lang::prelude::*;

/// Global vault configuration. Created once via `initialize`.
/// Seeds: [b"vault_config"]
#[account]
pub struct VaultConfig {
    /// Admin / deployer pubkey
    pub authority: Pubkey,
    /// NanoUSD SPL Token mint address
    pub nano_usd_mint: Pubkey,
    /// Protocol treasury wallet pubkey
    pub protocol_treasury: Pubkey,
    /// Whether the vault is paused
    pub paused: bool,
    /// PDA bump for vault_config
    pub bump: u8,
    /// PDA bump for nano_usd_authority
    pub nano_usd_authority_bump: u8,
}
// Exact: 8 (discriminator) + 32*3 + 1 + 1 + 1 = 107 bytes
// Alloc: 200 bytes (padded for future fields)

/// Per-user vault state. Created on first deposit (init_if_needed).
/// Seeds: [b"user_vault", user.key()]
#[account]
pub struct UserVault {
    /// User's wallet pubkey
    pub user: Pubkey,
    /// Tier: 0 = unset (→ Tier 1), 1–3
    pub tier: u8,
    /// Current debt in NanoUSD (9 decimals)
    pub debt: u64,
    /// Unix timestamp of last interest accrual
    pub last_accrual: i64,
    /// Number of qualifying repayments
    pub repayment_count: u16,
    /// Number of deposited receipts
    pub deposit_count: u8,
    /// PDA bump
    pub bump: u8,
}
// Exact: 8 + 32 + 1 + 8 + 8 + 2 + 1 + 1 = 61 bytes
// Alloc: 128 bytes (padded for future fields)

/// Per-deposit record proving which user deposited which NFT.
/// Seeds: [b"deposit", user.key(), nft_mint.key()]
/// Closed on withdraw (rent returned to user).
#[account]
pub struct DepositEntry {
    /// Depositor pubkey
    pub user: Pubkey,
    /// NFT mint address
    pub nft_mint: Pubkey,
    /// Unix timestamp when deposited
    pub deposited_at: i64,
    /// PDA bump
    pub bump: u8,
}
// Exact: 8 + 32 + 32 + 8 + 1 = 81 bytes
// Alloc: 96 bytes (padded)
