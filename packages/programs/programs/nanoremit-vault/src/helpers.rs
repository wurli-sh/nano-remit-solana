use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo};

use crate::constants::{get_rate_for_tier, SECONDS_PER_YEAR};
use crate::errors::VaultError;
use crate::state::UserVault;

/// Accrue simple interest on the user's debt.
///
/// Formula: `interest = debt * rate_bps * elapsed / (10_000 * SECONDS_PER_YEAR)`
///
/// Mints accrued interest to the protocol treasury ATA to keep
/// total NanoUSD supply == total system debt.
///
/// Called by `borrow` and `repay` instructions before modifying debt.
pub fn accrue_interest<'info>(
    user_vault: &mut UserVault,
    nano_usd_mint_info: AccountInfo<'info>,
    nano_usd_authority_info: AccountInfo<'info>,
    treasury_ata_info: AccountInfo<'info>,
    token_program_info: AccountInfo<'info>,
    nano_usd_authority_bump: u8,
    clock: &Clock,
) -> Result<()> {
    // Guard: skip accrual if no existing debt (prevents phantom interest on first borrow)
    if user_vault.debt == 0 {
        user_vault.last_accrual = clock.unix_timestamp;
        return Ok(());
    }

    let rate_bps = get_rate_for_tier(user_vault.tier) as u128;
    let elapsed_i64 = clock.unix_timestamp.saturating_sub(user_vault.last_accrual);
    let elapsed = u128::try_from(
        u64::try_from(elapsed_i64).map_err(|_| VaultError::MathOverflow)?,
    )
    .map_err(|_| VaultError::MathOverflow)?;

    // interest = debt * rate_bps * elapsed / (10_000 * SECONDS_PER_YEAR)
    // Uses u128 intermediates to prevent overflow (u64 overflows at ~1 NanoUSD over 1 year)
    let debt_128 = user_vault.debt as u128;
    let denominator = 10_000u128
        .checked_mul(SECONDS_PER_YEAR as u128)
        .ok_or(VaultError::MathOverflow)?;
    let interest_128 = debt_128
        .checked_mul(rate_bps)
        .ok_or(VaultError::MathOverflow)?
        .checked_mul(elapsed)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(denominator)
        .ok_or(VaultError::MathOverflow)?;
    let interest = u64::try_from(interest_128).map_err(|_| VaultError::MathOverflow)?;

    user_vault.debt = user_vault
        .debt
        .checked_add(interest)
        .ok_or(VaultError::MathOverflow)?;
    user_vault.last_accrual = clock.unix_timestamp;

    // Mint interest to protocol treasury
    if interest > 0 {
        let seeds: &[&[u8]] = &[b"nano_usd_authority", &[nano_usd_authority_bump]];
        let signer_seeds = &[seeds];

        let cpi_accounts = MintTo {
            mint: nano_usd_mint_info,
            to: treasury_ata_info,
            authority: nano_usd_authority_info,
        };
        let cpi_ctx = CpiContext::new_with_signer(token_program_info, cpi_accounts, signer_seeds);
        token::mint_to(cpi_ctx, interest)?;
    }

    Ok(())
}
