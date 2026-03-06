use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount};

use crate::errors::VaultError;
use crate::events::Repaid;
use crate::helpers::accrue_interest;
use crate::state::{UserVault, VaultConfig};

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"vault_config"],
        bump = vault_config.bump,
        // NOTE: repay is NEVER paused — users must always be able to reduce risk
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        mut,
        seeds = [b"user_vault", user.key().as_ref()],
        bump = user_vault.bump,
        constraint = user_vault.user == user.key() @ VaultError::Unauthorized,
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        mut,
        address = vault_config.nano_usd_mint,
    )]
    pub nano_usd_mint: Account<'info, Mint>,

    /// CHECK: PDA signer for interest minting to treasury.
    #[account(
        seeds = [b"nano_usd_authority"],
        bump = vault_config.nano_usd_authority_bump,
    )]
    pub nano_usd_authority: UncheckedAccount<'info>,

    /// User's NanoUSD ATA — tokens are burned from here.
    #[account(
        mut,
        associated_token::mint = nano_usd_mint,
        associated_token::authority = user,
    )]
    pub user_nano_usd_ata: Account<'info, TokenAccount>,

    /// CHECK: Must match vault_config.protocol_treasury
    #[account(address = vault_config.protocol_treasury)]
    pub treasury: UncheckedAccount<'info>,

    /// Treasury's NanoUSD ATA — receives accrued interest.
    #[account(
        mut,
        associated_token::mint = nano_usd_mint,
        associated_token::authority = treasury,
    )]
    pub treasury_nano_usd_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Repay>, amount: u64) -> Result<()> {
    require!(amount > 0, VaultError::ZeroAmount);

    let clock = Clock::get()?;

    // Accrue interest before repay (mints interest to treasury)
    accrue_interest(
        &mut ctx.accounts.user_vault,
        ctx.accounts.nano_usd_mint.to_account_info(),
        ctx.accounts.nano_usd_authority.to_account_info(),
        ctx.accounts.treasury_nano_usd_ata.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.vault_config.nano_usd_authority_bump,
        &clock,
    )?;

    let user_vault = &mut ctx.accounts.user_vault;
    let pre_repay_debt = user_vault.debt;

    // Cap repay amount to current debt
    let actual_repay = amount.min(user_vault.debt);
    require!(actual_repay > 0, VaultError::ZeroAmount);

    // Reduce debt
    user_vault.debt = user_vault
        .debt
        .checked_sub(actual_repay)
        .ok_or(VaultError::MathOverflow)?;

    // Burn NanoUSD from user (user signs the transaction)
    let cpi_accounts = Burn {
        mint: ctx.accounts.nano_usd_mint.to_account_info(),
        from: ctx.accounts.user_nano_usd_ata.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::burn(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        actual_repay,
    )?;

    // Increment repayment_count if payment >= 10% of pre-repay debt
    // Prevents gaming via dust repayments
    let threshold = pre_repay_debt / 10;
    if actual_repay >= threshold && threshold > 0 {
        user_vault.repayment_count = user_vault.repayment_count.saturating_add(1);
    }

    emit!(Repaid {
        user: ctx.accounts.user.key(),
        amount: actual_repay,
        remaining_debt: user_vault.debt,
    });

    Ok(())
}
