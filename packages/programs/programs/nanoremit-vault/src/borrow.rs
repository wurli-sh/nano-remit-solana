use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount},
};

use crate::constants::{get_ltv_for_tier, RECEIPT_VALUE};
use crate::errors::VaultError;
use crate::events::Borrowed;
use crate::helpers::accrue_interest;
use crate::state::{UserVault, VaultConfig};

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"vault_config"],
        bump = vault_config.bump,
        constraint = !vault_config.paused @ VaultError::Paused,
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

    /// CHECK: PDA signer for mint operations. Seeds verified by constraint.
    #[account(
        seeds = [b"nano_usd_authority"],
        bump = vault_config.nano_usd_authority_bump,
    )]
    pub nano_usd_authority: UncheckedAccount<'info>,

    /// User's NanoUSD ATA — receives borrowed principal.
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = nano_usd_mint,
        associated_token::authority = user,
    )]
    pub user_nano_usd_ata: Account<'info, TokenAccount>,

    /// CHECK: Must match vault_config.protocol_treasury
    #[account(address = vault_config.protocol_treasury)]
    pub treasury: UncheckedAccount<'info>,

    /// Treasury's NanoUSD ATA — receives accrued interest.
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = nano_usd_mint,
        associated_token::authority = treasury,
    )]
    pub treasury_nano_usd_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Borrow>, amount: u64) -> Result<()> {
    require!(amount > 0, VaultError::ZeroAmount);

    let clock = Clock::get()?;

    // Accrue interest on existing debt before modifying it
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

    // Calculate max borrow: collateral * ltv_bps / 10_000
    let collateral = (user_vault.deposit_count as u64)
        .checked_mul(RECEIPT_VALUE)
        .ok_or(VaultError::MathOverflow)?;
    let ltv_bps = get_ltv_for_tier(user_vault.tier) as u64;
    let max_borrow = collateral
        .checked_mul(ltv_bps)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(VaultError::MathOverflow)?;

    let new_debt = user_vault
        .debt
        .checked_add(amount)
        .ok_or(VaultError::MathOverflow)?;
    require!(new_debt <= max_borrow, VaultError::InsufficientCollateral);

    user_vault.debt = new_debt;

    // Mint NanoUSD principal to user
    let seeds: &[&[u8]] = &[
        b"nano_usd_authority",
        &[ctx.accounts.vault_config.nano_usd_authority_bump],
    ];
    let signer_seeds = &[seeds];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.nano_usd_mint.to_account_info(),
        to: ctx.accounts.user_nano_usd_ata.to_account_info(),
        authority: ctx.accounts.nano_usd_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    token::mint_to(cpi_ctx, amount)?;

    emit!(Borrowed {
        user: ctx.accounts.user.key(),
        amount,
        total_debt: new_debt,
    });

    Ok(())
}
