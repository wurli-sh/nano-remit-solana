use anchor_lang::prelude::*;

use crate::errors::VaultError;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct Pause<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_config"],
        bump = vault_config.bump,
        constraint = vault_config.authority == authority.key() @ VaultError::Unauthorized,
    )]
    pub vault_config: Account<'info, VaultConfig>,
}

pub fn pause_handler(ctx: Context<Pause>) -> Result<()> {
    ctx.accounts.vault_config.paused = true;
    msg!("Vault paused");
    Ok(())
}

pub fn unpause_handler(ctx: Context<Pause>) -> Result<()> {
    ctx.accounts.vault_config.paused = false;
    msg!("Vault unpaused");
    Ok(())
}
