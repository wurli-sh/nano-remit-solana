use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use crate::constants::{MAX_DEPOSITS_PER_USER, MPL_TOKEN_METADATA_ID};
use crate::errors::VaultError;
use crate::events::Deposited;
use crate::state::{DepositEntry, UserVault, VaultConfig};

#[derive(Accounts)]
pub struct DepositReceipt<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"vault_config"],
        bump = vault_config.bump,
        constraint = !vault_config.paused @ VaultError::Paused,
    )]
    pub vault_config: Account<'info, VaultConfig>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 128, // padded
        seeds = [b"user_vault", user.key().as_ref()],
        bump,
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        init,
        payer = user,
        space = 8 + 96, // padded
        seeds = [b"deposit", user.key().as_ref(), nft_mint.key().as_ref()],
        bump,
    )]
    pub deposit_entry: Account<'info, DepositEntry>,

    /// The NFT mint account (supply = 1 for a valid NFT).
    pub nft_mint: Account<'info, Mint>,

    /// User's ATA holding the NFT. Must contain exactly 1 token.
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = user,
        constraint = user_nft_ata.amount == 1 @ VaultError::DepositNotFound,
    )]
    pub user_nft_ata: Account<'info, TokenAccount>,

    /// Vault escrow ATA for the deposited NFT. Owned by vault_config PDA.
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = nft_mint,
        associated_token::authority = vault_config,
    )]
    pub vault_nft_escrow: Account<'info, TokenAccount>,

    /// CHECK: Metaplex metadata PDA. Verified in handler via address derivation + owner check.
    pub nft_metadata: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DepositReceipt>) -> Result<()> {
    // Verify NFT metadata account is a valid Metaplex metadata PDA
    let nft_mint_key = ctx.accounts.nft_mint.key();
    let (expected_metadata, _) = Pubkey::find_program_address(
        &[
            b"metadata",
            MPL_TOKEN_METADATA_ID.as_ref(),
            nft_mint_key.as_ref(),
        ],
        &MPL_TOKEN_METADATA_ID,
    );
    require!(
        ctx.accounts.nft_metadata.key() == expected_metadata,
        VaultError::InvalidMetadata
    );
    require!(
        *ctx.accounts.nft_metadata.owner == MPL_TOKEN_METADATA_ID,
        VaultError::InvalidMetadata
    );

    // Verify this is a true NFT (supply == 1), not a semi-fungible token
    require!(
        ctx.accounts.nft_mint.supply == 1,
        VaultError::InvalidMetadata
    );

    // Initialize UserVault on first deposit
    let user_vault = &mut ctx.accounts.user_vault;
    if user_vault.user == Pubkey::default() {
        user_vault.user = ctx.accounts.user.key();
        user_vault.bump = ctx.bumps.user_vault;
        user_vault.tier = 0; // unset → treated as Tier 1
        user_vault.debt = 0;
        user_vault.last_accrual = 0;
        user_vault.repayment_count = 0;
        user_vault.deposit_count = 0;
    }

    // Enforce max deposits
    require!(
        user_vault.deposit_count < MAX_DEPOSITS_PER_USER,
        VaultError::MaxDepositsReached
    );

    // Populate deposit entry
    let deposit_entry = &mut ctx.accounts.deposit_entry;
    deposit_entry.user = ctx.accounts.user.key();
    deposit_entry.nft_mint = nft_mint_key;
    deposit_entry.deposited_at = Clock::get()?.unix_timestamp;
    deposit_entry.bump = ctx.bumps.deposit_entry;

    // Increment deposit count
    user_vault.deposit_count = user_vault
        .deposit_count
        .checked_add(1)
        .ok_or(VaultError::MaxDepositsReached)?;

    // Transfer NFT from user → vault escrow (user signs)
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_nft_ata.to_account_info(),
        to: ctx.accounts.vault_nft_escrow.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        1,
    )?;

    emit!(Deposited {
        user: ctx.accounts.user.key(),
        nft_mint: nft_mint_key,
    });

    Ok(())
}
