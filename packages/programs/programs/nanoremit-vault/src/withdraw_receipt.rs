use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use crate::errors::VaultError;
use crate::events::Withdrawn;
use crate::state::{DepositEntry, UserVault, VaultConfig};

#[derive(Accounts)]
pub struct WithdrawReceipt<'info> {
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
        constraint = user_vault.debt == 0 @ VaultError::DebtNotZero,
    )]
    pub user_vault: Account<'info, UserVault>,

    /// Closed on withdraw — rent returned to user.
    #[account(
        mut,
        close = user,
        seeds = [b"deposit", user.key().as_ref(), nft_mint.key().as_ref()],
        bump = deposit_entry.bump,
        constraint = deposit_entry.user == user.key() @ VaultError::Unauthorized,
    )]
    pub deposit_entry: Account<'info, DepositEntry>,

    pub nft_mint: Account<'info, Mint>,

    /// Vault escrow ATA holding the deposited NFT.
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = vault_config,
    )]
    pub vault_nft_escrow: Account<'info, TokenAccount>,

    /// User's ATA to receive the NFT back.
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = nft_mint,
        associated_token::authority = user,
    )]
    pub user_nft_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WithdrawReceipt>) -> Result<()> {
    let user_vault = &mut ctx.accounts.user_vault;

    // Decrement deposit count
    user_vault.deposit_count = user_vault
        .deposit_count
        .checked_sub(1)
        .ok_or(VaultError::DepositNotFound)?;

    // Transfer NFT from vault escrow → user (VaultConfig PDA signs)
    let seeds: &[&[u8]] = &[b"vault_config", &[ctx.accounts.vault_config.bump]];
    let signer_seeds = &[seeds];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_nft_escrow.to_account_info(),
        to: ctx.accounts.user_nft_ata.to_account_info(),
        authority: ctx.accounts.vault_config.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        ),
        1,
    )?;

    emit!(Withdrawn {
        user: ctx.accounts.user.key(),
        nft_mint: ctx.accounts.nft_mint.key(),
    });

    Ok(())
}
