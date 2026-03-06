use anchor_lang::prelude::*;

use crate::errors::VaultError;
use crate::events::TierUpdated;
use crate::state::{UserVault, VaultConfig};

#[derive(Accounts)]
pub struct SetTier<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"vault_config"],
        bump = vault_config.bump,
        constraint = vault_config.authority == authority.key() @ VaultError::Unauthorized,
    )]
    pub vault_config: Account<'info, VaultConfig>,

    /// CHECK: The user whose tier is being updated. Used for PDA derivation only.
    pub user: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"user_vault", user.key().as_ref()],
        bump = user_vault.bump,
    )]
    pub user_vault: Account<'info, UserVault>,
}

pub fn handler(ctx: Context<SetTier>, new_tier: u8) -> Result<()> {
    require!((1..=3).contains(&new_tier), VaultError::InvalidTier);

    let user_vault = &mut ctx.accounts.user_vault;

    // Enforce minimum repayment count for the requested tier
    let min_repayments = crate::constants::MIN_REPAYMENTS[(new_tier - 1) as usize];
    require!(
        user_vault.repayment_count >= min_repayments,
        VaultError::InsufficientRepayments
    );

    let old_tier = user_vault.tier;
    user_vault.tier = new_tier;

    emit!(TierUpdated {
        user: ctx.accounts.user.key(),
        old_tier,
        new_tier,
    });

    Ok(())
}
