use anchor_lang::prelude::*;

/// Fixed notional value per receipt: 100 NanoUSD (9 decimals)
pub const RECEIPT_VALUE: u64 = 100_000_000_000;

/// Seconds per year (365.25 days)
pub const SECONDS_PER_YEAR: u64 = 31_557_600;

/// Maximum number of deposited receipts per user
pub const MAX_DEPOSITS_PER_USER: u8 = 50;

/// NanoUSD SPL Token decimal places
pub const NANOUSD_DECIMALS: u8 = 9;

/// Metaplex Token Metadata program ID (mainnet / devnet)
pub const MPL_TOKEN_METADATA_ID: Pubkey = pubkey!("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/// Max LTV basis points per tier: [Tier 1, Tier 2, Tier 3]
pub const LTV_BPS: [u16; 3] = [4000, 6000, 7500];

/// Borrow rate basis points per tier: [Tier 1, Tier 2, Tier 3]
pub const RATE_BPS: [u16; 3] = [2000, 1200, 800];

/// Minimum repayment count thresholds per tier
pub const MIN_REPAYMENTS: [u16; 3] = [0, 3, 10];

/// Get the LTV basis points for a given tier.
/// Tier 0 (unset) defaults to Tier 1.
pub fn get_ltv_for_tier(tier: u8) -> u16 {
    let idx = if tier == 0 { 0 } else { (tier - 1) as usize };
    LTV_BPS[idx.min(2)]
}

/// Get the borrow rate basis points for a given tier.
/// Tier 0 (unset) defaults to Tier 1.
pub fn get_rate_for_tier(tier: u8) -> u16 {
    let idx = if tier == 0 { 0 } else { (tier - 1) as usize };
    RATE_BPS[idx.min(2)]
}
