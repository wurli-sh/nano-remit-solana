use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Insufficient collateral for this borrow amount")]
    InsufficientCollateral,

    #[msg("Debt must be zero before withdrawal")]
    DebtNotZero,

    #[msg("Invalid tier value (must be 1-3)")]
    InvalidTier,

    #[msg("Amount must be greater than zero")]
    ZeroAmount,

    #[msg("Unauthorized: signer is not the expected authority")]
    Unauthorized,

    #[msg("Deposit entry not found for this NFT")]
    DepositNotFound,

    #[msg("Maximum deposits per user reached")]
    MaxDepositsReached,

    #[msg("Vault is paused")]
    Paused,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Invalid NFT metadata account")]
    InvalidMetadata,

    #[msg("Insufficient repayment history for requested tier")]
    InsufficientRepayments,
}
