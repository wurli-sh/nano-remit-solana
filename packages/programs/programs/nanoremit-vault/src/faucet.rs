use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount},
};

use crate::errors::VaultError;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct Faucet<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"vault_config"],
        bump = vault_config.bump,
        constraint = vault_config.authority == authority.key() @ VaultError::Unauthorized,
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        mut,
        address = vault_config.nano_usd_mint,
    )]
    pub nano_usd_mint: Account<'info, Mint>,

    /// CHECK: PDA signer for mint operations.
    #[account(
        seeds = [b"nano_usd_authority"],
        bump = vault_config.nano_usd_authority_bump,
    )]
    pub nano_usd_authority: UncheckedAccount<'info>,

    /// CHECK: Recipient wallet address.
    pub recipient: UncheckedAccount<'info>,

    /// Recipient's NanoUSD ATA — created if it doesn't exist.
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = nano_usd_mint,
        associated_token::authority = recipient,
    )]
    pub recipient_nano_usd_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Faucet>, amount: u64) -> Result<()> {
    require!(amount > 0, VaultError::ZeroAmount);

    let seeds: &[&[u8]] = &[
        b"nano_usd_authority",
        &[ctx.accounts.vault_config.nano_usd_authority_bump],
    ];
    let signer_seeds = &[seeds];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.nano_usd_mint.to_account_info(),
        to: ctx.accounts.recipient_nano_usd_ata.to_account_info(),
        authority: ctx.accounts.nano_usd_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    token::mint_to(cpi_ctx, amount)?;

    msg!(
        "Faucet: minted {} NanoUSD to {}",
        amount,
        ctx.accounts.recipient.key()
    );

    Ok(())
}
