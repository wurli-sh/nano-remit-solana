use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod helpers;
pub mod state;

pub mod borrow;
pub mod deposit_receipt;
pub mod faucet;
pub mod initialize;
pub mod pause;
pub mod repay;
pub mod set_tier;
pub mod withdraw_receipt;

use borrow::*;
use deposit_receipt::*;
use faucet::*;
use initialize::*;
use pause::*;
use repay::*;
use set_tier::*;
use withdraw_receipt::*;

declare_id!("4rmSRCR7TesHWjQZkHwQa8XwQoh6kBJe9r2DF2mz5z9D");

#[program]
pub mod nanoremit_vault {
    use super::*;

    /// Initialize the vault: creates VaultConfig PDA, NanoUSD mint, and stores config.
    /// Called once by the deployer.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    /// Deposit a Metaplex receipt NFT into the vault as collateral.
    /// Creates UserVault (if first deposit) and DepositEntry PDAs.
    pub fn deposit_receipt(ctx: Context<DepositReceipt>) -> Result<()> {
        deposit_receipt::handler(ctx)
    }

    /// Borrow NanoUSD against deposited collateral.
    /// Accrues interest, enforces LTV based on tier, mints NanoUSD to user.
    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        borrow::handler(ctx, amount)
    }

    /// Repay NanoUSD debt. Burns tokens from user, conditionally increments repayment_count.
    /// Never paused — users must always be able to reduce risk.
    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        repay::handler(ctx, amount)
    }

    /// Withdraw a receipt NFT from the vault. Requires debt == 0.
    /// Closes DepositEntry PDA (rent returned to user).
    pub fn withdraw_receipt(ctx: Context<WithdrawReceipt>) -> Result<()> {
        withdraw_receipt::handler(ctx)
    }

    /// Set a user's tier (1–3). Authority only.
    pub fn set_tier(ctx: Context<SetTier>, new_tier: u8) -> Result<()> {
        set_tier::handler(ctx, new_tier)
    }

    /// Dev faucet: mint NanoUSD to a recipient. Authority only.
    /// Used for demos so users have NanoUSD to cover interest on repay.
    pub fn faucet(ctx: Context<Faucet>, amount: u64) -> Result<()> {
        faucet::handler(ctx, amount)
    }

    /// Pause the vault. Blocks deposit, borrow, and withdraw (not repay).
    pub fn pause(ctx: Context<Pause>) -> Result<()> {
        pause::pause_handler(ctx)
    }

    /// Unpause the vault.
    pub fn unpause(ctx: Context<Pause>) -> Result<()> {
        pause::unpause_handler(ctx)
    }
}
