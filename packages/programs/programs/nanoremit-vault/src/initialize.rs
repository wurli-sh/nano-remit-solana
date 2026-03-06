use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::constants::NANOUSD_DECIMALS;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 200, // padded for future fields
        seeds = [b"vault_config"],
        bump,
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        init,
        payer = authority,
        seeds = [b"nano_usd_mint"],
        bump,
        mint::decimals = NANOUSD_DECIMALS,
        mint::authority = nano_usd_authority,
    )]
    pub nano_usd_mint: Account<'info, Mint>,

    /// CHECK: PDA signer only — used as mint authority for NanoUSD. Never stores data.
    #[account(
        seeds = [b"nano_usd_authority"],
        bump,
    )]
    pub nano_usd_authority: UncheckedAccount<'info>,

    /// CHECK: Treasury wallet pubkey — stored in VaultConfig for interest accumulation.
    pub protocol_treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let vault_config = &mut ctx.accounts.vault_config;

    vault_config.authority = ctx.accounts.authority.key();
    vault_config.nano_usd_mint = ctx.accounts.nano_usd_mint.key();
    vault_config.protocol_treasury = ctx.accounts.protocol_treasury.key();
    vault_config.paused = false;
    vault_config.bump = ctx.bumps.vault_config;
    vault_config.nano_usd_authority_bump = ctx.bumps.nano_usd_authority;

    msg!("NanoRemit Vault initialized");
    msg!("NanoUSD mint: {}", ctx.accounts.nano_usd_mint.key());
    msg!("Treasury: {}", ctx.accounts.protocol_treasury.key());

    Ok(())
}
